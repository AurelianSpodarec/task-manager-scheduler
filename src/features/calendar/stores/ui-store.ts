import { useSyncExternalStore } from 'react'
import type { ViewMode, WeekStartDay } from '../types'
import { getConfig } from '../config'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
type UIState = {
  view: ViewMode
  activeDate: Date
  mobileFocusDay: number
  timeChevronHovered: boolean
  timeGuidePinned: boolean
}

export function todayColumnIndex(weekStartsOn: WeekStartDay): number {
  return (new Date().getDay() - weekStartsOn + 7) % 7
}

let state: UIState = {
  view: 'week',
  activeDate: new Date(),
  mobileFocusDay: todayColumnIndex(getConfig().weekStartsOn),
  timeChevronHovered: false,
  timeGuidePinned: false,
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function setState(partial: Partial<UIState>) {
  state = { ...state, ...partial }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function useSelector<T>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
export function setView(view: ViewMode) {
  setState({ view })
}

export function setActiveDate(date: Date) {
  setState({ activeDate: date })
}

export function navigateToToday() {
  setState({ activeDate: new Date() })
}

export function setMobileFocusDay(index: number) {
  setState({ mobileFocusDay: index })
}

export function setTimeChevronHovered(hovered: boolean) {
  if (state.timeChevronHovered === hovered) return
  setState({ timeChevronHovered: hovered })
}

export function toggleTimeGuidePinned() {
  setState({ timeGuidePinned: !state.timeGuidePinned })
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export function useCalendarView(): ViewMode {
  return useSelector((s) => s.view)
}

export function useActiveDate(): Date {
  return useSelector((s) => s.activeDate)
}

export function useMobileFocusDay(): number {
  return useSelector((s) => s.mobileFocusDay)
}

export function useTimeGuideVisible(): boolean {
  return useSelector((s) => s.timeChevronHovered || s.timeGuidePinned)
}

export function useTimeGuidePinned(): boolean {
  return useSelector((s) => s.timeGuidePinned)
}
