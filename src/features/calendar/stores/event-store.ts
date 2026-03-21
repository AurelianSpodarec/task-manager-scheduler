import { useSyncExternalStore } from 'react'
import type { CalendarEvent } from '../types'
import { getDataSource } from '../data'
import { getConfig, subscribeConfig } from '../config'
import { addDays } from '../utils/date'

// ---------------------------------------------------------------------------
// Derived caches — invalidated when the data source snapshot changes
// ---------------------------------------------------------------------------
let cachedSnapshotRef: CalendarEvent[] = []
let scheduledEventsCache: CalendarEvent[] = []
const dayEventsCache = new Map<string, CalendarEvent[]>()
let allDayCache: { key: string; result: CalendarEvent[] } | null = null
function getSnapshotFromConfigOrDataSource(): CalendarEvent[] {
  const override = getConfig().events
  if (override) return override
  try {
    return getDataSource().getSnapshot()
  } catch {
    return []
  }
}

function invalidateDerivedCaches() {
  const snap = getSnapshotFromConfigOrDataSource()
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
  const dayEnd = addDays(dayStart, 1)
  // Half-open interval overlap: excludes events ending exactly at midnight
  const result = scheduledEventsCache.filter(
    (e) => !e.isAllDay && e.start < dayEnd && e.end > dayStart,
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
  const unsubConfig = subscribeConfig(cb)
  let unsubDataSource = () => {}
  try {
    unsubDataSource = getDataSource().subscribe(cb)
  } catch {
    // Intentionally noop when no data source is registered and config.events is used.
  }
  return () => {
    unsubDataSource()
    unsubConfig()
  }
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
  const override = getConfig().events
  if (override) return { loading: false, error: null }
  try {
    const ds = getDataSource()
    return { loading: ds.loading, error: ds.error }
  } catch {
    return { loading: false, error: null }
  }
}
