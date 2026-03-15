import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { X, SendHorizonal, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import './chat.css'

type ChatMessage = {
  id: string
  role: 'bot' | 'user'
  content: string
  isError?: boolean
}

const GREETING = `Welcome to FiveCast! I'm Crystal, your AI assistant.

Think of me as your crystal ball for time — I help schedule events, track tasks, and keep everything running ahead of schedule.

You can ask things like:
• "Schedule a meeting tomorrow at 10"
• "What's on my calendar today?"
• "How many hours are assigned to Project X?"
• "Generate a weekly report"

What would you like to plan?`

const TYPING_DELAY_MS = 1500

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

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 text-zinc-400">
      <span className="chat-typing-dot" />
      <span className="chat-typing-dot" />
      <span className="chat-typing-dot" />
    </span>
  )
}

let msgCounter = 0
function nextId() {
  return `msg-${++msgCounter}`
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  // Kick off greeting sequence when chat opens
  useEffect(() => {
    if (!open) return

    // Reset state for a fresh conversation each time
    setMessages([])
    setIsTyping(true)
    msgCounter = 0

    const timer = setTimeout(() => {
      setMessages([{ id: nextId(), role: 'bot', content: GREETING }])
      setIsTyping(false)
    }, TYPING_DELAY_MS)

    return () => clearTimeout(timer)
  }, [open])

  // Auto-scroll on new messages or typing state change
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Focus input when panel opens and greeting finishes
  useEffect(() => {
    if (open && !isTyping) inputRef.current?.focus()
  }, [open, isTyping])

  const handleSend = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const text = input.trim()
      if (!text) return

      const userMsg: ChatMessage = { id: nextId(), role: 'user', content: text }
      const errorMsg: ChatMessage = {
        id: nextId(),
        role: 'bot',
        content: 'No API Token',
        isError: true,
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsTyping(true)

      // Brief delay before showing the error so it feels like a real round-trip
      setTimeout(() => {
        setMessages((prev) => [...prev, errorMsg])
        setIsTyping(false)
      }, 800)
    },
    [input],
  )

  return (
    <>
      {/* ---- Chat panel ---- */}
      {open && (
        <div
          className={cn(
            'fixed right-5 bottom-20 z-50 flex w-[360px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl',
            'animate-in fade-in slide-in-from-bottom-4 duration-200',
            'dark:border-zinc-700 dark:bg-zinc-900',
          )}
          style={{ height: 460 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-zinc-900 px-4 py-3 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <LaserLogo className="size-5 text-red-500" />
              <span className="text-[14px] font-semibold text-white">
                AI Assistant
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
                  <span>{msg.content}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-zinc-100 px-4 py-2.5 dark:bg-zinc-800">
                  <TypingIndicator />
                </div>
              </div>
            )}
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
