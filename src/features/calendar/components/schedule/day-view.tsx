import { Schedule } from './schedule'
import type { DayViewProps } from '../../types'

export function DayView(props: DayViewProps) {
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
  } = props

  return (
    <Schedule
      date={date}
      view="day"
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
      dayViewProps={{
        startTime,
        endTime,
        intervalMinutes,
        withHeader,
        withAllDaySlot,
        withCurrentTimeIndicator,
        startScrollTime,
      }}
    />
  )
}
