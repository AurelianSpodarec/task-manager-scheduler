import { useRef, useEffect, useState } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { disableNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview'
import { Check } from 'lucide-react'
import type { EventLayoutRect } from '../types'
import { EVENT_STATUS_INDICATOR_COLORS } from '../constants'
import { formatEventTime } from '../utils/date'
import { makeEventDragData } from '../hooks/use-calendar-dnd'
import { priorityBadgeClass, priorityBadgeIcon, priorityLeftBorderColor } from '@/lib/priority'

type EventBlockProps = {
  layout: EventLayoutRect
}


export function EventBlock({ layout }: EventBlockProps) {
  const { event, column, totalColumns, top, height } = layout
  const isCompact = height < 40
  const ref = useRef<HTMLButtonElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const pClass = priorityBadgeClass[event.priority]
  const PIcon = priorityBadgeIcon[event.priority]
  const priorityBorderColor = priorityLeftBorderColor[event.priority]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return draggable({
      element: el,
      getInitialData: ({ input, element }) => ({
        ...makeEventDragData(event),
        grabOffsetY: Math.max(0, input.clientY - element.getBoundingClientRect().top),
      }),
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
      className={`group/event absolute z-10 flex cursor-grab active:cursor-grabbing flex-col overflow-hidden rounded-[7px] border border-zinc-200 border-l-[3px] bg-white px-2 py-1.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow duration-100 hover:border-zinc-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cal-focus-ring)] ${isDragging ? 'pointer-events-none opacity-10' : ''}`}
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 20)}px`,
        width: `calc(${widthPercent}% - ${insetPx * 2}px)`,
        left: `calc(${leftPercent}% + ${insetPx}px)`,
        borderLeftColor: priorityBorderColor,
      }}
      aria-label={`${event.title}, ${formatEventTime(event.start)} to ${formatEventTime(event.end)}`}
    >
      {/* Row 1: checkbox + title */}
      <div className="flex min-w-0 items-center gap-1.5">
        <StatusIcon status={event.status} />
        <span
          className={`min-w-0 flex-1 truncate font-semibold leading-tight text-zinc-900 ${isCompact ? 'text-[10px]' : 'text-[12px]'}`}
        >
          {event.title}
        </span>
        {!isCompact && pClass && PIcon && (
          <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none ${pClass}`}>
            <PIcon aria-hidden="true" className="size-2.5" />
          </span>
        )}
      </div>

      {/* Row 2: time range */}
      {!isCompact && (
        <span className="mt-0.5 text-[10px] leading-tight text-zinc-500">
          {formatEventTime(event.start)} – {formatEventTime(event.end)}
        </span>
      )}
    </button>
  )
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <span
        className="flex size-3.5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: EVENT_STATUS_INDICATOR_COLORS.completedFill }}
      >
        <Check className="size-2 text-white" strokeWidth={3} />
      </span>
    )
  }
  return (
    <span
      className="size-3.5 shrink-0 rounded-full border-2"
      style={{ borderColor: EVENT_STATUS_INDICATOR_COLORS.pendingBorder }}
    />
  )
}
