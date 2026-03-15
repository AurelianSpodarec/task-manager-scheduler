import type { ComponentType, CSSProperties } from 'react'
import type { EventColor } from '@/types/shared'
export type { EventColor }

export type WorkHoursConfig = {
  startHour: number
  endHour: number
  /** Day-of-week indices where work hours apply (0=Sun, 6=Sat) */
  daysOfWeek: number[]
}

export type WeekStartDay = 0 | 1

export type ViewMode = 'week' | 'month'

export type SlotDuration = 15 | 30 | 60

/**
 * Calendar-level event — layout + consumer-provided visuals.
 * Domain fields (status, priority, etc.) live in the consumer's data model
 * and are mapped to className/style/icon when building events.
 */
export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  isAllDay: boolean
  color: EventColor
  /** Consumer CSS classes applied to the event card */
  className?: string
  /** Consumer inline styles (borders, backgrounds, etc.) */
  style?: CSSProperties
  /** Consumer-provided leading icon component */
  icon?: ComponentType<{ className?: string; animate?: boolean }>
  /** Opaque consumer data carried through the drag pipeline */
  dragMeta?: unknown
}

export type TimeSlot = {
  day: Date
  hour: number
  minute: number
}

/** Positioned rect for rendering an event in the week view grid */
export type EventLayoutRect = {
  event: CalendarEvent
  /** Fractional column index (0-based) within overlapping group */
  column: number
  /** Total columns in overlap group */
  totalColumns: number
  /** Pixel offset from top of the day grid */
  top: number
  /** Pixel height */
  height: number
}
