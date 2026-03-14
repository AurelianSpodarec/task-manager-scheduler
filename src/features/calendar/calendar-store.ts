import { useSyncExternalStore } from 'react'
import type {
  CalendarEvent,
  ViewMode,
  SlotDuration,
  DragPayload,
  DragRenderState,
  DragPointer,
  DragSlotCandidate,
} from './types'
import { DEFAULT_SLOT_DURATION } from './constants'
import { isSameDay, startOfDay } from './utils/date'
import { seedEvents } from './seed-events'

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------
type CalendarState = {
  events: CalendarEvent[]
  view: ViewMode
  activeDate: Date
  slotDuration: SlotDuration
  dragState: DragPayload | null
  dragRender: DragRenderState | null
  mobileFocusDay: number
}

// ---------------------------------------------------------------------------
// Internal store singleton
// ---------------------------------------------------------------------------
let state: CalendarState = {
  events: seedEvents(),
  view: 'week',
  activeDate: new Date(),
  slotDuration: DEFAULT_SLOT_DURATION,
  dragState: null,
  dragRender: null,
  mobileFocusDay: new Date().getDay(),
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function setState(partial: Partial<CalendarState>) {
  state = { ...state, ...partial }
  emit()
}

// ---------------------------------------------------------------------------
// Mutations — importable from anywhere, no provider needed
// ---------------------------------------------------------------------------
export function addEvent(event: CalendarEvent) {
  setState({ events: [...state.events, event] })
}

export function updateEvent(id: string, patch: Partial<Omit<CalendarEvent, 'id'>>) {
  setState({
    events: state.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
  })
}

export function removeEvent(id: string) {
  setState({ events: state.events.filter((e) => e.id !== id) })
}

export function setView(view: ViewMode) {
  setState({ view })
}

export function setActiveDate(date: Date) {
  setState({ activeDate: date })
}

export function navigateToToday() {
  setState({ activeDate: new Date() })
}

export function setSlotDuration(duration: SlotDuration) {
  setState({ slotDuration: duration })
}

export function setDragState(drag: DragPayload | null) {
  setState({ dragState: drag })
}

export function setDragRender(dragRender: DragRenderState | null) {
  setState({ dragRender })
}

export function clearDragRender() {
  if (state.dragRender == null) return
  setState({ dragRender: null })
}

function isSameSlotCandidate(a: DragSlotCandidate | null, b: DragSlotCandidate | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return (
    a.isoDay === b.isoDay &&
    a.hour === b.hour &&
    a.minute === b.minute &&
    Boolean(a.isAllDay) === Boolean(b.isAllDay)
  )
}

function isSamePointer(a: DragPointer, b: DragPointer): boolean {
  return a.clientX === b.clientX && a.clientY === b.clientY
}

export function updateDragRenderFrame(pointer: DragPointer, slot: DragSlotCandidate | null) {
  const current = state.dragRender
  if (!current) return
  if (isSamePointer(current.pointer, pointer) && isSameSlotCandidate(current.slot, slot)) return
  setState({
    dragRender: {
      ...current,
      pointer,
      slot,
    },
  })
}

export function setMobileFocusDay(index: number) {
  setState({ mobileFocusDay: index })
}

// ---------------------------------------------------------------------------
// Subscribe (for useSyncExternalStore)
// ---------------------------------------------------------------------------
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// ---------------------------------------------------------------------------
// Snapshot helpers
// useSyncExternalStore compares snapshots with Object.is — derived selectors
// that call .filter() must return a stable reference when the result is equal.
// ---------------------------------------------------------------------------

// Module-level caches
// Cleared automatically when the events list changes.
let cachedEventsRef: CalendarEvent[] = []
const dayEventsCache = new Map<string, CalendarEvent[]>()
let allDayCache: { key: string; result: CalendarEvent[] } | null = null

function invalidateDerivedCaches() {
  if (state.events !== cachedEventsRef) {
    cachedEventsRef = state.events
    dayEventsCache.clear()
    allDayCache = null
  }
}

function getEventsForDay(dayStart: Date): CalendarEvent[] {
  invalidateDerivedCaches()
  const key = dayStart.toISOString()
  const cached = dayEventsCache.get(key)
  if (cached) return cached

  const result = state.events.filter(
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

  const result = state.events.filter(
    (e) => e.isAllDay && e.start <= weekEnd && e.end >= weekStart,
  )
  allDayCache = { key, result }
  return result
}

// ---------------------------------------------------------------------------
// Generic selector hook — safe for primitive / already-stable values
// ---------------------------------------------------------------------------
function useStoreSelector<T>(selector: (s: CalendarState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

// ---------------------------------------------------------------------------
// Public hooks — granular subscriptions
// ---------------------------------------------------------------------------

/** All events — re-renders when any event changes. */
export function useCalendarEvents(): CalendarEvent[] {
  return useStoreSelector((s) => s.events)
}

/** Events for a specific day (cached — stable reference). */
export function useEventsForDay(day: Date): CalendarEvent[] {
  const dayStart = startOfDay(day)
  return useStoreSelector(() => getEventsForDay(dayStart))
}

/** All-day events within a date range (cached — stable reference). */
export function useAllDayEvents(weekStart: Date, weekEnd: Date): CalendarEvent[] {
  return useStoreSelector(() => getAllDayEventsInRange(weekStart, weekEnd))
}

export function useCalendarView(): ViewMode {
  return useStoreSelector((s) => s.view)
}

export function useActiveDate(): Date {
  return useStoreSelector((s) => s.activeDate)
}

export function useSlotDuration(): SlotDuration {
  return useStoreSelector((s) => s.slotDuration)
}

export function useDragState(): DragPayload | null {
  return useStoreSelector((s) => s.dragState)
}

export function useDragRender(): DragRenderState | null {
  return useStoreSelector((s) => s.dragRender)
}

export function useMobileFocusDay(): number {
  return useStoreSelector((s) => s.mobileFocusDay)
}
