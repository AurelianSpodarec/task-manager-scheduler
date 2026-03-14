import { useRef, useEffect, useState } from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEventsForDay, useSlotDuration } from '../../calendar-store'
import { DAY_START_HOUR, DAY_END_HOUR, HOUR_HEIGHT_PX, WEEK_DAY_LABELS } from '../../constants'
import { isToday, formatDayHeader } from '../../utils/date'
import { layoutEventsForDay } from '../../utils/layout'
import { makeSlotData, isCalendarDrag } from '../../hooks/use-calendar-dnd'
import { EventBlock } from '../event-block'
import { CurrentTimeLine } from './current-time-line'

type DayColumnProps = {
  day: Date
}

export function DayColumn({ day }: DayColumnProps) {
  const events = useEventsForDay(day)
  const layouts = layoutEventsForDay(events, HOUR_HEIGHT_PX)
  const today = isToday(day)
  const dayIndex = day.getDay()
  const slotDuration = useSlotDuration()
  const isoDay = day.toISOString().split('T')[0]

  // Build slot entries: each hour is split by slotDuration
  const slots: { hour: number; minute: number }[] = []
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
    for (let m = 0; m < 60; m += slotDuration) {
      slots.push({ hour: h, minute: m })
    }
  }

  return (
    <div
      className="relative flex min-w-0 flex-1 flex-col"
      role="gridcell"
      aria-label={`${WEEK_DAY_LABELS[dayIndex]} ${formatDayHeader(day)}`}
    >
      {/* Day header */}
      <div
        className={`flex h-cal-day-header shrink-0 flex-col items-center justify-center border-b border-cal-grid-line ${
          today ? 'bg-cal-today-bg' : ''
        }`}
      >
        <span className={`text-[var(--cal-text-2xs)] font-semibold uppercase tracking-wider ${today ? 'text-cal-today-text' : 'text-cal-text-muted'}`}>
          {WEEK_DAY_LABELS[dayIndex]}
        </span>
        <span className={`text-[var(--cal-text-base)] font-bold leading-none ${today ? 'text-cal-today-text' : 'text-cal-text'}`}>
          {formatDayHeader(day)}
        </span>
      </div>

      {/* Hourly grid + events */}
      <div className={`relative flex-1 ${today ? 'bg-cal-today-bg/30' : ''}`}>
        {slots.map(({ hour, minute }) => (
          <DroppableSlot
            key={`${hour}-${minute}`}
            isoDay={isoDay}
            hour={hour}
            minute={minute}
            height={(HOUR_HEIGHT_PX / 60) * slotDuration}
            showHourBorder={minute === 0}
            showHalfBorder={minute === 30}
          />
        ))}

        {/* Event blocks */}
        {layouts.map((layout) => (
          <EventBlock key={layout.event.id} layout={layout} />
        ))}

        <CurrentTimeLine day={day} />
      </div>
    </div>
  )
}

function DroppableSlot({
  isoDay,
  hour,
  minute,
  height,
  showHourBorder,
  showHalfBorder,
}: {
  isoDay: string
  hour: number
  minute: number
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
      className={`transition-colors ${
        showHourBorder ? 'border-b border-cal-grid-line' : showHalfBorder ? 'border-b border-cal-grid-line/40' : ''
      } ${isOver ? 'bg-cal-hover-bg' : ''}`}
      style={{ height: `${height}px` }}
    />
  )
}
