import { useEffect, useRef } from 'react'
import { useEventsForDay, useSlotDuration, useDragRender, useDragSlotDay, useIsDragging, useWorkHours, isWithinWorkHours, useDayStartHour, useDayEndHour } from '../../calendar-store'
import { HOUR_HEIGHT_PX } from '../../constants'
import { isToday } from '../../utils/date'
import { layoutEventsForDay } from '../../utils/layout'
import { EventBlock } from '../event-block'
import { CurrentTimeLine } from './current-time-line'
import { DroppableSlot } from './droppable-slot'
import { getProjectedCard } from './projected-card'
import { ProjectedGhostCard } from './projected-ghost-card'
import { registerDayColumn } from '../../dnd/region-registry'
import { useCalendarInstanceId } from '../../core/calendar-instance'

// Cached slot grid — only reallocates when the parameters actually change
type SlotEntry = { hour: number; minute: number }
let _slotCache: { key: string; slots: SlotEntry[] } | null = null

function getSlots(startHour: number, endHour: number, duration: number): SlotEntry[] {
  const key = `${startHour}-${endHour}-${duration}`
  if (_slotCache?.key === key) return _slotCache.slots
  const slots: SlotEntry[] = []
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += duration) {
      slots.push({ hour: h, minute: m })
    }
  }
  _slotCache = { key, slots }
  return slots
}

type DayColumnProps = {
  day: Date
}

export function DayColumn({ day }: DayColumnProps) {
  const events = useEventsForDay(day)
  const layouts = layoutEventsForDay(events, day, HOUR_HEIGHT_PX)
  const today = isToday(day)
  const slotDuration = useSlotDuration()
  const isDragging = useIsDragging()
  const dragSlotDay = useDragSlotDay()
  const workHours = useWorkHours()
  const dayStartHour = useDayStartHour()
  const dayEndHour = useDayEndHour()
  const isoDay = day.toISOString().split('T')[0]
  const instanceId = useCalendarInstanceId()
  const rootRef = useRef<HTMLDivElement>(null)
  const dayOfWeek = day.getDay()

  // Only subscribe to the full drag render state when this column is targeted
  const dragRender = useDragRender()
  const projected = dragSlotDay === isoDay
    ? getProjectedCard(dragRender, isoDay, slotDuration)
    : null
  const slots = getSlots(dayStartHour, dayEndHour, slotDuration)

  useEffect(() => {
    const element = rootRef.current
    if (!element) return
    return registerDayColumn(instanceId, isoDay, element)
  }, [instanceId, isoDay])

  return (
    <div
      ref={rootRef}
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
              slotDuration={slotDuration}
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
