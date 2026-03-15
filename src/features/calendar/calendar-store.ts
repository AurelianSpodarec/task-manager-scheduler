// Barrel re-export — preserves the old import paths while logic lives in focused stores
export {
  setView, setActiveDate, navigateToToday, setSlotDuration, getSlotDuration,
  setMobileFocusDay, setWorkHours, setWeekStartsOn,
  setTimeChevronHovered, toggleTimeGuidePinned,
  useCalendarView, useActiveDate, useSlotDuration, useMobileFocusDay,
  useWorkHours, useTimeGuideVisible, useTimeGuidePinned, useWeekStartsOn,
} from './stores/ui-store'

export {
  setDragState, setDragRender, clearDragRender, updateDragRenderFrame,
  useDragState, useDragRender,
} from './stores/drag-store'

export {
  useCalendarEvents, useEventsForDay, useAllDayEvents,
} from './stores/event-store'

export { isWithinWorkHours } from './utils/work-hours'
