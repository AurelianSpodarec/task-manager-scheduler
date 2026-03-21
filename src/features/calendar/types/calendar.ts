import type { ComponentType, CSSProperties } from 'react'
import type { EventColor, Participant } from '@/types/shared'
export type { EventColor }

export type WorkHoursConfig = {
  startHour: number
  endHour: number
  /** Day-of-week indices where work hours apply (0=Sun, 6=Sat) */
  daysOfWeek: number[]
}

export type WeekStartDay = 0 | 1
export type ViewMode = 'day' | 'week' | 'month'
export type ScheduleMode = 'default' | 'static'
export type SlotDuration = 15 | 30 | 60

export type MeetingEventMeta = {
  provider: 'google' | 'zoom' | null
  participants: Participant[]
}

/**
 * Calendar-level event — layout + consumer-provided visuals.
 * Domain fields (status, priority, etc.) live in the consumer's data model
 * and are mapped to className/style/icon when building events.
 */
export type CalendarEvent = {
  id: string
  /** Original consumer-provided id; internal `id` remains a string key. */
  sourceId?: string | number
  title: string
  start: Date
  end: Date
  isAllDay: boolean
  /** Completion state used for staged visual transitions in event renderers. */
  isCompleted?: boolean
  color: EventColor
  /** Consumer CSS classes applied to the event card */
  className?: string
  /** Consumer inline styles (borders, backgrounds, etc.) */
  style?: CSSProperties
  /** Consumer-provided leading icon component */
  icon?: ComponentType<{ className?: string; animate?: boolean }>
  /** Optional display hint for non-interactive background blocks. */
  display?: 'default' | 'background'
  /** Optional variant hint for custom renderers. */
  variant?: 'filled' | 'light'
  /** Opaque consumer payload passed through render hooks/callbacks. */
  payload?: Record<PropertyKey, unknown>
  /** Optional meeting-specific payload for rich meeting rendering. */
  meetingMeta?: MeetingEventMeta
}

export type TimeSlot = {
  day: Date
  hour: number
  minute: number
}

/** Positioned rect for rendering an event in the week/day grid */
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
