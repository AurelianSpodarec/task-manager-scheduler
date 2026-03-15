import { useEventsForDay, useSlotDuration, useDragRender, useWorkHours, isWithinWorkHours } from '../../calendar-store'
import { DAY_START_HOUR, DAY_END_HOUR, HOUR_HEIGHT_PX } from '../../constants'
import { isToday } from '../../utils/date'
import { layoutEventsForDay } from '../../utils/layout'
import { EventBlock } from '../event-block'
import { CurrentTimeLine } from './current-time-line'
import { DroppableSlot } from './droppable-slot'
import { ProjectedGhostCard, getProjectedCard } from './projected-ghost-card'

type DayColumnProps = {
  day: Date
}

export function DayColumn({ day }: DayColumnProps) {
  const events = useEventsForDay(day)
  const layouts = layoutEventsForDay(events, HOUR_HEIGHT_PX)
  const today = isToday(day)
  const slotDuration = useSlotDuration()
  const dragRender = useDragRender()
  const workHours = useWorkHours()
  const isoDay = day.toISOString().split('T')[0]
  const dayOfWeek = day.getDay()
  const isDragging = dragRender != null
  const projected = getProjectedCard(dragRender, isoDay, slotDuration)

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
              isOffHours={!isWithinWorkHours(dayOfWeek, hour, workHours)}
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
          <ProjectedGhostCard projected={projected} />
        )}

        <CurrentTimeLine day={day} />
      </div>
    </div>
  )
}

export default DayColumn
