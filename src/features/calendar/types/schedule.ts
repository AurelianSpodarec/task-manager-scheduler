import type { ComponentType, CSSProperties, ReactElement, ReactNode } from 'react'
import type { EventColor, ScheduleMode, WeekStartDay } from './calendar'
import type { DragRenderState } from './drag'

export type DateStringValue = string
export type DateTimeStringValue = string

export type ScheduleViewLevel = 'day' | 'week'
export type ScheduleEventColor = EventColor | (string & {})
export type EventPayload = Record<PropertyKey, unknown>

export type ScheduleEventData<Payload extends EventPayload = EventPayload> = {
  id: string | number
  title: string
  start: Date | DateTimeStringValue
  end: Date | DateTimeStringValue
  color: ScheduleEventColor
  variant?: 'filled' | 'light'
  display?: 'default' | 'background'
  isAllDay?: boolean
  payload?: Payload
  className?: string
  style?: CSSProperties
  icon?: ComponentType<{ className?: string; animate?: boolean }>
}

export type RenderEventBody = (event: ScheduleEventData) => ReactNode

export type RenderEvent = (
  event: ScheduleEventData,
  props: React.ComponentPropsWithoutRef<'button'> & { children: ReactNode },
) => ReactElement

export type EventDateChangeHandler = (
  eventId: string | number,
  newStart: DateTimeStringValue,
  newEnd: DateTimeStringValue,
  event: ScheduleEventData,
) => void

export type EventRemoveHandler = (eventId: string | number, event: ScheduleEventData | null) => void

export type ExternalEventDropHandler = (
  dataTransfer: DataTransfer,
  dropDateTime: DateTimeStringValue,
) => void

type SharedViewProps = {
  date: Date | DateStringValue
  onDateChange?: (value: DateStringValue) => void
  events?: ScheduleEventData[]
  startTime?: string
  endTime?: string
  intervalMinutes?: number
  withHeader?: boolean
  withAllDaySlot?: boolean
  withCurrentTimeIndicator?: boolean
  withEventsDragAndDrop?: boolean
  withDragSlotSelect?: boolean
  startScrollTime?: string
  mode?: ScheduleMode
  onEventDrop?: EventDateChangeHandler
  onEventRemove?: EventRemoveHandler
  onEventIconClick?: (eventId: string | number, e: React.MouseEvent) => void
  onEventClick?: (event: ScheduleEventData, e: React.MouseEvent<HTMLButtonElement>) => void
  onTimeSlotClick?: (
    slotStart: DateTimeStringValue,
    slotEnd: DateTimeStringValue,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void
  onAllDaySlotClick?: (
    date: DateStringValue,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void
  onSlotDragEnd?: (rangeStart: DateTimeStringValue, rangeEnd: DateTimeStringValue) => void
  onExternalEventDrop?: ExternalEventDropHandler
  renderEventBody?: RenderEventBody
  renderEvent?: RenderEvent
  renderDragPreview?: (drag: DragRenderState) => ReactNode
}

export type DayViewProps = SharedViewProps

export type WeekViewProps = SharedViewProps & {
  firstDayOfWeek?: WeekStartDay
  weekendDays?: number[]
  withWeekendDays?: boolean
  highlightToday?: boolean
  withWeekNumber?: boolean
}

export type ScheduleProps = {
  date?: Date | DateStringValue
  defaultDate?: Date | DateStringValue
  onDateChange?: (value: DateStringValue) => void
  view?: ScheduleViewLevel
  defaultView?: ScheduleViewLevel
  onViewChange?: (view: ScheduleViewLevel) => void
  events?: ScheduleEventData[]
  mode?: ScheduleMode
  withEventsDragAndDrop?: boolean
  withDragSlotSelect?: boolean
  showSettingsPanel?: boolean
  onEventDrop?: EventDateChangeHandler
  onEventRemove?: EventRemoveHandler
  onEventIconClick?: (eventId: string | number, e: React.MouseEvent) => void
  onEventClick?: (event: ScheduleEventData, e: React.MouseEvent<HTMLButtonElement>) => void
  onTimeSlotClick?: (
    slotStart: DateTimeStringValue,
    slotEnd: DateTimeStringValue,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void
  onAllDaySlotClick?: (
    date: DateStringValue,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void
  onSlotDragEnd?: (rangeStart: DateTimeStringValue, rangeEnd: DateTimeStringValue) => void
  onExternalEventDrop?: ExternalEventDropHandler
  renderEventBody?: RenderEventBody
  renderEvent?: RenderEvent
  renderDragPreview?: (drag: DragRenderState) => ReactNode
  dayViewProps?: Partial<Omit<DayViewProps, 'date' | 'onDateChange' | 'events'>>
  weekViewProps?: Partial<Omit<WeekViewProps, 'date' | 'onDateChange' | 'events'>>
}
