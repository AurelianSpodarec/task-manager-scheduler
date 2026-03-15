import { addMinutes, setHours, setMinutes } from 'date-fns'
import { startOfDay } from '../utils/date'
import { getSlotDuration } from '../stores/ui-store'
import { HOUR_HEIGHT_PX } from '../constants'
import { scheduleTask, moveScheduledTask, spawnScheduledTask } from '@/services/task-service'
import { roundUpToIncrement, type CalendarDragData, type SlotDropData } from './types'

export function executeDrop(drag: CalendarDragData, slot: SlotDropData | null): void {
  if (!slot) return

  const day = new Date(slot.isoDay)
  const isAllDayDrop = Boolean(slot.isAllDay)
  const slotStart = setMinutes(setHours(startOfDay(day), slot.hour), slot.minute)

  const slotDur = getSlotDuration()
  const grabOffsetMin = drag.grabOffsetY != null
    ? Math.round(((drag.grabOffsetY / HOUR_HEIGHT_PX) * 60) / slotDur) * slotDur
    : 0
  const targetStart = addMinutes(slotStart, -grabOffsetMin)

  if (drag.source === 'sidebar' && drag.eventId) {
    const mins = roundUpToIncrement(drag.durationMinutes ?? 60, slotDur)
    const end = isAllDayDrop ? addMinutes(targetStart, 1440) : addMinutes(targetStart, mins)
    const allDay = isAllDayDrop || mins >= 1440
    if (drag.personalActivityType != null) {
      spawnScheduledTask(drag.eventId, targetStart, end, allDay)
    } else {
      scheduleTask(drag.eventId, targetStart, end, allDay)
    }
  } else if (drag.source === 'calendar' && drag.eventId) {
    const durationMinutes =
      drag.originalStart != null && drag.originalEnd != null
        ? Math.max(1, Math.ceil((drag.originalEnd - drag.originalStart) / 60_000))
        : Math.max(1, drag.durationMinutes ?? 60)
    const snappedDurationMinutes = roundUpToIncrement(durationMinutes, slotDur)
    const timedDurationMinutes = drag.isAllDay ? 60 : snappedDurationMinutes
    const end = isAllDayDrop
      ? addMinutes(targetStart, 1440)
      : addMinutes(targetStart, timedDurationMinutes)
    moveScheduledTask(drag.eventId, targetStart, end, isAllDayDrop)
  }
}
