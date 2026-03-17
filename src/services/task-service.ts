import { useSyncExternalStore } from 'react'
import type { Task, TaskType } from '@/database/schema'
import type { CalendarEvent } from '@/features/calendar'
import type { EventStatus } from '@/types/shared'
import { getAllTasks, getTask, upsertTask, deleteTask, subscribe, getSnapshot } from '@/database/db'
import { priorityLeftBorderColor } from '@/lib/priority'
import {
  personalActivityStyles,
  personalActivityIcons,
  type PersonalActivityType,
} from '@/lib/personal-activity'
import { PendingStatusIcon, CompletedStatusIcon } from '@/lib/task-status-icons'

// ---------------------------------------------------------------------------
// Task → CalendarEvent adapter
// ---------------------------------------------------------------------------

/** Maps a scheduled Task into the CalendarEvent shape — consumer owns all visual treatment. */
export function toCalendarEvent(task: Task): CalendarEvent {
  const s = task.schedule!
  const isPersonal = task.personalActivityType != null
  const activityType = task.personalActivityType as PersonalActivityType | undefined
  const isCompleted = task.status === 'completed'
  const workBaseClass =
    'border-zinc-200 bg-white hover:border-zinc-300 before:absolute before:left-0 before:inset-y-0 before:w-[3px] before:bg-[var(--evt-border)]'

  return {
    id: task.id,
    title: task.title,
    start: new Date(s.start),
    end: new Date(s.end),
    isAllDay: s.isAllDay,
    isCompleted,
    color: task.color,
    className: isPersonal && activityType
      ? personalActivityStyles[activityType]
      : workBaseClass,
    style: isPersonal
      ? undefined
      : { '--evt-border': priorityLeftBorderColor[task.priority] } as React.CSSProperties,
    icon: activityType
      ? personalActivityIcons[activityType]
      : task.status === 'completed' ? CompletedStatusIcon : PendingStatusIcon,
  }
}

// ---------------------------------------------------------------------------
// Read helpers (pure)
// ---------------------------------------------------------------------------

export function getScheduledTasks(): Task[] {
  return getAllTasks().filter((t) => t.schedule != null)
}

export function getUnscheduledTasks(type?: TaskType): Task[] {
  return getAllTasks().filter(
    (t) => t.schedule == null && (type == null || t.type === type),
  )
}

export function getScheduledCalendarEvents(): CalendarEvent[] {
  return getScheduledTasks().map(toCalendarEvent)
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function scheduleTask(
  id: string,
  start: Date,
  end: Date,
  isAllDay: boolean,
): void {
  const task = getTask(id)
  if (!task) return
  const status = shouldAutoCompletePersonalTask(task, end) ? 'completed' : task.status
  upsertTask({
    ...task,
    status,
    schedule: { start: start.toISOString(), end: end.toISOString(), isAllDay },
  })
}

export function unscheduleTask(id: string): void {
  const task = getTask(id)
  if (!task) return
  upsertTask({ ...task, schedule: null, status: 'pending' })
}

export function moveScheduledTask(
  id: string,
  start: Date,
  end: Date,
  isAllDay: boolean,
): void {
  const task = getTask(id)
  if (!task) return
  const status = shouldAutoCompletePersonalTask(task, end) ? 'completed' : task.status
  upsertTask({
    ...task,
    status,
    schedule: { start: start.toISOString(), end: end.toISOString(), isAllDay },
  })
}

let spawnCounter = 0

/** Clone a personal template task onto the calendar — the original stays unscheduled. */
export function spawnScheduledTask(
  templateId: string,
  start: Date,
  end: Date,
  isAllDay: boolean,
): void {
  const template = getTask(templateId)
  if (!template) return
  const clone: Task = {
    ...template,
    id: `${templateId}-spawn-${Date.now()}-${++spawnCounter}`,
    status: shouldAutoCompletePersonalTask(template, end) ? 'completed' : template.status,
    schedule: { start: start.toISOString(), end: end.toISOString(), isAllDay },
  }
  upsertTask(clone)
}

function shouldAutoCompletePersonalTask(task: Task, nextEnd: Date): boolean {
  // Personal activities moved/scheduled into elapsed time are assumed done.
  return task.type === 'personal'
    && task.status !== 'completed'
    && nextEnd.getTime() <= Date.now()
}

/** Remove a spawned calendar clone — personal drags back to sidebar just delete the copy. */
export function deleteScheduledTask(id: string): void {
  deleteTask(id)
}

/** Toggle task completion status and return the updated value. */
export function toggleTaskStatus(id: string): EventStatus | null {
  const task = getTask(id)
  if (!task) return null
  const status: EventStatus = task.status === 'completed' ? 'pending' : 'completed'
  upsertTask({ ...task, status })
  return status
}

// ---------------------------------------------------------------------------
// React hooks — cached selectors for useSyncExternalStore
// .filter() always returns a new reference, so we cache results and only
// recompute when the DB snapshot changes (same Object.is contract).
// ---------------------------------------------------------------------------
let cachedSnap: Task[] = []
let workCache: Task[] = []
let personalCache: Task[] = []
let tasksTabCache: Task[] = []
let allUnscheduledCache: Task[] = []
let scheduledCache: CalendarEvent[] = []

function invalidateServiceCaches() {
  const snap = getSnapshot()
  if (snap === cachedSnap) return
  cachedSnap = snap
  workCache = snap.filter((t) => t.schedule == null && t.type === 'work')
  personalCache = snap.filter((t) => t.schedule == null && t.type === 'personal')
  tasksTabCache = [
    ...workCache,
    ...snap.filter((t) => t.type === 'meeting'),
  ]
  allUnscheduledCache = snap.filter((t) => t.schedule == null)
  scheduledCache = snap.filter((t) => t.schedule != null).map(toCalendarEvent)
}

/** Sidebar Tasks-tab list: unscheduled work tasks + all meeting tasks. */
export function useSidebarTasksTabTasks(): Task[] {
  return useSyncExternalStore(subscribe, () => {
    invalidateServiceCaches()
    return tasksTabCache
  }, () => {
    invalidateServiceCaches()
    return tasksTabCache
  })
}

/** Unscheduled tasks for the sidebar, optionally filtered by type. */
export function useUnscheduledTasks(type?: TaskType): Task[] {
  return useSyncExternalStore(subscribe, () => {
    invalidateServiceCaches()
    if (type === 'work') return workCache
    if (type === 'personal') return personalCache
    return allUnscheduledCache
  }, () => {
    invalidateServiceCaches()
    if (type === 'work') return workCache
    if (type === 'personal') return personalCache
    return allUnscheduledCache
  })
}

/** All scheduled tasks as CalendarEvent[] — re-renders on any DB change. */
export function useScheduledEvents(): CalendarEvent[] {
  return useSyncExternalStore(subscribe, () => {
    invalidateServiceCaches()
    return scheduledCache
  }, () => {
    invalidateServiceCaches()
    return scheduledCache
  })
}
