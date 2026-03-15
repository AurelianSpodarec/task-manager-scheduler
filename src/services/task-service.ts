import { useSyncExternalStore } from 'react'
import type { Task, TaskType } from '@/database/schema'
import type { CalendarEvent } from '@/features/calendar/types'
import { getAllTasks, getTask, upsertTask, subscribe, getSnapshot } from '@/database/db'

// ---------------------------------------------------------------------------
// Task → CalendarEvent adapter
// ---------------------------------------------------------------------------

/** Converts a scheduled Task into the CalendarEvent shape the calendar components expect. */
export function toCalendarEvent(task: Task): CalendarEvent {
  const s = task.schedule!
  return {
    id: task.id,
    title: task.title,
    start: new Date(s.start),
    end: new Date(s.end),
    isAllDay: s.isAllDay,
    color: task.color,
    status: task.status,
    priority: task.priority,
    participants: task.participants,
    personalActivityType: task.personalActivityType,
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
  upsertTask({
    ...task,
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
  upsertTask({
    ...task,
    schedule: { start: start.toISOString(), end: end.toISOString(), isAllDay },
  })
}

// ---------------------------------------------------------------------------
// React hooks — cached selectors for useSyncExternalStore
// .filter() always returns a new reference, so we cache results and only
// recompute when the DB snapshot changes (same Object.is contract).
// ---------------------------------------------------------------------------
let cachedSnap: Task[] = []
let workCache: Task[] = []
let personalCache: Task[] = []
let allUnscheduledCache: Task[] = []
let scheduledCache: CalendarEvent[] = []

function invalidateServiceCaches() {
  const snap = getSnapshot()
  if (snap === cachedSnap) return
  cachedSnap = snap
  workCache = snap.filter((t) => t.schedule == null && t.type === 'work')
  personalCache = snap.filter((t) => t.schedule == null && t.type === 'personal')
  allUnscheduledCache = snap.filter((t) => t.schedule == null)
  scheduledCache = snap.filter((t) => t.schedule != null).map(toCalendarEvent)
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
