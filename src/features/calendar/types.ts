export type WorkHoursConfig = {
  startHour: number
  endHour: number
  /** Day-of-week indices where work hours apply (0=Sun, 6=Sat) */
  daysOfWeek: number[]
}

export type WeekStartDay = 0 | 1

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

export type EventPriority = 'none' | 'low' | 'medium' | 'high' | 'critical'

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
  priority: EventPriority
  description?: string
  participants?: Participant[]
  /** Source sidebar task ID — links back to the task pool */
  sourceTaskId?: string
  /** Set for personal activities — drives icon + colored styling on the calendar */
  personalActivityType?: string
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
  isAllDay?: boolean
}

export type DragPointer = {
  clientX: number
  clientY: number
}

export type TaskDragMeta = {
  clientName: string
  dueDateLabel: string | null
  isRecurring: boolean
  recurringType?: 'standard' | 'retainer'
  durationLabel: string
  priority: EventPriority
}

export type PersonalDragMeta = {
  activityType: string
  durationLabel: string
}

export type EventDragMeta = {
  status: EventStatus
  priority: EventPriority
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
  sidebarDropHovered: boolean
  personalActivityType?: string
  taskMeta?: TaskDragMeta
  personalMeta?: PersonalDragMeta
  eventMeta?: EventDragMeta
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
