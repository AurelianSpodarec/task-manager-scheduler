// Public API — all external consumers import from this barrel only.

// Components
export { CalendarShell } from './components/calendar-shell'
export { CalendarRoot } from './core/calendar-root'
export { useCalendarInstanceId } from './core/calendar-instance'
export { CalendarDragSourcePrimitive, CalendarDropTargetPrimitive } from './components/headless/dnd-primitives'

// Hooks
export { useCalendarNavigation } from './hooks/use-calendar-navigation'
export { useDay } from './hooks/use-day'
export { useTimeSlot } from './hooks/use-time-slot'
export { useFormatTime } from './hooks/use-format-time'
export { useCalendarDragSource, useCalendarDropTarget } from './hooks/use-dnd-behaviors'

// Config, stores, data — via the existing internal barrel
export {
  type CalendarConfig,
  type CalendarConfigUpdate,
  type CalendarEventHandlers,
  type CalendarInteractionConfig,
  type CalendarDragMonitors,
  applyConfig,
  setVisibleDays,
  setUse24HourTime,
  setWeekStartsOn,
  setSlotDuration,
  setWorkHours,
  setInteractionSettings,
  setDragMonitors,
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
  calendarSlices,
  type CalendarDataSource,
  setDataSource,
  US_CONFIG,
  GB_CONFIG,
  WORKWEEK_CONFIG,
} from './calendar-store'

// DnD (sidebar integration)
export {
  makeSidebarDragData,
  startPointerDrag,
  registerSidebarDropzone,
  registerDayColumn,
  registerAllDayRow,
} from './dnd'

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
