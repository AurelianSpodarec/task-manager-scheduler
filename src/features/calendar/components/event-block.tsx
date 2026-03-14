import { useRef, useEffect, useState } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { MoreHorizontal, Check } from 'lucide-react'
import type { EventLayoutRect } from '../types'
import { EVENT_COLOR_MAP } from '../constants'
import { formatEventTime } from '../utils/date'
import { makeEventDragData } from '../hooks/use-calendar-dnd'

type EventBlockProps = {
  layout: EventLayoutRect
}

export function EventBlock({ layout }: EventBlockProps) {
  const { event, column, totalColumns, top, height } = layout
  const colors = EVENT_COLOR_MAP[event.color]
  const isCompact = height < 40
  const ref = useRef<HTMLButtonElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return draggable({
      element: el,
      getInitialData: () => makeEventDragData(event),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    })
  }, [event.id, event.start.getTime(), event.end.getTime()])

  const widthPercent = 100 / totalColumns
  const leftPercent = column * widthPercent
  const insetPx = totalColumns > 1 ? 2 : 0

  return (
    <button
      ref={ref}
      className={`group/event absolute z-10 flex cursor-grab flex-col overflow-hidden rounded-[var(--cal-radius-event)] border-l-[3px] px-[var(--cal-event-padding-x)] py-[var(--cal-event-padding-y)] text-left shadow-[var(--cal-shadow-event)] transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cal-focus-ring)] ${isDragging ? 'opacity-40' : ''}`}
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 20)}px`,
        width: `calc(${widthPercent}% - ${insetPx * 2}px)`,
        left: `calc(${leftPercent}% + ${insetPx}px)`,
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
      aria-label={`${event.title}, ${formatEventTime(event.start)} to ${formatEventTime(event.end)}`}
    >
      <div className="flex min-w-0 items-start justify-between gap-1">
        <span
          className={`min-w-0 truncate font-semibold leading-tight ${isCompact ? 'text-[var(--cal-text-2xs)]' : 'text-[var(--cal-text-xs)]'}`}
        >
          {event.title}
        </span>
        {!isCompact && (
          <StatusIcon status={event.status} />
        )}
      </div>

      {!isCompact && (
        <span className="mt-auto text-[var(--cal-text-2xs)] leading-tight opacity-90">
          {formatEventTime(event.start)} - {formatEventTime(event.end)}
        </span>
      )}

      {/* Avatars + overflow menu — only for taller blocks */}
      {height >= 60 && (
        <div className="mt-auto flex items-center justify-between pt-0.5">
          {event.participants && event.participants.length > 0 ? (
            <div className="flex -space-x-1.5">
              {event.participants.slice(0, 3).map((p) => (
                <img
                  key={p.id}
                  src={p.avatarUrl}
                  alt={p.name}
                  className="size-5 rounded-full border border-white/30 object-cover"
                />
              ))}
              {event.participants.length > 3 && (
                <span className="flex size-5 items-center justify-center rounded-full border border-white/30 bg-white/20 text-[9px] font-semibold">
                  +{event.participants.length - 3}
                </span>
              )}
            </div>
          ) : (
            <span />
          )}
          <span className="rounded p-0.5 opacity-0 transition-opacity group-hover/event:opacity-100">
            <MoreHorizontal className="size-3.5" />
          </span>
        </div>
      )}

      {/* Description sub-item (e.g. "Stranger Things S5") */}
      {event.description && height >= 80 && (
        <span className="mt-0.5 truncate text-[var(--cal-text-2xs)] leading-tight opacity-75">
          • {event.description}
        </span>
      )}
    </button>
  )
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white/25">
        <Check className="size-2.5" strokeWidth={3} />
      </span>
    )
  }
  return (
    <span className="size-3.5 shrink-0 rounded-full border-2 border-white/40" />
  )
}
