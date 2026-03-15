import type { EventColor, EventPriority, TaskDragMeta, PersonalDragMeta, EventDragMeta } from '../types'

export const DRAG_TYPE = 'calendar-drag' as const
export const SLOT_TYPE = 'calendar-slot' as const

export type CalendarDragData = {
  _type: typeof DRAG_TYPE
  source: 'sidebar' | 'calendar'
  eventId?: string
  title?: string
  color?: EventColor
  durationMinutes?: number
  originalStart?: number
  originalEnd?: number
  isAllDay?: boolean
  priority?: EventPriority
  personalActivityType?: string
  taskMeta?: TaskDragMeta
  personalMeta?: PersonalDragMeta
  eventMeta?: EventDragMeta
  grabOffsetY?: number
}

export type SlotDropData = {
  _type: typeof SLOT_TYPE
  isoDay: string
  hour: number
  minute: number
  isAllDay?: boolean
}

export function isCalendarDrag(data: Record<string, unknown>): data is CalendarDragData {
  return data._type === DRAG_TYPE
}

export function roundUpToIncrement(minutes: number, incrementMinutes: number): number {
  const safeMinutes = Number.isFinite(minutes) ? Math.max(minutes, incrementMinutes) : incrementMinutes
  return Math.ceil(safeMinutes / incrementMinutes) * incrementMinutes
}
