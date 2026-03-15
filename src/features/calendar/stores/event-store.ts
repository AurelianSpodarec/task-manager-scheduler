import { useSyncExternalStore } from 'react'
import type { CalendarEvent } from '../types'
import type { Task } from '@/database/schema'
import { subscribe as dbSubscribe, getSnapshot as dbGetSnapshot } from '@/database/db'
import { toCalendarEvent } from '@/services/task-service'
import { isSameDay, startOfDay } from '../utils/date'

// ---------------------------------------------------------------------------
// DB-backed caches — invalidated when the DB snapshot reference changes
// ---------------------------------------------------------------------------
let cachedDbRef: Task[] = []
let scheduledEventsCache: CalendarEvent[] = []
const dayEventsCache = new Map<string, CalendarEvent[]>()
let allDayCache: { key: string; result: CalendarEvent[] } | null = null

function invalidateDerivedCaches() {
  const dbSnap = dbGetSnapshot()
  if (dbSnap !== cachedDbRef) {
    cachedDbRef = dbSnap
    scheduledEventsCache = dbSnap
      .filter((t) => t.schedule != null)
      .map(toCalendarEvent)
    dayEventsCache.clear()
    allDayCache = null
  }
}

function getEventsForDay(dayStart: Date): CalendarEvent[] {
  invalidateDerivedCaches()
  const key = dayStart.toISOString()
  const cached = dayEventsCache.get(key)
  if (cached) return cached

  const result = scheduledEventsCache.filter(
    (e) =>
      isSameDay(e.start, dayStart) ||
      isSameDay(e.end, dayStart) ||
      (e.start < dayStart && e.end > dayStart),
  )
  dayEventsCache.set(key, result)
  return result
}

function getAllDayEventsInRange(weekStart: Date, weekEnd: Date): CalendarEvent[] {
  invalidateDerivedCaches()
  const key = `${weekStart.getTime()}-${weekEnd.getTime()}`
  if (allDayCache && allDayCache.key === key) return allDayCache.result

  const result = scheduledEventsCache.filter(
    (e) => e.isAllDay && e.start <= weekEnd && e.end >= weekStart,
  )
  allDayCache = { key, result }
  return result
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** All scheduled events — re-renders when the DB changes. */
export function useCalendarEvents(): CalendarEvent[] {
  return useSyncExternalStore(
    dbSubscribe,
    () => { invalidateDerivedCaches(); return scheduledEventsCache },
    () => { invalidateDerivedCaches(); return scheduledEventsCache },
  )
}

/** Events for a specific day (cached — stable reference). */
export function useEventsForDay(day: Date): CalendarEvent[] {
  const dayStart = startOfDay(day)
  return useSyncExternalStore(
    dbSubscribe,
    () => getEventsForDay(dayStart),
    () => getEventsForDay(dayStart),
  )
}

/** All-day events within a date range (cached — stable reference). */
export function useAllDayEvents(weekStart: Date, weekEnd: Date): CalendarEvent[] {
  return useSyncExternalStore(
    dbSubscribe,
    () => getAllDayEventsInRange(weekStart, weekEnd),
    () => getAllDayEventsInRange(weekStart, weekEnd),
  )
}
