import { useRef, useEffect, useState } from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEventsForDay, useSlotDuration } from '../../calendar-store'
import { DAY_START_HOUR, DAY_END_HOUR, HOUR_HEIGHT_PX } from '../../constants'
import { isToday } from '../../utils/date'
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
  const slotDuration = useSlotDuration()
  const isoDay = day.toISOString().split('T')[0]

  const slots: { hour: number; minute: number }[] = []
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
    for (let m = 0; m < 60; m += slotDuration) {
      slots.push({ hour: h, minute: m })
    }
  }

  return (
    <div
      className="relative min-w-0"
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
        showHourBorder ? 'border-b border-cal-grid-line' : showHalfBorder ? 'border-b border-dashed border-cal-grid-line/40' : ''
      } ${isOver ? 'bg-cal-hover-bg' : ''}`}
      style={{ height: `${height}px` }}
    />
  )
}
