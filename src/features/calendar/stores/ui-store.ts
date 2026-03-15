import { useSyncExternalStore } from 'react'
import type { ViewMode, SlotDuration, WorkHoursConfig, WeekStartDay } from '../types'
import { DEFAULT_SLOT_DURATION, DEFAULT_WORK_HOURS } from '../constants'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
type UIState = {
  view: ViewMode
  activeDate: Date
  slotDuration: SlotDuration
  workHours: WorkHoursConfig
  weekStartsOn: WeekStartDay
  mobileFocusDay: number
  timeChevronHovered: boolean
  timeGuidePinned: boolean
}

function todayColumnIndex(weekStartsOn: WeekStartDay): number {
  return (new Date().getDay() - weekStartsOn + 7) % 7
}

const DEFAULT_WEEK_STARTS_ON: WeekStartDay = 1

let state: UIState = {
  view: 'week',
  activeDate: new Date(),
  slotDuration: DEFAULT_SLOT_DURATION,
  workHours: DEFAULT_WORK_HOURS,
  weekStartsOn: DEFAULT_WEEK_STARTS_ON,
  mobileFocusDay: todayColumnIndex(DEFAULT_WEEK_STARTS_ON),
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

export function setSlotDuration(duration: SlotDuration) {
  setState({ slotDuration: duration })
}

export function getSlotDuration(): SlotDuration {
  return state.slotDuration
}

export function setMobileFocusDay(index: number) {
  setState({ mobileFocusDay: index })
}

export function setWorkHours(config: WorkHoursConfig) {
  setState({ workHours: config })
}

export function setWeekStartsOn(day: WeekStartDay) {
  setState({ weekStartsOn: day, mobileFocusDay: todayColumnIndex(day) })
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

export function useSlotDuration(): SlotDuration {
  return useSelector((s) => s.slotDuration)
}

export function useMobileFocusDay(): number {
  return useSelector((s) => s.mobileFocusDay)
}

export function useWorkHours(): WorkHoursConfig {
  return useSelector((s) => s.workHours)
}

export function useTimeGuideVisible(): boolean {
  return useSelector((s) => s.timeChevronHovered || s.timeGuidePinned)
}

export function useTimeGuidePinned(): boolean {
  return useSelector((s) => s.timeGuidePinned)
}

export function useWeekStartsOn(): WeekStartDay {
  return useSelector((s) => s.weekStartsOn)
}
