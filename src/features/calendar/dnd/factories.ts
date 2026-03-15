import type { ComponentType, CSSProperties } from 'react'
import type { CalendarEvent, EventColor } from '../types'
import { getSlotDuration } from '../config'
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
    className: event.className,
    style: event.style,
    icon: event.icon,
    dragMeta: event.dragMeta,
  }
}

/** Build drag data for a sidebar task. Consumer provides visual fields + opaque dragMeta. */
export function makeSidebarDragData(
  taskId: string,
  title: string,
  durationMinutes: number,
  meta?: {
    color?: EventColor
    className?: string
    style?: CSSProperties
    icon?: ComponentType<{ className?: string; animate?: boolean }>
    dragMeta?: unknown
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
    className: meta?.className,
    style: meta?.style,
    icon: meta?.icon,
    dragMeta: meta?.dragMeta,
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
