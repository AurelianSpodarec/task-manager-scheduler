import { addMinutes, setHours, setMinutes } from 'date-fns'
import { Check } from 'lucide-react'
import { HOUR_HEIGHT_PX, EVENT_STATUS_INDICATOR_COLORS } from '../../constants'
import { startOfDay, formatEventTime, dateToPixelOffset, durationToPixelHeight } from '../../utils/date'
import { priorityLeftBorderColor } from '@/lib/priority'
import {
  personalActivityStyles,
  personalActivityIcons,
  type PersonalActivityType,
} from '@/lib/personal-activity'
import type { DragRenderState, EventPriority, EventStatus } from '../../types'

export type ProjectedCard = {
  title: string
  start: Date
  end: Date
  top: number
  height: number
  status: EventStatus
  priority: EventPriority
  personalActivityType?: string
}

export function getProjectedCard(
  dragRender: DragRenderState | null,
  isoDay: string,
  slotDuration: number,
): ProjectedCard | null {
  if (!dragRender?.slot) return null
  if (dragRender.slot.isAllDay) return null
  if (dragRender.slot.isoDay !== isoDay) return null

  const day = new Date(dragRender.slot.isoDay)
  const slotStart = setMinutes(setHours(startOfDay(day), dragRender.slot.hour), dragRender.slot.minute)

  const durationMinutes = dragRender.durationMinutes ?? 60

  // Offset so the card stays anchored at the grab point, not the top
  let grabOffsetMin: number
  if (dragRender.source === 'calendar') {
    grabOffsetMin = Math.round(((dragRender.pointerOffset.y / HOUR_HEIGHT_PX) * 60) / slotDuration) * slotDuration
  } else {
    const fraction = dragRender.elementSize.height > 0
      ? dragRender.pointerOffset.y / dragRender.elementSize.height
      : 0
    grabOffsetMin = Math.round((fraction * durationMinutes) / slotDuration) * slotDuration
  }
  const start = addMinutes(slotStart, -grabOffsetMin)
  const end = addMinutes(start, durationMinutes)

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

export function ProjectedGhostCard({ projected }: { projected: ProjectedCard }) {
  const isCompact = projected.height < 40
  const priorityBorder = priorityLeftBorderColor[projected.priority]
  const verticalInsetPx = 2
  const renderedHeightPx = Math.max(projected.height - verticalInsetPx * 2, 16)

  const isPersonal = projected.personalActivityType != null
  const activityType = projected.personalActivityType as PersonalActivityType | undefined
  const ActivityIcon = activityType ? personalActivityIcons[activityType] : null
  const activityClasses = activityType ? personalActivityStyles[activityType] : ''

  return (
    <div
      className={`pointer-events-none absolute z-20 flex min-h-4 ${isCompact ? 'flex-row items-center' : 'flex-row items-start'} gap-1.5 overflow-hidden rounded-[7px] border px-2 py-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-zinc-200/50 ${
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
          style={{ left: 0, top: 0, bottom: 0, width: 3, backgroundColor: priorityBorder }}
        />
      )}
      {isPersonal && ActivityIcon ? (
        <ActivityIcon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
      ) : projected.status === 'completed' ? (
        <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: EVENT_STATUS_INDICATOR_COLORS.completedFill }}>
          <Check className="size-2 text-white" strokeWidth={3} />
        </span>
      ) : (
        <span className="size-3.5 shrink-0 rounded-full opacity-60" style={{ border: `1px solid ${EVENT_STATUS_INDICATOR_COLORS.pendingBorder}` }} />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={`block truncate font-semibold leading-tight ${isCompact ? 'text-[10px]' : 'text-[12px]'}`}>
          {projected.title}
        </span>
        {!isCompact && (
          <span className={`block text-[10px] leading-tight ${isPersonal ? 'opacity-70' : 'text-zinc-500'}`}>
            {formatEventTime(projected.start)} – {formatEventTime(projected.end)}
          </span>
        )}
      </div>
    </div>
  )
}
