import { useRef, useEffect, useState } from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { addMinutes, setHours, setMinutes } from 'date-fns'
import { useEventsForDay, useSlotDuration, useDragRender } from '../../calendar-store'
import { DAY_START_HOUR, DAY_END_HOUR, HOUR_HEIGHT_PX, EVENT_COLOR_MAP } from '../../constants'
import { isToday, startOfDay, formatEventTime, dateToPixelOffset, durationToPixelHeight } from '../../utils/date'
import { layoutEventsForDay } from '../../utils/layout'
import { makeSlotData, isCalendarDrag } from '../../hooks/use-calendar-dnd'
import { EventBlock } from '../event-block'
import { CurrentTimeLine } from './current-time-line'
import type { CalendarEvent, DragRenderState } from '../../types'

type DayColumnProps = {
  day: Date
}

export function DayColumn({ day }: DayColumnProps) {
  const events = useEventsForDay(day)
  const layouts = layoutEventsForDay(events, HOUR_HEIGHT_PX)
  const today = isToday(day)
  const slotDuration = useSlotDuration()
  const dragRender = useDragRender()
  const isoDay = day.toISOString().split('T')[0]
  const isDragging = dragRender?.source === 'calendar'
  const projected = getProjectedCard(dragRender, isoDay, events)

  const slots: { hour: number; minute: number }[] = []
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
    for (let m = 0; m < 60; m += slotDuration) {
      slots.push({ hour: h, minute: m })
    }
  }

  return (
    <div
      className="relative min-w-0 border-r border-cal-grid-line"
      role="gridcell"
      data-date={isoDay}
      aria-current={today ? 'date' : undefined}
    >
      <div className={`relative ${today ? 'bg-cal-today-bg/30' : ''}`}>
        {slots.map(({ hour, minute }) => {
          const slotEnd = minute + slotDuration
          return (
            <DroppableSlot
              key={`${hour}-${minute}`}
              isoDay={isoDay}
              hour={hour}
              minute={minute}
              isDragging={isDragging}
              height={(HOUR_HEIGHT_PX / 60) * slotDuration}
              showHourBorder={slotEnd >= 60}
              showHalfBorder={slotEnd === 30}
            />
          )
        })}

        {/* Event blocks */}
        {layouts.map((layout) => (
          <EventBlock key={layout.event.id} layout={layout} />
        ))}

        {projected && (
          <div
            className="pointer-events-none absolute z-20 flex min-h-5 flex-col overflow-hidden rounded-[var(--cal-radius-event)] border-l-[3px] px-[var(--cal-event-padding-x)] py-[var(--cal-event-padding-y)] shadow-[var(--cal-shadow-event)] ring-1 ring-white/35"
            style={{
              top: `${projected.top}px`,
              height: `${Math.max(projected.height, 20)}px`,
              left: '2px',
              right: '2px',
              backgroundColor: projected.bg,
              color: projected.text,
              borderColor: projected.border,
            }}
            aria-hidden="true"
          >
            <span className="truncate text-[var(--cal-text-xs)] font-semibold leading-tight">
              {projected.title}
            </span>
            <span className="mt-auto text-[var(--cal-text-2xs)] leading-tight opacity-90">
              {formatEventTime(projected.start)} - {formatEventTime(projected.end)}
            </span>
          </div>
        )}

        <CurrentTimeLine day={day} />
      </div>
    </div>
  )
}

export default DayColumn

function DroppableSlot({
  isoDay,
  hour,
  minute,
  isDragging,
  height,
  showHourBorder,
  showHalfBorder,
}: {
  isoDay: string
  hour: number
  minute: number
  isDragging: boolean
  height: number
  showHourBorder: boolean
  showHalfBorder: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isOver, setIsOver] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => isCalendarDrag(source.data),
      getData: () => makeSlotData(isoDay, hour, minute),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    })
  }, [isoDay, hour, minute])

  return (
    <div
      ref={ref}
      className={`${isDragging ? 'transition-none' : 'transition-colors'} ${
        showHourBorder ? 'border-b border-cal-grid-line' : showHalfBorder ? 'border-b border-dotted border-cal-grid-line' : ''
      } ${isOver ? 'bg-cal-hover-bg' : ''}`}
      style={{ height: `${height}px` }}
    />
  )
}

function getProjectedCard(
  dragRender: DragRenderState | null,
  isoDay: string,
  events: CalendarEvent[],
) {
  if (dragRender?.source !== 'calendar' || !dragRender.eventId || !dragRender.slot) return null
  if (dragRender.slot.isoDay !== isoDay) return null

  const event = events.find((item) => item.id === dragRender.eventId)
  if (!event) return null

  const day = new Date(dragRender.slot.isoDay)
  const start = setMinutes(setHours(startOfDay(day), dragRender.slot.hour), dragRender.slot.minute)
  const durationMinutes =
    dragRender.durationMinutes ??
    Math.max(1, Math.round((event.end.getTime() - event.start.getTime()) / 60000))
  const end = addMinutes(start, durationMinutes)
  const colors = EVENT_COLOR_MAP[event.color]

  return {
    title: event.title,
    start,
    end,
    top: dateToPixelOffset(start, HOUR_HEIGHT_PX),
    height: durationToPixelHeight(start, end, HOUR_HEIGHT_PX),
    bg: colors.bg,
    text: colors.text,
    border: colors.border,
  }
}
