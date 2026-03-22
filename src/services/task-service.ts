import { useSyncExternalStore } from 'react'
import { addDays, startOfWeek } from 'date-fns'
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
const WORK_EVENT_BASE_CLASS =
  'border-zinc-200 bg-white hover:border-zinc-300 before:absolute before:left-0 before:inset-y-0 before:w-[3px] before:bg-[var(--evt-border)]'
const MEETING_EVENT_BASE_CLASS = 'border-zinc-200 bg-white hover:border-zinc-300'

type TaskEventVisualKind = 'work' | 'personal' | 'meeting'
type TaskEventVisual = Pick<CalendarEvent, 'className' | 'style' | 'icon' | 'meetingMeta'>

const EVENT_VISUAL_BY_KIND: Record<
  TaskEventVisualKind,
  (task: Task, activityType?: PersonalActivityType) => TaskEventVisual
> = {
  work: (task) => ({
    className: WORK_EVENT_BASE_CLASS,
    style: { '--evt-border': priorityLeftBorderColor[task.priority] } as React.CSSProperties,
    icon: task.status === 'completed' ? CompletedStatusIcon : PendingStatusIcon,
    meetingMeta: undefined,
  }),
  personal: (_, activityType) => ({
    className: activityType ? personalActivityStyles[activityType] : WORK_EVENT_BASE_CLASS,
    style: undefined,
    icon: activityType ? personalActivityIcons[activityType] : undefined,
    meetingMeta: undefined,
  }),
  meeting: (task) => ({
    className: MEETING_EVENT_BASE_CLASS,
    style: undefined,
    icon: undefined,
    meetingMeta: {
      provider: task.meetingProvider ?? null,
      participants: task.participants ?? [],
    },
  }),
}

function getTaskEventVisualKind(
  task: Task,
  activityType: PersonalActivityType | undefined,
): TaskEventVisualKind {
  if (activityType) return 'personal'
  if (task.type === 'meeting') return 'meeting'
  return 'work'
}

// ---------------------------------------------------------------------------
// Task → CalendarEvent adapter
// ---------------------------------------------------------------------------

/** Maps a scheduled Task into the CalendarEvent shape — consumer owns all visual treatment. */
export function toCalendarEvent(task: Task): CalendarEvent {
  const s = task.schedule!
  const activityType = task.personalActivityType as PersonalActivityType | undefined
  const visualKind = getTaskEventVisualKind(task, activityType)
  const visuals = EVENT_VISUAL_BY_KIND[visualKind](task, activityType)
  const isMeetingElapsed = task.type === 'meeting' && new Date(s.end).getTime() <= Date.now()
  const isCompleted = task.type === 'meeting' ? isMeetingElapsed : task.status === 'completed'

  return {
    id: task.id,
    title: task.title,
    start: new Date(s.start),
    end: new Date(s.end),
    isAllDay: s.isAllDay,
    isCompleted,
    color: task.color,
    className: visuals.className,
    style: visuals.style,
    icon: visuals.icon,
    meetingMeta: visuals.meetingMeta,
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

/** Sidebar Tasks-tab list: unscheduled work tasks + unscheduled meeting tasks. */
export function getSidebarTasksTabTasksSnapshot(): Task[] {
  return getAllTasks().filter(
    (t) => t.schedule == null && (t.type === 'work' || t.type === 'meeting'),
  )
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
function withTaskById(id: string, mutate: (task: Task) => void): void {
  const task = getTask(id)
  if (!task) return
  mutate(task)
}

function getElapsedStatusForScheduledTask(
  task: Task,
  scheduleEndMs: number,
  nowMs: number,
): EventStatus | null {
  if (task.type === 'meeting') {
    return scheduleEndMs <= nowMs ? 'completed' : 'pending'
  }
  if (task.type === 'personal' && task.status !== 'completed' && scheduleEndMs <= nowMs) {
    return 'completed'
  }
  return null
}

function getScheduledStatus(task: Task, nextEnd: Date, nowMs: number = Date.now()): EventStatus {
  const elapsedStatus = getElapsedStatusForScheduledTask(task, nextEnd.getTime(), nowMs)
  return elapsedStatus ?? task.status
}

function writeScheduledTask(
  task: Task,
  start: Date,
  end: Date,
  isAllDay: boolean,
): void {
  upsertTask({
    ...task,
    status: getScheduledStatus(task, end),
    schedule: { start: start.toISOString(), end: end.toISOString(), isAllDay },
  })
}

export function scheduleTask(
  id: string,
  start: Date,
  end: Date,
  isAllDay: boolean,
): void {
  withTaskById(id, (task) => {
    writeScheduledTask(task, start, end, isAllDay)
  })
}

export function unscheduleTask(id: string): void {
  withTaskById(id, (task) => {
    upsertTask({ ...task, schedule: null, status: 'pending' })
  })
}

export function moveScheduledTask(
  id: string,
  start: Date,
  end: Date,
  isAllDay: boolean,
): void {
  withTaskById(id, (task) => {
    writeScheduledTask(task, start, end, isAllDay)
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
  withTaskById(templateId, (template) => {
    const clone: Task = {
      ...template,
      id: `${templateId}-spawn-${Date.now()}-${++spawnCounter}`,
      status: getScheduledStatus(template, end),
      schedule: { start: start.toISOString(), end: end.toISOString(), isAllDay },
    }
    upsertTask(clone)
  })
}
/**
 * Reconciles scheduled task statuses against elapsed time.
 * - Personal tasks auto-complete once their scheduled end has elapsed.
 * - Meetings are always locked to elapsed-time status.
 */
export function syncElapsedScheduledTaskStatuses(now = new Date()): void {
  const nowMs = now.getTime()

  for (const task of getAllTasks()) {
    if (!task.schedule) continue

    const endMs = new Date(task.schedule.end).getTime()
    const nextStatus = getElapsedStatusForScheduledTask(task, endMs, nowMs)

    if (nextStatus && nextStatus !== task.status) {
      upsertTask({ ...task, status: nextStatus })
    }
  }
}

/** Remove a spawned calendar clone — personal drags back to sidebar just delete the copy. */
export function deleteScheduledTask(id: string): void {
  deleteTask(id)
}

/** Toggle task completion status and return the updated value. */
export function toggleTaskStatus(id: string): EventStatus | null {
  const task = getTask(id)
  if (!task) return null
  if (task.type === 'meeting') return null
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

function useTaskStoreSelector<T>(selector: () => T): T {
  return useSyncExternalStore(subscribe, () => {
    invalidateServiceCaches()
    return selector()
  }, () => {
    invalidateServiceCaches()
    return selector()
  })
}

function invalidateServiceCaches() {
  const snap = getSnapshot()
  if (snap === cachedSnap) return
  cachedSnap = snap
  workCache = snap.filter((t) => t.schedule == null && t.type === 'work')
  personalCache = snap.filter((t) => t.schedule == null && t.type === 'personal')
  tasksTabCache = [
    ...workCache,
    ...snap.filter((t) => t.schedule == null && t.type === 'meeting'),
  ]
  allUnscheduledCache = snap.filter((t) => t.schedule == null)
  scheduledCache = snap.filter((t) => t.schedule != null).map(toCalendarEvent)
}

/** Sidebar Tasks-tab list: unscheduled work tasks + unscheduled meeting tasks. */
export function useSidebarTasksTabTasks(): Task[] {
  return useTaskStoreSelector(() => tasksTabCache)
}

/** Unscheduled tasks for the sidebar, optionally filtered by type. */
export function useUnscheduledTasks(type?: TaskType): Task[] {
  return useTaskStoreSelector(() => {
    if (type === 'work') return workCache
    if (type === 'personal') return personalCache
    return allUnscheduledCache
  })
}

/** All scheduled tasks as CalendarEvent[] — re-renders on any DB change. */
export function useScheduledEvents(): CalendarEvent[] {
  return useTaskStoreSelector(() => scheduledCache)
}

export function completeScheduledTasksInWeek(anchorDate: Date): number {
  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 7)
  let updatedCount = 0

  for (const task of getAllTasks()) {
    if (!task.schedule) continue
    if (task.type === 'meeting') continue
    if (task.status === 'completed') continue

    const taskStart = new Date(task.schedule.start)
    const taskEnd = new Date(task.schedule.end)
    const overlapsWeek = taskStart < weekEnd && taskEnd > weekStart
    if (!overlapsWeek) continue

    upsertTask({ ...task, status: 'completed' })
    updatedCount += 1
  }

  return updatedCount
}
