import type { EventColor, EventStatus, EventPriority } from './calendar'

export type DragSource = 'sidebar' | 'calendar'

export type DragPayload = {
  source: DragSource
  eventId?: string
  title?: string
  /** For sidebar drags: duration in minutes to create the new event */
  durationMinutes?: number
  /** Original event data snapshot for reverting on cancel */
  originalEvent?: import('./calendar').CalendarEvent
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
