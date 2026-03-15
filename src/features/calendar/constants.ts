import type { EventColor } from './types'

/** Pixel height of one 60-min slot (matches --cal-slot-h: 3.5rem ≈ 56px) */
export const HOUR_HEIGHT_PX = 56

/** Maps event color keys → CSS custom properties for bg + text */
export const EVENT_COLOR_MAP: Record<EventColor, { bg: string; text: string; border: string }> = {
  teal:    { bg: 'var(--cal-brand-teal)',    text: 'var(--cal-event-text)', border: 'var(--cal-brand-teal)' },
  purple:  { bg: 'var(--cal-brand-purple)',  text: 'var(--cal-event-text)', border: 'var(--cal-brand-purple)' },
  rose:    { bg: 'var(--cal-brand-rose)',    text: 'var(--cal-event-text)', border: 'var(--cal-brand-rose)' },
  amber:   { bg: 'var(--cal-brand-amber)',   text: 'var(--cal-brand-zinc-900)', border: 'var(--cal-brand-amber)' },
  emerald: { bg: 'var(--cal-brand-emerald)', text: 'var(--cal-event-text)', border: 'var(--cal-brand-emerald)' },
  indigo:  { bg: 'var(--cal-brand-indigo)',  text: 'var(--cal-event-text)', border: 'var(--cal-brand-indigo)' },
  blue:    { bg: 'var(--cal-brand-blue)',    text: 'var(--cal-event-text)', border: 'var(--cal-brand-blue)' },
}

export const EVENT_STATUS_INDICATOR_COLORS = {
  pendingBorder: 'var(--cal-brand-zinc-400)',
  completedFill: 'var(--cal-brand-emerald)',
} as const

