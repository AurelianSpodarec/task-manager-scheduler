import { useRef, useCallback, useState } from 'react'
import { makeSidebarDragData, startPointerDrag } from '@/features/calendar'
import { toggleTaskStatus } from '@/services/task-service'
import type { Task } from '@/database/schema'
import { priorityLeftBorderColor } from '@/lib/priority'
import { PendingStatusIcon, CompletedStatusIcon } from '@/lib/task-status-icons'
import { fireConfetti } from '@/lib/confetti'
import { TaskCardContent } from './task-card-content'
import { roundUpDurationMinutes, formatDurationLabel } from './utils'

export function SidebarTaskCard({ task }: { task: Task }) {
  const roundedDurationMinutes = roundUpDurationMinutes(task.durationMinutes)
  const roundedDurationLabel = formatDurationLabel(roundedDurationMinutes)
  const priorityBorderColor = priorityLeftBorderColor[task.priority]
  const ref = useRef<HTMLElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

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
      <TaskCardContent
        title={task.title}
        durationLabel={roundedDurationLabel}
        clientName={task.clientName ?? ''}
        dueDateLabel={task.dueDateLabel ?? null}
        priorityBorderColor={priorityBorderColor}
        isRecurring={!!task.isRecurring}
        recurringType={task.recurringType}
        metaToggleId={`compact-meta-${task.id}`}
        statusSlot={
          <span
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              const next = toggleTaskStatus(task.id)
              setJustCompleted(next === 'completed')
              if (next === 'completed') fireConfetti(e.clientX, e.clientY)
            }}
            className="relative z-10 mt-0.5 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[4px]"
            aria-label={`Toggle ${task.title} completion`}
            title="Toggle task completion"
          >
            {task.status === 'completed'
              ? <CompletedStatusIcon className="size-3.5" animate={justCompleted} />
              : <PendingStatusIcon className="size-3.5" />}
          </span>
        }
      />
    </article>
  )
}
