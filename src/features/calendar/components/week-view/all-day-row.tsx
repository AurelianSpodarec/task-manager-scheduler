import { useEffect, useRef, type ReactNode } from 'react'
import { getConfig } from '../../config'
import {
  useAllDayEvents,
  useDragRender,
  useExternalEventDrop,
  useMode,
  useWithEventsDragAndDrop,
} from '../../calendar-store'
import { isSameDay } from '../../utils/date'
import { EVENT_COLOR_MAP } from '../../constants'
import type { CalendarEvent } from '../../types'
import { isCalendarDrag, makeAllDaySlotData, makeEventDragData } from '../../dnd'
import { useCalendarDragSource, useCalendarDropTarget } from '../../hooks/use-dnd-behaviors'
import { registerAllDayRow } from '../../dnd/region-registry'
import { useCalendarInstanceId } from '../../core/calendar-instance'
import { formatDateTimeValue } from '../../utils/schedule'

type AllDayRowProps = {
  weekDays: Date[]
}

export function AllDayRow({ weekDays }: AllDayRowProps) {
  const allDayEvents = useAllDayEvents(weekDays[0], weekDays[weekDays.length - 1])
  const rowRef = useRef<HTMLDivElement>(null)
  const instanceId = useCalendarInstanceId()

  useEffect(() => {
    const element = rowRef.current
    if (!element) return
    return registerAllDayRow(instanceId, element)
  }, [instanceId])

  return (
    <div
      ref={rowRef}
      data-allday-row
      className="cal-week-grid-header sticky top-0 z-20 hidden shrink-0 border-b-2 border-cal-grid-line bg-cal-bg md:grid"
    >
      {/* Gutter */}
      <div className="flex items-start justify-end border-r border-cal-grid-line pr-2 pt-0.5" aria-hidden="true">
        <span className="text-[9px] font-medium text-cal-text-muted">
          All-day
        </span>
      </div>

      {weekDays.map((day) => {
        const dayEvents = allDayEvents.filter((e) => isSameDay(e.start, day))
        return (
          <DroppableAllDayCell
            key={day.toISOString()}
            day={day}
            eventIds={dayEvents.map((e) => e.id)}
          >
            {dayEvents.map((event) => (
              <AllDayEventChip key={event.id} event={event} />
            ))}
          </DroppableAllDayCell>
        )
      })}

      {/* Scrollbar spacer */}
      <div aria-hidden="true" />
    </div>
  )
}

function AllDayEventChip({ event }: { event: CalendarEvent }) {
  const mode = useMode()
  const withEventsDragAndDrop = useWithEventsDragAndDrop()
  const colors = EVENT_COLOR_MAP[event.color]
  const { ref, isDragging, onPointerDown } = useCalendarDragSource<HTMLDivElement>({
    createDragData: () => makeEventDragData(event),
    disabled: mode === 'static' || !withEventsDragAndDrop,
  })

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      className={`mb-0.5 cursor-grab truncate rounded-[var(--cal-radius-pill)] px-1.5 py-0.5 text-[11px] font-semibold ${isDragging ? 'opacity-30' : ''}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {event.title}
    </div>
  )
}

function DroppableAllDayCell({
  day,
  children,
  eventIds,
}: {
  day: Date
  children: ReactNode
  eventIds: string[]
}) {
  const mode = useMode()
  const onExternalEventDrop = useExternalEventDrop()
  const isoDay = day.toISOString().split('T')[0]
  const dragRender = useDragRender()
  const { ref, isOver: pragmaticOver } = useCalendarDropTarget<HTMLDivElement, ReturnType<typeof makeAllDaySlotData>>({
    enabled: mode !== 'static',
    canDrop: isCalendarDrag,
    getData: () => makeAllDaySlotData(isoDay),
  })

  const pointerOver = Boolean(
    dragRender?.slot?.isAllDay && dragRender.slot.isoDay === isoDay,
  )
  const isOver = pragmaticOver || pointerOver

  // Skip ghost when the dragged event already lives in this cell
  const isOriginCell = dragRender?.eventId != null && eventIds.includes(dragRender.eventId)
  const ghostColor = pointerOver && !isOriginCell && dragRender ? EVENT_COLOR_MAP[dragRender.color] : null

  return (
    <div
      ref={ref}
      className={`min-w-0 border-r border-cal-grid-line p-0.5 transition-colors ${isOver ? 'bg-cal-hover-bg' : ''}`}
      onDragOver={(e) => {
        if (mode === 'static' || !onExternalEventDrop) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
      }}
      onDrop={(e) => {
        if (mode === 'static' || !onExternalEventDrop) return
        e.preventDefault()
        const dropDate = new Date(`${isoDay}T00:00:00`)
        onExternalEventDrop(e.dataTransfer, formatDateTimeValue(dropDate))
      }}
      onClick={(e) => {
        if (mode === 'static') return
        getConfig().onAllDaySlotClick?.(isoDay, e)
      }}
    >
      {children}
      {ghostColor && (
        <div
          className="pointer-events-none mb-0.5 truncate rounded-[var(--cal-radius-pill)] px-1.5 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: ghostColor.bg, color: ghostColor.text }}
          aria-hidden="true"
        >
          {dragRender!.title ?? 'New Event'}
        </div>
      )}
    </div>
  )
}
