import { useRef, useCallback, useState } from 'react'
import { makeSidebarDragData, startPointerDrag } from '@/features/calendar'
import { toggleTaskStatus } from '@/services/task-service'
import type { Task } from '@/database/schema'
import { cn } from '@/lib/utils'
import { priorityLeftBorderColor } from '@/lib/priority'
import { PendingStatusIcon, CompletedStatusIcon } from '@/lib/task-status-icons'
import { fireConfetti } from '@/lib/confetti'
import { Briefcase, Repeat2 } from 'lucide-react'
import { roundUpDurationMinutes, formatDurationLabel } from './utils'

export function SidebarTaskCard({ task }: { task: Task }) {
  const roundedDurationMinutes = roundUpDurationMinutes(task.durationMinutes)
  const roundedDurationLabel = formatDurationLabel(roundedDurationMinutes)
  const priorityBorderColor = priorityLeftBorderColor[task.priority]
  const hasStatusBadges = !!task.isRecurring
  const metaToggleId = `compact-meta-${task.id}`
  const ref = useRef<HTMLElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    const el = ref.current
    if (!el) return
    const data = makeSidebarDragData(task.id, task.title, roundedDurationMinutes, {
      className: 'border-zinc-200 bg-white hover:border-zinc-300 before:absolute before:left-0 before:inset-y-0 before:w-[3px] before:bg-[var(--evt-border)]',
      style: { '--evt-border': priorityLeftBorderColor[task.priority] } as React.CSSProperties,
      icon: PendingStatusIcon,
      dragMeta: {
        kind: 'task' as const,
        clientName: task.clientName ?? '',
        dueDateLabel: task.dueDateLabel ?? null,
        isRecurring: !!task.isRecurring,
        recurringType: task.recurringType,
        durationLabel: roundedDurationLabel,
        priorityBorderColor: priorityLeftBorderColor[task.priority],
      },
    })
    startPointerDrag(el, e.nativeEvent, data, {
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    })
  }, [task.id, task.title, task.priority, task.clientName, task.dueDateLabel, task.isRecurring, task.recurringType, roundedDurationMinutes, roundedDurationLabel])

  return (
    <article
      ref={ref}
      onPointerDown={onPointerDown}
      className={`relative w-full cursor-grab overflow-hidden rounded-[10px] border border-zinc-200 bg-card px-3 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:border-zinc-300 ${isDragging ? 'opacity-40' : ''}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left: 0, top: 0, bottom: 0, width: 3, backgroundColor: priorityBorderColor }}
      />
      <div className="flex items-start gap-2">
        <span
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            const next = toggleTaskStatus(task.id)
            if (next === 'completed') fireConfetti(e.clientX, e.clientY)
          }}
          className="relative z-10 mt-0.5 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[4px]"
          aria-label={`Toggle ${task.title} completion`}
          title="Toggle task completion"
        >
          {task.status === 'completed'
            ? <CompletedStatusIcon className="size-3.5" />
            : <PendingStatusIcon className="size-3.5" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 min-w-0 text-[14px] leading-5 font-semibold text-zinc-900">
              {task.title}
            </h3>
            <span className="mt-0.5 shrink-0 text-[11px] tabular-nums font-medium text-zinc-500">
              {roundedDurationLabel}
            </span>
          </div>
          <div className="mt-0.5 flex items-center justify-between text-[12px] leading-4 text-zinc-500">
            <span className="font-medium text-zinc-700">{task.clientName ?? ''}</span>
            {task.dueDateLabel && (
              <span className="font-medium text-zinc-500">Due on {task.dueDateLabel}</span>
            )}
          </div>
          {hasStatusBadges && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <input id={metaToggleId} type="checkbox" className="task-meta-toggle sr-only" />
              {task.isRecurring && (
                <label
                  htmlFor={metaToggleId}
                  className={cn(
                    'task-meta-badge inline-flex cursor-pointer items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-100'
                  )}
                  title="Toggle compact metadata labels"
                >
                  {task.recurringType === 'retainer' ? (
                    <Briefcase aria-hidden="true" className="size-3" />
                  ) : (
                    <Repeat2 aria-hidden="true" className="size-3" />
                  )}
                  <span className="task-meta-label">
                    {task.recurringType === 'retainer' ? 'Retainer' : 'Recurring'}
                  </span>
                </label>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
