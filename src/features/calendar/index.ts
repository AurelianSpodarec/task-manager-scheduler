// Public API — all external consumers import from this barrel only.

// Components
export { CalendarShell } from './components/calendar-shell'

// Hooks
export { useCalendarNavigation } from './hooks/use-calendar-navigation'
export { useDay } from './hooks/use-day'
export { useTimeSlot } from './hooks/use-time-slot'
export { useFormatTime } from './hooks/use-format-time'

// Config, stores, data — via the existing internal barrel
export {
  type CalendarConfig,
  type CalendarConfigUpdate,
  type CalendarEventHandlers,
  type CalendarInteractionConfig,
  applyConfig,
  setVisibleDays,
  setUse24HourTime,
  setWeekStartsOn,
  setSlotDuration,
  setWorkHours,
  setInteractionSettings,
  setView,
  setActiveDate,
  navigateToToday,
  getConfig,
  getSlotDuration,
  getInteractionSettings,
  useConfigLocale,
  useUse24HourTime,
  useWeekStartsOn,
  useVisibleDays,
  useWorkHours,
  useSlotDuration,
  useInteractionSettings,
  useCalendarView,
  useActiveDate,
  useCalendarEvents,
  useEventsForDay,
  useAllDayEvents,
  useCalendarDataState,
  useDragRender,
  type CalendarDataSource,
  setDataSource,
  US_CONFIG,
  GB_CONFIG,
  WORKWEEK_CONFIG,
} from './calendar-store'

// DnD (sidebar integration)
export { makeSidebarDragData, startPointerDrag } from './dnd'

// Utilities (for consumer settings UI)
export { getOrderedWeekDays } from './utils/date'

// Types
export type {
  CalendarEvent,
  ViewMode,
  WeekStartDay,
  SlotDuration,
  WorkHoursConfig,
  EventLayoutRect,
  EventColor,
  DragRenderState,
} from './types'
