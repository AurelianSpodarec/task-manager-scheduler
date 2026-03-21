import { getTask } from '@/database/db'
import type { ScheduleEventData } from '@/features/calendar'
import { toDate } from '@/features/calendar/utils/schedule'
import {
  deleteScheduledTask,
  moveScheduledTask,
  scheduleTask,
  spawnScheduledTask,
  toggleTaskStatus,
  unscheduleTask,
} from '@/services/task-service'
import { firePlannerCompletionConfetti } from '../shared/completion-confetti'

function getTaskForEvent(eventId: string | number) {
  return getTask(String(eventId))
}

export function handlePlannerEventDrop(
  eventId: string | number,
  nextStart: string,
  nextEnd: string,
  event: ScheduleEventData,
): void {
  const task = getTaskForEvent(eventId)
  if (!task) return

  const start = toDate(nextStart)
  const end = toDate(nextEnd)
  const isAllDay = Boolean(event.isAllDay)

  if (task.schedule != null) {
    moveScheduledTask(task.id, start, end, isAllDay)
    return
  }

  if (task.type === 'personal') {
    spawnScheduledTask(task.id, start, end, isAllDay)
    return
  }

  scheduleTask(task.id, start, end, isAllDay)
}

export function handlePlannerEventRemove(eventId: string | number): void {
  const task = getTaskForEvent(eventId)
  if (!task) return

  if (task.personalActivityType) {
    deleteScheduledTask(task.id)
    return
  }

  unscheduleTask(task.id)
}

export function handlePlannerEventIconClick(
  eventId: string | number,
  target: HTMLElement,
): void {
  const status = toggleTaskStatus(String(eventId))
  if (status !== 'completed') return
  firePlannerCompletionConfetti(target)
}
