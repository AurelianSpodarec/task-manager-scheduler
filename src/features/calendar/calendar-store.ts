// Barrel re-export — preserves the old import paths while logic lives in focused stores

// --- UI state (view, navigation, mobile) ---
export {
  setView, setActiveDate, navigateToToday,
  setMobileFocusDay,
  setTimeChevronHovered, toggleTimeGuidePinned,
  toggleSettingsPanel,
  useCalendarView, useActiveDate, useMobileFocusDay,
  useTimeGuideVisible, useTimeGuidePinned,
  useSettingsPanelOpen,
} from './stores/ui-store'

// --- Config (locale, time format, visible days, work hours, slot duration) ---
export {
  type CalendarConfig,
  type CalendarConfigUpdate,
  type CalendarEventHandlers,
  type CalendarInteractionConfig,
  type CalendarDragMonitors,
  applyConfig,
  setSlotDuration, getSlotDuration,
  setWorkHours, useWorkHours,
  useWeekStartsOn, useSlotDuration,
  setUse24HourTime, useUse24HourTime,
  setVisibleDays, useVisibleDays,
  setInteractionSettings, getInteractionSettings, useInteractionSettings,
  setDragMonitors,
  useConfigLocale,
  useDayStartHour, useDayEndHour, useVisibleStartHour,
  getDayStartHour, getDayEndHour, getVisibleStartHour,
  getConfig,
  setSidebarPosition, useSidebarPosition,
  type SidebarPosition,
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
  useDragState, useDragRender, useDragSlotDay, useIsDragging,
} from './stores/drag-store'

// --- Cell selection state ---
export {
  type CellCoord,
  startSelection, updateSelection, endSelection, clearSelection,
  isSelectionActive, useIsCellSelected,
} from './stores/hover-store'

// --- Events ---
export {
  useCalendarEvents, useEventsForDay, useAllDayEvents,
  useCalendarDataState,
} from './stores/event-store'

// --- Data adapter ---
export { type CalendarDataSource, setDataSource, getDataSource } from './data'
// --- Slice-style grouped contracts ---
export { calendarSlices } from './stores/slices'

export { isWithinWorkHours } from './utils/work-hours'
