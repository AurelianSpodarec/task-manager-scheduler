import { useSyncExternalStore } from 'react'
import type { CalendarEvent } from '../types'
import { getDataSource } from '../data'
import { isSameDay } from '../utils/date'

// ---------------------------------------------------------------------------
// Derived caches — invalidated when the data source snapshot changes
// ---------------------------------------------------------------------------
let cachedSnapshotRef: CalendarEvent[] = []
let scheduledEventsCache: CalendarEvent[] = []
const dayEventsCache = new Map<string, CalendarEvent[]>()
let allDayCache: { key: string; result: CalendarEvent[] } | null = null

function invalidateDerivedCaches() {
  const snap = getDataSource().getSnapshot()
  if (snap !== cachedSnapshotRef) {
    cachedSnapshotRef = snap
    scheduledEventsCache = snap
    dayEventsCache.clear()
    allDayCache = null
  }
}

function getEventsForDayISO(isoDate: string): CalendarEvent[] {
  invalidateDerivedCaches()
  const cached = dayEventsCache.get(isoDate)
  if (cached) return cached

  const dayStart = new Date(isoDate + 'T00:00:00')
  const result = scheduledEventsCache.filter(
    (e) =>
      isSameDay(e.start, dayStart) ||
      isSameDay(e.end, dayStart) ||
      (e.start < dayStart && e.end > dayStart),
  )
  dayEventsCache.set(isoDate, result)
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
// Subscribe helper — delegates to the active data source
// ---------------------------------------------------------------------------
function dsSubscribe(cb: () => void) {
  return getDataSource().subscribe(cb)
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** All scheduled events — re-renders when the data source changes. */
export function useCalendarEvents(): CalendarEvent[] {
  return useSyncExternalStore(
    dsSubscribe,
    () => { invalidateDerivedCaches(); return scheduledEventsCache },
    () => { invalidateDerivedCaches(); return scheduledEventsCache },
  )
}

/**
 * Events for a specific day (cached — stable reference).
 * Normalises to ISO date string early so the selector identity stays stable
 * across renders even when a new Date object is passed.
 */
export function useEventsForDay(day: Date): CalendarEvent[] {
  const iso = day.toISOString().slice(0, 10)
  return useSyncExternalStore(
    dsSubscribe,
    () => getEventsForDayISO(iso),
    () => getEventsForDayISO(iso),
  )
}

/** All-day events within a date range (cached — stable reference). */
export function useAllDayEvents(weekStart: Date, weekEnd: Date): CalendarEvent[] {
  return useSyncExternalStore(
    dsSubscribe,
    () => getAllDayEventsInRange(weekStart, weekEnd),
    () => getAllDayEventsInRange(weekStart, weekEnd),
  )
}

/** Data source loading/error state — always resolved for sync adapter. */
export function useCalendarDataState(): { loading: boolean; error: Error | null } {
  const ds = getDataSource()
  return { loading: ds.loading, error: ds.error }
}
