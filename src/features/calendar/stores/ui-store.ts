import type { ViewMode, WeekStartDay } from '../types'
import { getConfig } from '../config'
import { createStore } from './create-store'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
type UIState = {
  view: ViewMode
  activeDate: Date
  mobileFocusDay: number
  timeChevronHovered: boolean
  timeGuidePinned: boolean
  settingsPanelOpen: boolean
}

export function todayColumnIndex(weekStartsOn: WeekStartDay): number {
  return (new Date().getDay() - weekStartsOn + 7) % 7
}

const { getState, setState, useSelector } = createStore<UIState>({
  view: 'week',
  activeDate: new Date(),
  mobileFocusDay: todayColumnIndex(getConfig().weekStartsOn),
  timeChevronHovered: false,
  timeGuidePinned: false,
  settingsPanelOpen: false,
})

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
  if (getState().timeChevronHovered === hovered) return
  setState({ timeChevronHovered: hovered })
}

export function toggleTimeGuidePinned() {
  setState({ timeGuidePinned: !getState().timeGuidePinned })
}

export function toggleSettingsPanel() {
  setState({ settingsPanelOpen: !getState().settingsPanelOpen })
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

export function useSettingsPanelOpen(): boolean {
  return useSelector((s) => s.settingsPanelOpen)
}
