import type { SlotDuration, WeekStartDay, WorkHoursConfig } from '../types'

const STORAGE_KEY = 'cal-settings'

export type SidebarPosition = 'left' | 'right'

type PersistedSettings = {
  use24HourTime: boolean
  weekStartsOn: WeekStartDay
  visibleDays: number[]
  workHours: WorkHoursConfig
  slotDuration: SlotDuration
  dayStartHour: number
  dayEndHour: number
  visibleStartHour: number
  sidebarPosition: SidebarPosition
}

/** Read stored prefs — returns null if nothing saved or parse fails. */
export function loadSettings(): Partial<PersistedSettings> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<PersistedSettings>
  } catch {
    return null
  }
}

/** Write current prefs to localStorage. */
export function saveSettings(settings: PersistedSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}
