import type { EventColor, EventStatus, EventPriority, Participant } from '@/types/shared'
export type { EventColor, EventStatus, EventPriority, Participant }

export type WorkHoursConfig = {
  startHour: number
  endHour: number
  /** Day-of-week indices where work hours apply (0=Sun, 6=Sat) */
  daysOfWeek: number[]
}

export type WeekStartDay = 0 | 1

export type ViewMode = 'week' | 'month'

export type SlotDuration = 15 | 30 | 60

export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  isAllDay: boolean
  color: EventColor
  status: EventStatus
  priority: EventPriority
  description?: string
  participants?: Participant[]
  /** Source sidebar task ID — links back to the task pool */
  sourceTaskId?: string
  /** Set for personal activities — drives icon + colored styling on the calendar */
  personalActivityType?: string
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
