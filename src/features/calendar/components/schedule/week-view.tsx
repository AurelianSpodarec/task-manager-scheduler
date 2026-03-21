import { Schedule } from './schedule'
import type { WeekViewProps } from '../../types'

export function WeekView(props: WeekViewProps) {
  const {
    date,
    onDateChange,
    events,
    mode,
    withEventsDragAndDrop,
    withDragSlotSelect,
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
    startTime,
    endTime,
    intervalMinutes,
    withHeader,
    withAllDaySlot,
    withCurrentTimeIndicator,
    startScrollTime,
    firstDayOfWeek,
    weekendDays,
    withWeekendDays,
    highlightToday,
    withWeekNumber,
  } = props

  return (
    <Schedule
      date={date}
      view="week"
      onDateChange={onDateChange}
      events={events}
      mode={mode}
      withEventsDragAndDrop={withEventsDragAndDrop}
      withDragSlotSelect={withDragSlotSelect}
      onEventDrop={onEventDrop}
      onEventRemove={onEventRemove}
      onEventIconClick={onEventIconClick}
      onEventClick={onEventClick}
      onTimeSlotClick={onTimeSlotClick}
      onAllDaySlotClick={onAllDaySlotClick}
      onSlotDragEnd={onSlotDragEnd}
      onExternalEventDrop={onExternalEventDrop}
      renderEventBody={renderEventBody}
      renderEvent={renderEvent}
      renderDragPreview={renderDragPreview}
      weekViewProps={{
        startTime,
        endTime,
        intervalMinutes,
        withHeader,
        withAllDaySlot,
        withCurrentTimeIndicator,
        startScrollTime,
        firstDayOfWeek,
        weekendDays,
        withWeekendDays,
        highlightToday,
        withWeekNumber,
      }}
    />
  )
}
