import type { CalendarEvent, EventColor, EventPriority, TaskDragMeta, PersonalDragMeta } from '../types'
import { getSlotDuration } from '../stores/ui-store'
import { DRAG_TYPE, SLOT_TYPE, roundUpToIncrement, type CalendarDragData, type SlotDropData } from './types'

/** Build drag data for an existing calendar event. */
export function makeEventDragData(event: CalendarEvent): CalendarDragData {
  const slotDuration = getSlotDuration()
  const durationMinutes = Math.max(1, Math.ceil((event.end.getTime() - event.start.getTime()) / 60000))
  const snappedDurationMinutes = roundUpToIncrement(durationMinutes, slotDuration)
  return {
    _type: DRAG_TYPE,
    source: 'calendar',
    eventId: event.id,
    title: event.title,
    color: event.color,
    durationMinutes: event.isAllDay ? 60 : snappedDurationMinutes,
    originalStart: event.start.getTime(),
    originalEnd: event.end.getTime(),
    isAllDay: event.isAllDay,
    priority: event.priority,
    personalActivityType: event.personalActivityType,
    eventMeta: { status: event.status, priority: event.priority },
  }
}

/** Build drag data for a sidebar task. */
export function makeSidebarDragData(
  taskId: string,
  title: string,
  durationMinutes: number,
  priority: EventPriority = 'none',
  meta?: {
    taskMeta?: TaskDragMeta
    personalMeta?: PersonalDragMeta
    color?: EventColor
    personalActivityType?: string
  },
): CalendarDragData {
  const slotDuration = getSlotDuration()
  const snappedDurationMinutes = roundUpToIncrement(durationMinutes, slotDuration)
  return {
    _type: DRAG_TYPE,
    source: 'sidebar',
    eventId: taskId,
    title,
    color: meta?.color ?? 'teal',
    durationMinutes: snappedDurationMinutes,
    priority,
    personalActivityType: meta?.personalActivityType,
    taskMeta: meta?.taskMeta,
    personalMeta: meta?.personalMeta,
  }
}

/** Build drop-target data for a time slot. */
export function makeSlotData(isoDay: string, hour: number, minute: number): SlotDropData {
  return { _type: SLOT_TYPE, isoDay, hour, minute }
}

/** Build drop-target data for an all-day cell. */
export function makeAllDaySlotData(isoDay: string): SlotDropData {
  return { _type: SLOT_TYPE, isoDay, hour: 0, minute: 0, isAllDay: true }
}
