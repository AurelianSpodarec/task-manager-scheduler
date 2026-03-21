import { useEffect, useMemo, useRef, useState } from 'react'
import type { CalendarConfigUpdate, CalendarEvent } from '../../calendar-store'
import {
  applyConfig,
  setActiveDate,
  setView,
  useActiveDate,
  useCalendarEvents,
  useCalendarView,
} from '../../calendar-store'
import { CalendarShell } from '../calendar-shell'
import type { ScheduleProps, ScheduleViewLevel } from '../../types'
import {
  formatDateTimeValue,
  formatDateValue,
  resolveVisibleDays,
  timeStringToHour,
  toCalendarEvent,
  toDate,
  toNearestSlotDuration,
  toScheduleEvent,
} from '../../utils/schedule'

function isScheduleViewLevel(view: string): view is ScheduleViewLevel {
  return view === 'day' || view === 'week'
}

function resolveDateInput(value: Date | string | undefined): Date | null {
  if (value == null) return null
  return toDate(value)
}

export function Schedule({
  date,
  defaultDate,
  onDateChange,
  view,
  defaultView,
  onViewChange,
  events,
  mode,
  withEventsDragAndDrop,
  withDragSlotSelect,
  showSettingsPanel = false,
  onEventDrop,
  onEventRemove,
  onEventIconClick,
  onEventClick,
  onTimeSlotClick,
  onAllDaySlotClick,
  onSlotDragEnd,
  onExternalEventDrop,
  renderEventBody,
  renderEvent,
  renderDragPreview,
  dayViewProps,
  weekViewProps,
}: ScheduleProps) {
  const storeDate = useActiveDate()
  const storeView = useCalendarView()
  const currentEvents = useCalendarEvents()

  const controlledDate = resolveDateInput(date)
  const [initialDate] = useState<Date>(() => (
    resolveDateInput(defaultDate) ?? resolveDateInput(date) ?? new Date()
  ))
  const [initialView] = useState<ScheduleViewLevel>(() => (
    defaultView ?? view ?? 'week'
  ))
  const didInitializeRef = useRef(false)
  const resolvedDate = controlledDate ?? storeDate
  const resolvedView = view ?? (isScheduleViewLevel(storeView) ? storeView : initialView)
  const activeViewProps = resolvedView === 'day' ? dayViewProps : weekViewProps

  const mappedEvents = useMemo(
    () => events?.map(toCalendarEvent),
    [events],
  )

  const eventsRef = useRef<CalendarEvent[]>(currentEvents)
  const onEventDropRef = useRef(onEventDrop)
  const onEventRemoveRef = useRef(onEventRemove)
  const onEventIconClickRef = useRef(onEventIconClick)
  const onEventClickRef = useRef(onEventClick)
  const onTimeSlotClickRef = useRef(onTimeSlotClick)
  const onAllDaySlotClickRef = useRef(onAllDaySlotClick)
  const onExternalEventDropRef = useRef(onExternalEventDrop)
  const onViewChangeRef = useRef(onViewChange)
  const onDateChangeRef = useRef(onDateChange)
  useEffect(() => {
    eventsRef.current = currentEvents
    onEventDropRef.current = onEventDrop
    onEventRemoveRef.current = onEventRemove
    onEventIconClickRef.current = onEventIconClick
    onEventClickRef.current = onEventClick
    onTimeSlotClickRef.current = onTimeSlotClick
    onAllDaySlotClickRef.current = onAllDaySlotClick
    onExternalEventDropRef.current = onExternalEventDrop
    onViewChangeRef.current = onViewChange
    onDateChangeRef.current = onDateChange
  }, [
    currentEvents,
    onEventDrop,
    onEventRemove,
    onEventIconClick,
    onEventClick,
    onTimeSlotClick,
    onAllDaySlotClick,
    onExternalEventDrop,
    onViewChange,
    onDateChange,
  ])

  useEffect(() => {
    if (didInitializeRef.current) return
    didInitializeRef.current = true
    if (date == null && storeDate.getTime() !== initialDate.getTime()) {
      setActiveDate(initialDate)
    }
    if (view == null && storeView !== initialView) {
      setView(initialView)
    }
  }, [date, view, storeDate, storeView, initialDate, initialView])

  useEffect(() => {
    if (storeView !== resolvedView) {
      setView(resolvedView)
    }
  }, [resolvedView, storeView])

  useEffect(() => {
    if (storeDate.getTime() !== resolvedDate.getTime()) {
      setActiveDate(resolvedDate)
    }
  }, [resolvedDate, storeDate])

  const lastReportedDateRef = useRef(storeDate.getTime())
  useEffect(() => {
    const next = storeDate.getTime()
    if (next === lastReportedDateRef.current) return
    lastReportedDateRef.current = next
    onDateChangeRef.current?.(formatDateValue(storeDate))
  }, [storeDate])

  const lastReportedViewRef = useRef(storeView)
  useEffect(() => {
    if (storeView === lastReportedViewRef.current) return
    lastReportedViewRef.current = storeView
    if (isScheduleViewLevel(storeView)) {
      onViewChangeRef.current?.(storeView)
    }
  }, [storeView])

  useEffect(() => {
    const slotDuration = toNearestSlotDuration(activeViewProps?.intervalMinutes)
    const visibleDays = resolveVisibleDays(
      weekViewProps?.withWeekendDays,
      weekViewProps?.weekendDays,
    )
    const resolvedMode = activeViewProps?.mode ?? mode ?? 'default'
    const resolvedWithHeader = activeViewProps?.withHeader ?? true
    const resolvedWithAllDaySlot = activeViewProps?.withAllDaySlot ?? true
    const resolvedWithCurrentTimeIndicator = activeViewProps?.withCurrentTimeIndicator ?? true
    const resolvedWithDnd = activeViewProps?.withEventsDragAndDrop ?? withEventsDragAndDrop ?? false

    const update: CalendarConfigUpdate = {
      mode: resolvedMode,
      withHeader: resolvedWithHeader,
      withAllDaySlot: resolvedWithAllDaySlot,
      withCurrentTimeIndicator: resolvedWithCurrentTimeIndicator,
      withEventsDragAndDrop: resolvedWithDnd,
      events: mappedEvents,
      renderEventBody: renderEventBody
        ? (event) => renderEventBody(toScheduleEvent(event))
        : undefined,
      renderEvent: renderEvent
        ? (event, props) => renderEvent(toScheduleEvent(event), props)
        : undefined,
      renderDragPreview,
      onExternalEventDrop: (dataTransfer, dropDateTime) => {
        onExternalEventDropRef.current?.(dataTransfer, dropDateTime)
      },
      onEventClick: (event, e) => {
        onEventClickRef.current?.(toScheduleEvent(event), e)
      },
      onTimeSlotClick: (slotStart, slotEnd, e) => {
        onTimeSlotClickRef.current?.(
          slotStart,
          slotEnd,
          e as unknown as React.MouseEvent<HTMLButtonElement>,
        )
      },
      onAllDaySlotClick: (slotDay, e) => {
        onAllDaySlotClickRef.current?.(
          slotDay,
          e as unknown as React.MouseEvent<HTMLButtonElement>,
        )
      },
      eventHandlers: {
        onEventDrop: (eventId, start, end, isAllDay) => {
          const found = eventsRef.current.find((event) => event.id === eventId)
          const nextEvent = found
            ? { ...found, start, end, isAllDay }
            : {
                id: eventId,
                sourceId: eventId,
                title: '',
                start,
                end,
                isAllDay,
                color: 'teal' as const,
              }
          const scheduleEvent = toScheduleEvent(nextEvent)
          onEventDropRef.current?.(
            scheduleEvent.id,
            formatDateTimeValue(start),
            formatDateTimeValue(end),
            scheduleEvent,
          )
        },
        onEventMove: (eventId, start, end, isAllDay) => {
          const found = eventsRef.current.find((event) => event.id === eventId)
          const nextEvent = found
            ? { ...found, start, end, isAllDay }
            : {
                id: eventId,
                sourceId: eventId,
                title: '',
                start,
                end,
                isAllDay,
                color: 'teal' as const,
              }
          const scheduleEvent = toScheduleEvent(nextEvent)
          onEventDropRef.current?.(
            scheduleEvent.id,
            formatDateTimeValue(start),
            formatDateTimeValue(end),
            scheduleEvent,
          )
        },
        onEventRemove: (eventId) => {
          const found = eventsRef.current.find((event) => event.id === eventId)
          onEventRemoveRef.current?.(
            found?.sourceId ?? eventId,
            found ? toScheduleEvent(found) : null,
          )
        },
        onIconClick: (eventId, e) => {
          const found = eventsRef.current.find((event) => event.id === eventId)
          onEventIconClickRef.current?.(found?.sourceId ?? eventId, e)
        },
      },
    }

    if (slotDuration != null) update.slotDuration = slotDuration
    if (activeViewProps?.startTime != null) {
      update.dayStartHour = timeStringToHour(activeViewProps.startTime, 0)
    }
    if (activeViewProps?.endTime != null) {
      update.dayEndHour = timeStringToHour(activeViewProps.endTime, 24)
    }
    if (activeViewProps?.startScrollTime != null || activeViewProps?.startTime != null) {
      update.visibleStartHour = timeStringToHour(
        activeViewProps?.startScrollTime ?? activeViewProps?.startTime,
        7,
      )
    }
    if (resolvedView === 'week') {
      if (weekViewProps?.firstDayOfWeek != null) update.weekStartsOn = weekViewProps.firstDayOfWeek
      if (visibleDays) update.visibleDays = visibleDays
    }
    if (withDragSlotSelect != null) {
      // Existing engine always supports pointer drag selection in slot cells.
      // This flag is kept for API parity and future toggle support.
    }
    if (onSlotDragEnd != null) {
      // Existing engine currently exposes cell selection state but not slot-range callback plumbing.
      // Kept for API parity and future hook-up.
    }

    applyConfig(update)
  }, [
    activeViewProps,
    weekViewProps,
    resolvedView,
    mode,
    withEventsDragAndDrop,
    withDragSlotSelect,
    onSlotDragEnd,
    mappedEvents,
    renderEventBody,
    renderEvent,
    renderDragPreview,
  ])

  return <CalendarShell showSettingsPanel={showSettingsPanel} />
}
