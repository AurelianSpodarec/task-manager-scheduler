import { useRef, useCallback, useState } from 'react'
import { Check } from 'lucide-react'
import type { EventLayoutRect } from '../types'
import { EVENT_STATUS_INDICATOR_COLORS } from '../constants'
import { formatEventTime } from '../utils/date'
import { makeEventDragData, startPointerDrag } from '../hooks/use-calendar-dnd'
import { priorityLeftBorderColor } from '@/lib/priority'
import {
  personalActivityStyles,
  personalActivityIcons,
  type PersonalActivityType,
} from '@/lib/personal-activity'

type EventBlockProps = {
  layout: EventLayoutRect
}


export function EventBlock({ layout }: EventBlockProps) {
  const { event, column, totalColumns, top, height } = layout
  const isCompact = height < 40
  const ref = useRef<HTMLButtonElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const isPersonal = event.personalActivityType != null
  const activityType = event.personalActivityType as PersonalActivityType | undefined

  const priorityBorderColor = priorityLeftBorderColor[event.priority]

  // Personal activity styling
  const ActivityIcon = activityType ? personalActivityIcons[activityType] : null
  const activityClasses = activityType ? personalActivityStyles[activityType] : ''

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    const el = ref.current
    if (!el) return
    const data = {
      ...makeEventDragData(event),
      grabOffsetY: Math.max(0, e.clientY - el.getBoundingClientRect().top),
    }
    startPointerDrag(el, e.nativeEvent, data, {
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    })
  }, [event.id, event.start.getTime(), event.end.getTime()])

  const widthPercent = 100 / totalColumns
  const leftPercent = column * widthPercent
  const horizontalInsetPx = 2
  const verticalInsetPx = 2
  const renderedHeightPx = Math.max(height - verticalInsetPx * 2, 16)

  return (
    <button
      ref={ref}
      onPointerDown={onPointerDown}
    className={`group/event absolute z-10 flex cursor-grab active:cursor-grabbing flex-row ${isCompact ? 'items-center' : 'items-start'} gap-1.5 overflow-hidden rounded-[7px] border px-2 py-1.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow duration-100 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cal-focus-ring)] ${
        isPersonal
          ? activityClasses
          : 'border-zinc-200 bg-white hover:border-zinc-300'
      } ${isDragging ? 'pointer-events-none opacity-10' : ''}`}
      style={{
        top: `${top + verticalInsetPx}px`,
        height: `${renderedHeightPx}px`,
        width: `calc(${widthPercent}% - ${horizontalInsetPx * 2}px)`,
        left: `calc(${leftPercent}% + ${horizontalInsetPx}px)`,
      }}
      aria-label={`${event.title}, ${formatEventTime(event.start)} to ${formatEventTime(event.end)}`}
    >
      {!isPersonal && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ left: 0, top: 0, bottom: 0, width: 3, backgroundColor: priorityBorderColor }}
        />
      )}
      {isPersonal && ActivityIcon ? (
        <ActivityIcon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
      ) : (
        <StatusIcon status={event.status} />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={`block truncate font-semibold leading-tight ${isCompact ? 'text-[10px]' : 'text-[12px]'}`}
        >
          {event.title}
        </span>
        {!isCompact && (
          <span className={`block text-[10px] leading-tight ${isPersonal ? 'opacity-70' : 'text-zinc-500'}`}>
            {formatEventTime(event.start)} – {formatEventTime(event.end)}
          </span>
        )}
      </div>
    </button>
  )
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <span
      className="flex size-3.5 shrink-0 items-center justify-center rounded-[5px]"
        style={{ backgroundColor: EVENT_STATUS_INDICATOR_COLORS.completedFill }}
      >
        <Check className="size-2 text-white" strokeWidth={3} />
      </span>
    )
  }
  return (
    <span
      className="size-3.5 shrink-0 rounded-[5px] opacity-60"
      style={{ border: `1px solid ${EVENT_STATUS_INDICATOR_COLORS.pendingBorder}` }}
    />
  )
}
