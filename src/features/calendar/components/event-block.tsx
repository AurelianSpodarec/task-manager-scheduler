import { useCallback } from 'react'
import type { EventLayoutRect } from '../types'
import { makeEventDragData } from '../dnd'
import { useFormatTime } from '../hooks/use-format-time'
import { useCurrentTime } from '../hooks/use-current-time'
import { getConfig } from '../config'
import { useCalendarDragSource } from '../hooks/use-dnd-behaviors'

type EventBlockProps = {
  layout: EventLayoutRect
}

/**
 * Pure layout shell — positions the event in the grid and handles drag initiation.
 * All visual treatment (borders, icons, colors) comes from the consumer via
 * event.className / event.style / event.icon.
 */
export function EventBlock({ layout }: EventBlockProps) {
  const { event, column, totalColumns, top, height } = layout
  const isCompact = height < 40
  const now = useCurrentTime()
  const isCompleted = Boolean(event.isCompleted && event.end.getTime() <= now.getTime())

  const { formatEventTime } = useFormatTime()
  const Icon = event.icon
  const { ref, isDragging, onPointerDown } = useCalendarDragSource<HTMLButtonElement>({
    createDragData: ({ element, event: pointerEvent }) => ({
      ...makeEventDragData(event),
      grabOffsetY: Math.max(0, pointerEvent.clientY - element.getBoundingClientRect().top),
    }),
  })

  const onStatusPointerDown = useCallback((e: React.PointerEvent<HTMLSpanElement>) => {
    e.stopPropagation()
  }, [])

  const onStatusClick = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    getConfig().eventHandlers.onIconClick?.(event.id, e)
  }, [event.id])

  const widthPercent = 100 / totalColumns
  const leftPercent = column * widthPercent
  const horizontalInsetPx = 2
  const verticalInsetPx = 2
  const renderedHeightPx = Math.max(height - verticalInsetPx * 2, 16)

  return (
    <button
      ref={ref}
      onPointerDown={onPointerDown}
      className={`group/event absolute z-10 flex cursor-grab active:cursor-grabbing flex-row ${isCompact ? 'items-center' : 'items-start'} gap-1.5 overflow-hidden rounded-[7px] border px-2 py-1.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[opacity,color,border-color,box-shadow] duration-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cal-focus-ring)] ${event.className ?? 'border-zinc-200 bg-white hover:border-zinc-300'} ${isCompleted ? 'opacity-60' : 'opacity-100'} ${isDragging ? 'pointer-events-none opacity-10' : ''}`}
      style={{
        top: `${top + verticalInsetPx}px`,
        height: `${renderedHeightPx}px`,
        width: `calc(${widthPercent}% - ${horizontalInsetPx * 2}px)`,
        left: `calc(${leftPercent}% + ${horizontalInsetPx}px)`,
        ...event.style,
      }}
      aria-label={`${event.title}, ${formatEventTime(event.start)} to ${formatEventTime(event.end)}`}
    >
      {Icon && (
        <span
          onPointerDown={onStatusPointerDown}
          onClick={onStatusClick}
          className="relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[4px]"
          aria-label={`${event.title} action`}
        >
          <Icon aria-hidden="true" className="size-3.5 shrink-0" />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={`relative block min-w-0 font-semibold leading-tight transition-colors duration-200 ${isCompact ? 'text-[10px]' : 'text-[12px]'} ${isCompleted ? 'text-zinc-500' : 'text-zinc-900'}`}>
          <span className="relative inline-block max-w-full truncate align-top">
            <span className="relative z-10">{event.title}</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute top-[46%] left-0 -right-[2px] z-0 h-px origin-left rounded-full bg-current rotate-[0.6deg] transition-opacity duration-150 ${isCompleted ? 'opacity-60 delay-[50ms]' : 'opacity-0 delay-0'}`}
            />
          </span>
        </span>
        {!isCompact && (
          <span className={`block text-[10px] leading-tight transition-colors duration-200 ${isCompleted ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {formatEventTime(event.start)} – {formatEventTime(event.end)}
          </span>
        )}
      </div>
    </button>
  )
}
