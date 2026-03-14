export type ViewMode = 'week' | 'month'

export type SlotDuration = 15 | 30 | 60

export type EventColor =
  | 'teal'
  | 'purple'
  | 'rose'
  | 'amber'
  | 'emerald'
  | 'indigo'
  | 'blue'

export type EventStatus = 'pending' | 'completed'

export type Participant = {
  id: string
  name: string
  avatarUrl?: string
}

export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  isAllDay: boolean
  color: EventColor
  status: EventStatus
  description?: string
  participants?: Participant[]
  /** Source sidebar task ID — links back to the task pool */
  sourceTaskId?: string
}

export type DragSource = 'sidebar' | 'calendar'

export type DragPayload = {
  source: DragSource
  eventId?: string
  title?: string
  /** For sidebar drags: duration in minutes to create the new event */
  durationMinutes?: number
  /** Original event data snapshot for reverting on cancel */
  originalEvent?: CalendarEvent
}

export type DragSlotCandidate = {
  isoDay: string
  hour: number
  minute: number
}

export type DragPointer = {
  clientX: number
  clientY: number
}

export type DragRenderState = {
  source: DragSource
  eventId?: string
  title?: string
  color: EventColor
  durationMinutes?: number
  originalStart?: number
  originalEnd?: number
  pointer: DragPointer
  pointerOffset: { x: number; y: number }
  elementSize: { width: number; height: number }
  slot: DragSlotCandidate | null
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
