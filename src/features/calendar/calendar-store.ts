// Barrel re-export — preserves the old import paths while logic lives in focused stores

// --- UI state (view, navigation, mobile) ---
export {
  setView, setActiveDate, navigateToToday,
  setMobileFocusDay,
  setTimeChevronHovered, toggleTimeGuidePinned,
  useCalendarView, useActiveDate, useMobileFocusDay,
  useTimeGuideVisible, useTimeGuidePinned,
} from './stores/ui-store'

// --- Config (locale, time format, visible days, work hours, slot duration) ---
export {
  type CalendarConfig,
  applyConfig,
  setSlotDuration, getSlotDuration,
  setWorkHours, useWorkHours,
  useWeekStartsOn, useSlotDuration,
  setUse24HourTime, useUse24HourTime,
  setVisibleDays, useVisibleDays,
  useConfigLocale,
  useDayStartHour, useDayEndHour, useVisibleStartHour,
  getDayStartHour, getDayEndHour, getVisibleStartHour,
  getConfig,
} from './config'

export { US_CONFIG, GB_CONFIG, WORKWEEK_CONFIG } from './config'

// --- Coordinated setters (cross-store side effects) ---
import { setWeekStartsOn as setConfigWeekStartsOn } from './config'
import { setMobileFocusDay, todayColumnIndex } from './stores/ui-store'
import type { WeekStartDay } from './types'

export function setWeekStartsOn(day: WeekStartDay) {
  setConfigWeekStartsOn(day)
  setMobileFocusDay(todayColumnIndex(day))
}

// --- Drag state ---
export {
  setDragState, setDragRender, clearDragRender, updateDragRenderFrame,
  useDragState, useDragRender,
} from './stores/drag-store'

// --- Events ---
export {
  useCalendarEvents, useEventsForDay, useAllDayEvents,
  useCalendarDataState,
} from './stores/event-store'

// --- Data adapter ---
export { type CalendarDataSource, setDataSource, getDataSource, SyncDbDataSource } from './data'

export { isWithinWorkHours } from './utils/work-hours'
