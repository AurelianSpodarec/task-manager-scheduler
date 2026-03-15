import type { ComponentType, CSSProperties } from 'react'
import { addMinutes, setHours, setMinutes } from 'date-fns'
import { HOUR_HEIGHT_PX } from '../../constants'
import { startOfDay, dateToPixelOffset, durationToPixelHeight } from '../../utils/date'
import { useFormatTime } from '../../hooks/use-format-time'
import type { DragRenderState } from '../../types'

export type ProjectedCard = {
  title: string
  start: Date
  end: Date
  top: number
  height: number
  className?: string
  style?: CSSProperties
  icon?: ComponentType<{ className?: string }>
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

  return {
    title: dragRender.title ?? 'New Event',
    start,
    end,
    top: dateToPixelOffset(start, HOUR_HEIGHT_PX),
    height: durationToPixelHeight(start, end, HOUR_HEIGHT_PX),
    className: dragRender.className,
    style: dragRender.style,
    icon: dragRender.icon,
  }
}

export function ProjectedGhostCard({ projected }: { projected: ProjectedCard }) {
  const { formatEventTime } = useFormatTime()
  const isCompact = projected.height < 40
  const verticalInsetPx = 2
  const renderedHeightPx = Math.max(projected.height - verticalInsetPx * 2, 16)
  const Icon = projected.icon

  return (
    <div
      className={`pointer-events-none absolute z-20 flex min-h-4 ${isCompact ? 'flex-row items-center' : 'flex-row items-start'} gap-1.5 overflow-hidden rounded-[7px] border px-2 py-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-zinc-200/50 ${projected.className ?? 'border-zinc-200 bg-white'}`}
      style={{
        top: `${projected.top + verticalInsetPx}px`,
        height: `${renderedHeightPx}px`,
        left: '2px',
        right: '2px',
        ...projected.style,
      }}
      aria-hidden="true"
    >
      {Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0" />}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={`block truncate font-semibold leading-tight ${isCompact ? 'text-[10px]' : 'text-[12px]'}`}>
          {projected.title}
        </span>
        {!isCompact && (
          <span className="block text-[10px] leading-tight text-zinc-500">
            {formatEventTime(projected.start)} – {formatEventTime(projected.end)}
          </span>
        )}
      </div>
    </div>
  )
}
