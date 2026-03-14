import { useEffect, useRef, useCallback, useState, type ReactNode } from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useAllDayEvents } from '../../calendar-store'
import { isSameDay } from '../../utils/date'
import { EVENT_COLOR_MAP } from '../../constants'
import type { CalendarEvent } from '../../types'
import { isCalendarDrag, makeAllDaySlotData, makeEventDragData, startPointerDrag } from '../../hooks/use-calendar-dnd'

type AllDayRowProps = {
  weekDays: Date[]
}

export function AllDayRow({ weekDays }: AllDayRowProps) {
  const allDayEvents = useAllDayEvents(weekDays[0], weekDays[6])

  return (
    <div data-allday-row className="cal-week-grid-header sticky top-0 z-20 hidden min-h-cal-allday shrink-0 border-b-2 border-cal-grid-line bg-cal-bg md:grid">
      {/* Gutter */}
      <div className="flex items-start justify-end border-r border-cal-grid-line pr-2 pt-1" aria-hidden="true">
        <span className="text-[11px] font-medium text-cal-text-muted">
          All-day
        </span>
      </div>

      {weekDays.map((day) => (
        <DroppableAllDayCell
          key={day.toISOString()}
          day={day}
        >
          {allDayEvents
            .filter((e) => isSameDay(e.start, day))
            .map((event) => (
              <AllDayEventChip key={event.id} event={event} />
            ))}
        </DroppableAllDayCell>
      ))}

      {/* Scrollbar spacer */}
      <div aria-hidden="true" />
    </div>
  )
}

function AllDayEventChip({ event }: { event: CalendarEvent }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const colors = EVENT_COLOR_MAP[event.color]

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    const el = ref.current
    if (!el) return
    startPointerDrag(el, e.nativeEvent, makeEventDragData(event), {
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    })
  }, [event])

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
}: {
  day: Date
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isOver, setIsOver] = useState(false)
  const isoDay = day.toISOString().split('T')[0]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => isCalendarDrag(source.data),
      getData: () => makeAllDaySlotData(isoDay),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    })
  }, [isoDay])

  return (
    <div
      ref={ref}
      className={`min-w-0 border-r border-cal-grid-line p-0.5 transition-colors ${isOver ? 'bg-cal-hover-bg' : ''}`}
    >
      {children}
    </div>
  )
}
