import { useRef, useCallback, useState } from 'react'
import { makeSidebarDragData, startPointerDrag } from '@/features/calendar'
import type { Task } from '@/database/schema'
import { cn } from '@/lib/utils'
import {
  personalActivityStyles,
  personalActivityIcons,
  type PersonalActivityType,
} from '@/lib/personal-activity'
import { roundUpDurationMinutes, formatDurationLabel } from './utils'

export function PersonalTaskCard({ task }: { task: Task }) {
  const activityType = task.personalActivityType as PersonalActivityType
  const roundedDurationMinutes = roundUpDurationMinutes(task.durationMinutes)
  const roundedDurationLabel = formatDurationLabel(roundedDurationMinutes)
  const ActivityIcon = personalActivityIcons[activityType]
  const ref = useRef<HTMLElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    const el = ref.current
    if (!el) return
    const data = makeSidebarDragData(task.id, task.title, roundedDurationMinutes, {
      color: task.color,
      className: personalActivityStyles[activityType],
      icon: personalActivityIcons[activityType],
      dragMeta: {
        kind: 'personal' as const,
        activityType,
        durationLabel: roundedDurationLabel,
      },
    })
    startPointerDrag(el, e.nativeEvent, data, {
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    })
  }, [task.id, task.title, task.priority, task.color, activityType, roundedDurationMinutes, roundedDurationLabel])

  return (
    <article
      ref={ref}
      onPointerDown={onPointerDown}
      className={cn(
        'flex w-full min-h-11 cursor-grab items-center gap-2 rounded-[10px] border px-3 py-2.5 transition-colors',
        personalActivityStyles[activityType],
        isDragging && 'opacity-40'
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-4 shrink-0 items-center justify-center"
      >
        <ActivityIcon className="size-3.5" strokeWidth={2} />
      </span>
      <span className="flex-1 text-[12px] leading-none font-semibold tracking-[0.03em] uppercase">
        {task.title}
      </span>
      <span className="shrink-0 text-[11px] tabular-nums font-medium opacity-70">
        {roundedDurationLabel}
      </span>
    </article>
  )
}
