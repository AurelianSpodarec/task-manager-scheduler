import { useRef, useEffect, useState } from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { addMinutes, setHours, setMinutes } from 'date-fns'
import { Check } from 'lucide-react'
import { useEventsForDay, useSlotDuration, useDragRender, useWorkHours, isWithinWorkHours } from '../../calendar-store'
import { DAY_START_HOUR, DAY_END_HOUR, HOUR_HEIGHT_PX, EVENT_STATUS_INDICATOR_COLORS } from '../../constants'
import {
  personalActivityStyles,
  personalActivityIcons,
  type PersonalActivityType,
} from '@/lib/personal-activity'
import { isToday, startOfDay, formatEventTime, dateToPixelOffset, durationToPixelHeight } from '../../utils/date'
import { layoutEventsForDay } from '../../utils/layout'
import { makeSlotData, isCalendarDrag } from '../../hooks/use-calendar-dnd'
import { priorityLeftBorderColor } from '@/lib/priority'
import { EventBlock } from '../event-block'
import { CurrentTimeLine } from './current-time-line'
import type { DragRenderState, EventPriority, EventStatus } from '../../types'

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

function DroppableSlot({
  isoDay,
  hour,
  minute,
  isDragging,
  isOffHours,
  height,
  showHourBorder,
  showHalfBorder,
}: {
  isoDay: string
  hour: number
  minute: number
  isDragging: boolean
  isOffHours: boolean
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
      } ${isOver ? 'bg-cal-hover-bg' : isOffHours ? 'bg-cal-offhours-bg' : ''}`}
      style={{ height: `${height}px` }}
    />
  )
}

type ProjectedCard = {
  title: string
  start: Date
  end: Date
  top: number
  height: number
  status: EventStatus
  priority: EventPriority
  personalActivityType?: string
}

function ProjectedGhostCard({ projected }: { projected: ProjectedCard }) {
  const isCompact = projected.height < 40
  const priorityBorderColor = priorityLeftBorderColor[projected.priority]
  const verticalInsetPx = 2
  const renderedHeightPx = Math.max(projected.height - verticalInsetPx * 2, 16)

  const isPersonal = projected.personalActivityType != null
  const activityType = projected.personalActivityType as PersonalActivityType | undefined
  const ActivityIcon = activityType ? personalActivityIcons[activityType] : null
  const activityClasses = activityType ? personalActivityStyles[activityType] : ''

  return (
    <div
      className={`pointer-events-none absolute z-20 flex min-h-4 flex-col overflow-hidden rounded-[7px] border px-2 py-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-zinc-200/50 ${
        isPersonal ? activityClasses : 'border-zinc-200 bg-white'
      }`}
      style={{
        top: `${projected.top + verticalInsetPx}px`,
        height: `${renderedHeightPx}px`,
        left: '2px',
        right: '2px',
      }}
      aria-hidden="true"
    >
      {!isPersonal && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ left: 0, top: 0, bottom: 0, width: 3, backgroundColor: priorityBorderColor }}
        />
      )}
      {/* Row 1: icon + title */}
      <div className="flex min-w-0 items-center gap-1.5">
        {isPersonal && ActivityIcon ? (
          <ActivityIcon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
        ) : projected.status === 'completed' ? (
          <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: EVENT_STATUS_INDICATOR_COLORS.completedFill }}>
            <Check className="size-2 text-white" strokeWidth={3} />
          </span>
        ) : (
          <span className="size-3.5 shrink-0 rounded-full border-2" style={{ borderColor: EVENT_STATUS_INDICATOR_COLORS.pendingBorder }} />
        )}
        <span className={`min-w-0 flex-1 truncate font-semibold leading-tight ${isCompact ? 'text-[10px]' : 'text-[12px]'}`}>
          {projected.title}
        </span>
      </div>

      {/* Row 2: time range */}
      {!isCompact && (
        <span className={`mt-0.5 text-[10px] leading-tight ${isPersonal ? 'opacity-70' : 'text-zinc-500'}`}>
          {formatEventTime(projected.start)} – {formatEventTime(projected.end)}
        </span>
      )}
    </div>
  )
}

function getProjectedCard(
  dragRender: DragRenderState | null,
  isoDay: string,
  slotDuration: number,
): ProjectedCard | null {
  if (!dragRender?.slot) return null
  if (dragRender.slot.isAllDay) return null
  if (dragRender.slot.isoDay !== isoDay) return null

  const day = new Date(dragRender.slot.isoDay)
  const slotStart = setMinutes(setHours(startOfDay(day), dragRender.slot.hour), dragRender.slot.minute)

  // Offset so the card stays anchored at the grab point, not the top
  const grabOffsetMin = dragRender.source === 'calendar'
    ? Math.round(((dragRender.pointerOffset.y / HOUR_HEIGHT_PX) * 60) / slotDuration) * slotDuration
    : 0
  const start = addMinutes(slotStart, -grabOffsetMin)

  const durationMinutes = dragRender.durationMinutes ?? 60
  const end = addMinutes(start, durationMinutes)

  // Resolve priority + status from whichever meta is available
  const priority: EventPriority =
    dragRender.eventMeta?.priority ?? dragRender.taskMeta?.priority ?? 'none'
  const status: EventStatus = dragRender.eventMeta?.status ?? 'pending'

  return {
    title: dragRender.title ?? 'New Event',
    start,
    end,
    top: dateToPixelOffset(start, HOUR_HEIGHT_PX),
    height: durationToPixelHeight(start, end, HOUR_HEIGHT_PX),
    status,
    priority,
    personalActivityType: dragRender.personalActivityType ?? dragRender.personalMeta?.activityType,
  }
}
