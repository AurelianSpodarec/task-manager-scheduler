import { useRef, useEffect, useState } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { disableNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview'
import { Check, Clock3 } from 'lucide-react'
import type { EventLayoutRect } from '../types'
import { EVENT_COLOR_MAP } from '../constants'
import { formatEventTime } from '../utils/date'
import { makeEventDragData } from '../hooks/use-calendar-dnd'
import { priorityBadgeClass, priorityBadgeLabel, priorityBadgeIcon } from '@/lib/priority'

type EventBlockProps = {
  layout: EventLayoutRect
}

/** Compute a human-readable duration string from start/end dates. */
function formatDuration(start: Date, end: Date): string {
  const mins = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (!h) return `${m}m`
  if (!m) return `${h}h`
  return `${h}:${String(m).padStart(2, '0')}h`
}

export function EventBlock({ layout }: EventBlockProps) {
  const { event, column, totalColumns, top, height } = layout
  const colors = EVENT_COLOR_MAP[event.color]
  const isCompact = height < 40
  const ref = useRef<HTMLButtonElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const pClass = priorityBadgeClass[event.priority]
  const pLabel = priorityBadgeLabel[event.priority]
  const PIcon = priorityBadgeIcon[event.priority]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return draggable({
      element: el,
      getInitialData: () => makeEventDragData(event),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        disableNativeDragPreview({ nativeSetDragImage })
      },
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
      className={`group/event absolute z-10 flex cursor-grab flex-col overflow-hidden rounded-[7px] border border-zinc-200 border-l-[3px] bg-white px-2 py-1.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow duration-100 hover:border-zinc-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cal-focus-ring)] ${isDragging ? 'opacity-10' : ''}`}
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 20)}px`,
        width: `calc(${widthPercent}% - ${insetPx * 2}px)`,
        left: `calc(${leftPercent}% + ${insetPx}px)`,
        borderLeftColor: colors.border,
      }}
      aria-label={`${event.title}, ${formatEventTime(event.start)} to ${formatEventTime(event.end)}`}
    >
      {/* Row 1: checkbox + title + duration */}
      <div className="flex min-w-0 items-center gap-1.5">
        <StatusIcon status={event.status} color={colors.border} />
        <span
          className={`min-w-0 flex-1 truncate font-semibold leading-tight text-zinc-900 ${isCompact ? 'text-[10px]' : 'text-[12px]'}`}
        >
          {event.title}
        </span>
        {!isCompact && (
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-zinc-50 px-1 py-0.5 text-[10px] font-medium text-zinc-500">
            <Clock3 aria-hidden="true" className="size-2.5" />
            <span className="tabular-nums">{formatDuration(event.start, event.end)}</span>
          </span>
        )}
      </div>

      {/* Row 2: priority pill (only when enough height) */}
      {!isCompact && pClass && pLabel && PIcon && (
        <div className="mt-auto flex items-center pt-0.5">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none ${pClass}`}
          >
            <PIcon aria-hidden="true" className="size-2.5" />
            {height >= 52 && <span>{pLabel}</span>}
          </span>
        </div>
      )}
    </button>
  )
}

function StatusIcon({ status, color }: { status: string; color: string }) {
  if (status === 'completed') {
    return (
      <span
        className="flex size-3.5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: color }}
      >
        <Check className="size-2 text-white" strokeWidth={3} />
      </span>
    )
  }
  return (
    <span
      className="size-3.5 shrink-0 rounded-full border-2"
      style={{ borderColor: color }}
    />
  )
}
