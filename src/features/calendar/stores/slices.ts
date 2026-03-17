import {
  setView,
  setActiveDate,
  navigateToToday,
  setMobileFocusDay,
  setTimeChevronHovered,
  toggleTimeGuidePinned,
  useCalendarView,
  useActiveDate,
  useMobileFocusDay,
  useTimeGuideVisible,
  useTimeGuidePinned,
} from './ui-store'
import {
  setDragState,
  setDragRender,
  clearDragRender,
  updateDragRenderFrame,
  useDragState,
  useDragRender,
  useDragSlotDay,
  useIsDragging,
} from './drag-store'
import {
  startSelection,
  updateSelection,
  endSelection,
  clearSelection,
  isSelectionActive,
  useIsCellSelected,
} from './hover-store'
import {
  applyConfig,
  setSlotDuration,
  setWorkHours,
  setUse24HourTime,
  setVisibleDays,
  setInteractionSettings,
  setDragMonitors,
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
} from '../config'
import {
  useCalendarEvents,
  useEventsForDay,
  useAllDayEvents,
  useCalendarDataState,
} from './event-store'

export const calendarSlices = {
  ui: {
    actions: {
      setView,
      setActiveDate,
      navigateToToday,
      setMobileFocusDay,
      setTimeChevronHovered,
      toggleTimeGuidePinned,
    },
    selectors: {
      useCalendarView,
      useActiveDate,
      useMobileFocusDay,
      useTimeGuideVisible,
      useTimeGuidePinned,
    },
  },
  drag: {
    actions: {
      setDragState,
      setDragRender,
      clearDragRender,
      updateDragRenderFrame,
    },
    selectors: {
      useDragState,
      useDragRender,
      useDragSlotDay,
      useIsDragging,
    },
  },
  hover: {
    actions: {
      startSelection,
      updateSelection,
      endSelection,
      clearSelection,
    },
    selectors: {
      isSelectionActive,
      useIsCellSelected,
    },
  },
  config: {
    actions: {
      applyConfig,
      setSlotDuration,
      setWorkHours,
      setUse24HourTime,
      setVisibleDays,
      setInteractionSettings,
      setDragMonitors,
    },
    selectors: {
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
    },
  },
  events: {
    selectors: {
      useCalendarEvents,
      useEventsForDay,
      useAllDayEvents,
      useCalendarDataState,
    },
  },
} as const
