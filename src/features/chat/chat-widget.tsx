import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { X, SendHorizonal } from 'lucide-react'
import { addDays, setHours, setMinutes, startOfDay, startOfWeek } from 'date-fns'
import { cn } from '@/lib/utils'
import crystalSplash from '@/assets/crystal-splash.gif'
import type { Task } from '@/database/schema'
import type { EventColor, EventPriority } from '@/types/shared'
import { scheduleTask, spawnScheduledTask, getUnscheduledTasks } from '@/services/task-service'
import './chat.css'

type ChatMessage = {
  id: string
  role: 'bot' | 'user'
  content: string
}

// Drives the three-state conversation flow
type ChatPhase = 'greeting' | 'planned' | 'limit'

const GREETING = `Welcome to FiveCast — I'm Crystal.

Your AI assistant for scheduling, tasks, and time insights.

Think of me as your crystal ball for time — I help organise your schedule, track tasks, and keep everything ahead of plan.

Try asking:
• "Schedule a meeting tomorrow at 10"
• "What's on my calendar today?"
• "How many hours are assigned to Project X?"
• "Generate a weekly report"

I can organise your week in seconds. Want me to do that?`

const TOKEN_LIMIT_MSG =
  `You've hit your free-tier context limit — 512 tokens per session.\n\nUpgrade to FiveCast Pro to keep planning with Crystal — of course.`

const STREAM_INTERVAL_MS = 80
const SPLASH_DURATION_MS = 2000

// ── Random task generation ────────────────────────────────────────────────
const TASK_COLORS: EventColor[] = ['teal', 'purple', 'rose', 'amber', 'emerald', 'indigo', 'blue']
const TASK_PRIORITIES: EventPriority[] = ['none', 'low', 'medium', 'high']
const TASK_POOL = [
  'Review project proposal',
  'Team sync',
  'Client follow-up',
  'Deep work session',
  'Email triage',
  'Strategy planning',
  'Code review',
  'Weekly retrospective',
  'Content review',
  'Sprint planning',
  'Design feedback',
  'Budget review',
  'Stakeholder update',
  'Focus time',
  'Progress check',
]

let aiTaskCounter = 0

/** Set hours + minutes on a base date (mirrors seed-events pattern). */
function at(base: Date, hour: number, minute = 0): Date {
  return setMinutes(setHours(base, hour), minute)
}

/** Pick a random element from an array. */
function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Build a structured Mon–Fri week:
 * - Commute (06:00–09:00) + return (17:00–19:00) on every day
 * - One day replaced with a school run in the morning
 * - Lunch every day within 12:00–13:30
 * - One dentist appointment
 * - Work tasks filling the remaining gaps
 */
export function generateWeekTasks(): Task[] {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days      = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))

  // Randomise the special-day slots
  const schoolDayIdx  = Math.floor(Math.random() * 4)                           // Mon–Thu
  const dentistDayIdx = rand([0, 1, 2, 3, 4].filter(i => i !== schoolDayIdx))

  const workQueue = [...TASK_POOL].sort(() => Math.random() - 0.5)
  let   wi        = 0
  const tasks: Task[] = []

  function push(fields: { title: string; start: Date; end: Date; color: EventColor; status: 'pending'; priority: EventPriority; personalActivityType?: string }) {
    const id = `ai-${Date.now()}-${aiTaskCounter++}`
    const isPersonal = fields.personalActivityType != null
    tasks.push({
      id,
      title: fields.title,
      type: isPersonal ? 'personal' : 'work',
      durationMinutes: Math.round((fields.end.getTime() - fields.start.getTime()) / 60_000),
      priority: fields.priority,
      status: fields.status,
      color: fields.color,
      personalActivityType: fields.personalActivityType as Task['personalActivityType'],
      schedule: { start: fields.start.toISOString(), end: fields.end.toISOString(), isAllDay: false },
    })
  }

  for (let di = 0; di < 5; di++) {
    const base        = startOfDay(days[di])
    const isSchoolDay = di === schoolDayIdx
    const hasDentist  = di === dentistDayIdx

    // ── Morning: school run OR commute drive (06:00–09:00) ────────────────
    if (isSchoolDay) {
      push({ title: 'School Run', start: at(base, 8), end: at(base, 9),
        color: 'amber', status: 'pending', priority: 'none',
        personalActivityType: 'schoolRun' })
    } else {
      // Start randomly at 06:00, 06:30, 07:00 or 07:30; always ~1.5 h
      const mStart = at(base, Math.random() < 0.5 ? 6 : 7, Math.random() < 0.5 ? 0 : 30)
      push({ title: 'Driving',
        start: mStart, end: new Date(mStart.getTime() + 90 * 60_000),
        color: 'indigo', status: 'pending', priority: 'none',
        personalActivityType: 'driving' })
    }

    // ── Morning work (09:15–) — shortened on dentist days ─────────────────
    if (hasDentist) {
      // Short block before the dentist
      if (wi < workQueue.length)
        push({ title: workQueue[wi++], start: at(base, 9, 15), end: at(base, 10, 15),
          color: rand(TASK_COLORS), status: 'pending',
          priority: rand(TASK_PRIORITIES) })
      push({ title: 'Dentist', start: at(base, 10, 30), end: at(base, 11, 30),
        color: 'emerald', status: 'pending', priority: 'none',
        personalActivityType: 'dentist' })
    } else {
      if (wi < workQueue.length)
        push({ title: workQueue[wi++], start: at(base, 9, 15), end: at(base, 11, 30),
          color: rand(TASK_COLORS), status: 'pending',
          priority: rand(TASK_PRIORITIES) })
    }

    // ── Lunch (12:00–13:30 window, 60 min) ────────────────────────────────
    const lStart = at(base, 12, Math.random() < 0.6 ? 0 : 30)
    push({ title: 'Lunch',
      start: lStart, end: new Date(lStart.getTime() + 60 * 60_000),
      color: 'rose', status: 'pending', priority: 'none',
      personalActivityType: 'lunch' })

    // ── Afternoon work (13:30–17:00, two blocks) ──────────────────────────
    if (wi < workQueue.length)
      push({ title: workQueue[wi++], start: at(base, 13, 30), end: at(base, 15),
        color: rand(TASK_COLORS), status: 'pending',
        priority: rand(TASK_PRIORITIES) })
    if (wi < workQueue.length)
      push({ title: workQueue[wi++], start: at(base, 15, 15), end: at(base, 17),
        color: rand(TASK_COLORS), status: 'pending',
        priority: rand(TASK_PRIORITIES) })

    // ── Evening commute (17:00–19:00 window, ~1.5 h) ──────────────────────
    const eStart = at(base, 17, Math.random() < 0.5 ? 0 : 30)
    push({ title: 'Driving',
      start: eStart, end: new Date(eStart.getTime() + 90 * 60_000),
      color: 'indigo', status: 'pending', priority: 'none',
      personalActivityType: 'driving' })
  }

  return tasks
}

// ── Sidebar-aware week scheduling ─────────────────────────────────────────
type ScheduleAction =
  | { kind: 'schedule'; taskId: string; start: Date; end: Date }
  | { kind: 'spawn'; templateId: string; start: Date; end: Date }

/**
 * Build a Mon–Fri schedule using actual sidebar tasks:
 * - Personal activities are spawned from their templates
 * - Work tasks are pulled from the unscheduled sidebar pool
 */
function generateWeekSchedule(): ScheduleAction[] {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))

  const schoolDayIdx = Math.floor(Math.random() * 4)
  const dentistDayIdx = rand([0, 1, 2, 3, 4].filter(i => i !== schoolDayIdx))

  const workPool = [...getUnscheduledTasks('work')].sort(() => Math.random() - 0.5)
  let wi = 0
  const actions: ScheduleAction[] = []

  function spawn(templateId: string, start: Date, end: Date) {
    actions.push({ kind: 'spawn', templateId, start, end })
  }

  function scheduleNext(start: Date, end: Date) {
    if (wi >= workPool.length) return
    actions.push({ kind: 'schedule', taskId: workPool[wi++].id, start, end })
  }

  for (let di = 0; di < 5; di++) {
    const base = startOfDay(days[di])
    const isSchoolDay = di === schoolDayIdx
    const hasDentist = di === dentistDayIdx

    // Morning: school run OR commute
    if (isSchoolDay) {
      spawn('personal-school-run', at(base, 8), at(base, 9))
    } else {
      const mStart = at(base, Math.random() < 0.5 ? 6 : 7, Math.random() < 0.5 ? 0 : 30)
      spawn('personal-driving', mStart, new Date(mStart.getTime() + 90 * 60_000))
    }

    // Morning work — shortened on dentist days
    if (hasDentist) {
      scheduleNext(at(base, 9, 15), at(base, 10, 15))
      spawn('personal-dentist', at(base, 10, 30), at(base, 11, 30))
    } else {
      scheduleNext(at(base, 9, 15), at(base, 11, 30))
    }

    // Lunch
    const lStart = at(base, 12, Math.random() < 0.6 ? 0 : 30)
    spawn('personal-lunch', lStart, new Date(lStart.getTime() + 60 * 60_000))

    // Afternoon work (two blocks)
    scheduleNext(at(base, 13, 30), at(base, 15))
    scheduleNext(at(base, 15, 15), at(base, 17))

    // Evening commute
    const eStart = at(base, 17, Math.random() < 0.5 ? 0 : 30)
    spawn('personal-driving', eStart, new Date(eStart.getTime() + 90 * 60_000))
  }

  return actions
}

function LaserLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      viewBox="0 0 45.1 45.1"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="m32.1 19.1-6.6 13.2 6.4 12.9H26l-6.4-12.9 6.6-13.2-3.6-7.2-14 27.8H16l2.7 5.4H0L22.5 0zm3.6 7.2-3 5.9 6.4 12.9H45z"
      />
    </svg>
  )
}

let msgCounter = 0
function nextId() {
  return `msg-${++msgCounter}`
}

/** Split text into streamable tokens (words, preserving leading whitespace/newlines). */
function tokenize(text: string): string[] {
  const tokens: string[] = []
  const re = /(\s*\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) tokens.push(m[1])
  return tokens
}

/** Renders text word-by-word with a fade-in animation up to `visibleCount`. */
function StreamingText({ tokens, visibleCount }: { tokens: string[]; visibleCount: number }) {
  return (
    <>
      {tokens.map((token, i) => {
        if (i >= visibleCount) return null
        // Preserve leading newlines as <br/> so whitespace-pre-line isn't needed
        const newlines = token.match(/^\n+/)
        return (
          <span key={i}>
            {newlines && Array.from({ length: newlines[0].length }, (_, j) => <br key={j} />)}
            <span className={i === visibleCount - 1 ? 'chat-word-reveal' : undefined}>
              {newlines ? token.slice(newlines[0].length) : token}
            </span>
          </span>
        )
      })}
    </>
  )
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [splash, setSplash] = useState<'visible' | 'fading' | 'done'>('done')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatPhase, setChatPhase] = useState<ChatPhase>('greeting')
  const [isThinking, setIsThinking] = useState(false)
  const [input, setInput] = useState('')
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null)
  const [visibleWords, setVisibleWords] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const tokensRef = useRef<string[]>([])

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  // Stream words one-by-one with fade-in
  useEffect(() => {
    if (!streamingMsgId) return

    const iv = setInterval(() => {
      setVisibleWords((prev) => {
        const next = prev + 1
        if (next >= tokensRef.current.length) {
          clearInterval(iv)
          setStreamingMsgId(null)
        }
        return next
      })
    }, STREAM_INTERVAL_MS)

    return () => clearInterval(iv)
  }, [streamingMsgId])

  // Show splash then kick off greeting stream
  useEffect(() => {
    if (!open) return

    setSplash('visible')
    setMessages([])
    setStreamingMsgId(null)
    setChatPhase('greeting')
    setIsThinking(false)
    msgCounter = 0

    const fadeTimer = setTimeout(() => setSplash('fading'), SPLASH_DURATION_MS)
    // After fade-out animation completes (~400ms), start the chat
    const doneTimer = setTimeout(() => {
      setSplash('done')
      const id = nextId()
      tokensRef.current = tokenize(GREETING)
      setVisibleWords(0)
      setMessages([{ id, role: 'bot', content: GREETING }])
      setStreamingMsgId(id)
    }, SPLASH_DURATION_MS + 400)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
      setStreamingMsgId(null)
    }
  }, [open])

  // Auto-scroll as words reveal
  useEffect(() => {
    scrollToBottom()
  }, [visibleWords, messages, scrollToBottom])

  // Focus input once streaming finishes
  useEffect(() => {
    if (open && !streamingMsgId) inputRef.current?.focus()
  }, [open, streamingMsgId])

  /** Stream a bot reply — shared by both the plan confirmation and the limit gate. */
  const streamReply = useCallback((content: string) => {
    const id = nextId()
    tokensRef.current = tokenize(content)
    setVisibleWords(0)
    setMessages((prev) => [...prev, { id, role: 'bot', content }])
    setStreamingMsgId(id)
  }, [])

  const handleSend = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const text = input.trim()
      if (!text || streamingMsgId) return

      setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: text }])
      setInput('')

      if (chatPhase === 'greeting') {
        const actions = generateWeekSchedule()

        // Show thinking indicator immediately
        setIsThinking(true)

        // Drip each action onto the calendar so it visibly fills up
        const interval = 2400 / actions.length
        actions.forEach((a, i) => {
          setTimeout(() => {
            if (a.kind === 'spawn') spawnScheduledTask(a.templateId, a.start, a.end, false)
            else scheduleTask(a.taskId, a.start, a.end, false)
          }, i * interval)
        })

        // Once the last task has landed, kill the thinking bubble and stream reply
        setTimeout(() => {
          setIsThinking(false)
          streamReply('Your week has been organised.')
          setChatPhase('planned')
        }, 2500)
      } else {
        // Any subsequent message hits the token gate
        setTimeout(() => {
          streamReply(TOKEN_LIMIT_MSG)
          setChatPhase('limit')
        }, 400)
      }
    },
    [input, streamingMsgId, chatPhase, streamReply],
  )

  return (
    <>
      {/* ---- Chat panel ---- */}
      {open && (
        <div
          className={cn(
            'fixed right-4 bottom-16 z-50 flex w-[336px] flex-col overflow-hidden rounded-[0.8rem] border border-zinc-200 bg-white shadow-xl',
            'animate-in fade-in slide-in-from-bottom-4 duration-200',
            'dark:border-zinc-700 dark:bg-zinc-900',
          )}
          style={{ height: 392 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-zinc-900 px-[0.8rem] py-[0.6rem] dark:bg-zinc-950">
            <div className="flex items-center gap-[0.4rem]">
              <LaserLogo className="size-[1rem] text-red-500" />
              <span className="text-[11.2px] font-semibold text-white">
                FiveCast AI Assistant
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-[1.4rem] items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              aria-label="Close chat"
            >
              <X className="size-[0.8rem]" />
            </button>
          </div>

          {/* Splash screen */}
          {splash !== 'done' && (
            <div
              className={cn(
                'absolute inset-0 z-10 flex items-center justify-center bg-zinc-900',
                splash === 'fading' && 'chat-splash-fade-out',
              )}
            >
              <img
                src={crystalSplash}
                alt="Crystal AI loading"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-[0.6rem] overflow-y-auto px-[0.8rem] py-[0.8rem]"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-[0.6rem] px-[0.6rem] py-[0.4rem] text-[10.4px] leading-relaxed',
                    msg.role === 'user' &&
                      'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900',
                    msg.role === 'bot' &&
                      'whitespace-pre-line bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
                  )}
                >
                  {msg.id === streamingMsgId ? (
                    <StreamingText tokens={tokensRef.current} visibleCount={visibleWords} />
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking indicator — visible while Crystal is planning */}
            {isThinking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-[0.2rem] rounded-[0.6rem] bg-zinc-100 px-[0.6rem] py-[0.5rem] text-zinc-500 dark:bg-zinc-800">
                  <span className="chat-thinking-dot" />
                  <span className="chat-thinking-dot" />
                  <span className="chat-thinking-dot" />
                </div>
              </div>
            )}

          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-[0.4rem] border-t border-zinc-200 px-[0.6rem] py-[0.5rem] dark:border-zinc-700"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="h-[1.8rem] flex-1 rounded-lg border border-zinc-200 bg-transparent px-[0.6rem] text-[10.4px] text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-600"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex size-[1.8rem] items-center justify-center rounded-lg bg-zinc-900 text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              aria-label="Send message"
            >
              <SendHorizonal className="size-[0.8rem]" />
            </button>
          </form>
        </div>
      )}

      {/* ---- Floating trigger ---- */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'fixed right-4 bottom-4 z-50 inline-flex size-[2.8rem] items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500',
          open
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-red-600 text-white hover:bg-red-700',
        )}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <X className="size-[1rem]" />
        ) : (
          <LaserLogo className="size-[1.2rem]" />
        )}
      </button>
    </>
  )
}
