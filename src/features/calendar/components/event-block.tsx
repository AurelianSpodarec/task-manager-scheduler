import { useCallback, useEffect, useState } from 'react'
import type { EventLayoutRect } from '../types'
import { makeEventDragData } from '../dnd'
import { useFormatTime } from '../hooks/use-format-time'
import { getConfig } from '../config'
import { useCalendarDragSource } from '../hooks/use-dnd-behaviors'
import { useDragState } from '../calendar-store'

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
  const isCompleted = Boolean(event.isCompleted)
  const [justCompleted, setJustCompleted] = useState(false)

  // Release GPU compositing layers created by the checkmark fill-mode animations
  useEffect(() => {
    if (!justCompleted) return
    const id = setTimeout(() => setJustCompleted(false), 350)
    return () => clearTimeout(id)
  }, [justCompleted])

  const { formatEventTime } = useFormatTime()
  const Icon = event.icon
  const dragState = useDragState()
  const { ref, isDragging, onPointerDown } = useCalendarDragSource<HTMLButtonElement>({
    createDragData: ({ element, event: pointerEvent }) => ({
      ...makeEventDragData(event),
      grabOffsetY: Math.max(0, pointerEvent.clientY - element.getBoundingClientRect().top),
    }),
  })
  const isSourceDragging = dragState?.source === 'calendar' && dragState.eventId === event.id
  const isCardDragging = isDragging || isSourceDragging

  const onStatusPointerDown = useCallback((e: React.PointerEvent<HTMLSpanElement>) => {
    e.stopPropagation()
  }, [])

  const onStatusClick = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    setJustCompleted(!isCompleted)
    getConfig().eventHandlers.onIconClick?.(event.id, e)
  }, [event.id, isCompleted])

  const widthPercent = 100 / totalColumns
  const leftPercent = column * widthPercent
  const horizontalInsetPx = 2
  const verticalInsetPx = 2
  const renderedHeightPx = Math.max(height - verticalInsetPx * 2, 16)

  return (
    <button
      ref={ref}
      onPointerDown={onPointerDown}
      className={`group/event absolute z-10 flex cursor-grab active:cursor-grabbing flex-row ${isCompact ? 'items-center' : 'items-start'} gap-1.5 overflow-hidden rounded-[7px] border px-2 py-[3px] text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[opacity,color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cal-focus-ring)] ${event.className ?? 'border-zinc-200 bg-white hover:border-zinc-300'} ${isCompleted ? 'opacity-60' : 'opacity-100'} ${isCardDragging ? 'pointer-events-none' : ''}`}
      style={{
        top: `${top + verticalInsetPx}px`,
        height: `${renderedHeightPx}px`,
        width: `calc(${widthPercent}% - ${horizontalInsetPx * 2}px)`,
        left: `calc(${leftPercent}% + ${horizontalInsetPx}px)`,
        ...event.style,
        opacity: isCardDragging ? 0.2 : undefined,
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
          <Icon aria-hidden="true" className="size-3.5 shrink-0" animate={justCompleted && isCompleted} />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          data-completed={isCompleted}
          className={`completion-title relative block min-w-0 font-semibold leading-tight ${isCompact ? 'text-[10px]' : 'text-[12px]'} ${isCompleted ? 'text-zinc-500' : 'text-zinc-900'}`}
        >
          <span className="completion-title-strike-wrap truncate">
            <span className="relative z-10">{event.title}</span>
            <span aria-hidden="true" className="completion-title-strike" />
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
