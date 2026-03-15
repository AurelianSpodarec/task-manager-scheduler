import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { X, SendHorizonal, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import crystalSplash from '@/assets/crystal-splash.gif'
import './chat.css'

type ChatMessage = {
  id: string
  role: 'bot' | 'user'
  content: string
  isError?: boolean
}

const GREETING = `Welcome to FiveCast — I'm Crystal.

Your AI assistant for scheduling, tasks, and time insights.

Think of me as your crystal ball for time — I help organise your schedule, track tasks, and keep everything ahead of plan.

Try asking:
• "Schedule a meeting tomorrow at 10"
• "What's on my calendar today?"
• "How many hours are assigned to Project X?"
• "Generate a weekly report"

What would you like to plan?`

const STREAM_INTERVAL_MS = 80
const SPLASH_DURATION_MS = 2000

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

  const handleSend = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const text = input.trim()
      if (!text || streamingMsgId) return

      const userMsg: ChatMessage = { id: nextId(), role: 'user', content: text }
      const errorId = nextId()

      setMessages((prev) => [...prev, userMsg])
      setInput('')

      // Brief delay then show error (too short to stream)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: errorId, role: 'bot', content: 'No API Token', isError: true },
        ])
      }, 800)
    },
    [input, streamingMsgId],
  )

  return (
    <>
      {/* ---- Chat panel ---- */}
      {open && (
        <div
          className={cn(
'fixed right-5 bottom-20 z-50 flex w-[420px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl',
            'animate-in fade-in slide-in-from-bottom-4 duration-200',
            'dark:border-zinc-700 dark:bg-zinc-900',
          )}
style={{ height: 490 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-zinc-900 px-4 py-3 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <LaserLogo className="size-5 text-red-500" />
              <span className="text-[14px] font-semibold text-white">
                FiveCast AI Assistant
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              aria-label="Close chat"
            >
              <X className="size-4" />
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
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
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
                    'max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed',
                    msg.role === 'user' &&
                      'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900',
                    msg.role === 'bot' &&
                      !msg.isError &&
                      'whitespace-pre-line bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
                    msg.isError &&
                      'flex items-start gap-1.5 border border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400',
                  )}
                >
                  {msg.isError && (
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  )}
                  {msg.id === streamingMsgId ? (
                    <StreamingText tokens={tokensRef.current} visibleCount={visibleWords} />
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
              </div>
            ))}

          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-zinc-200 px-3 py-2.5 dark:border-zinc-700"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="h-9 flex-1 rounded-lg border border-zinc-200 bg-transparent px-3 text-[13px] text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-600"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              aria-label="Send message"
            >
              <SendHorizonal className="size-4" />
            </button>
          </form>
        </div>
      )}

      {/* ---- Floating trigger ---- */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'fixed right-5 bottom-5 z-50 inline-flex size-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500',
          open
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-red-600 text-white hover:bg-red-700',
        )}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <X className="size-5" />
        ) : (
          <LaserLogo className="size-6" />
        )}
      </button>
    </>
  )
}
