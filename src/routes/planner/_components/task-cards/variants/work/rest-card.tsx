import { useState } from 'react'
import { makeSidebarDragData, useCalendarDragSource } from '@/features/calendar'
import { toggleTaskStatus } from '@/services/task-service'
import type { Task } from '@/database/schema'
import { priorityLeftBorderColor } from '@/lib/priority'
import { PendingStatusIcon, CompletedStatusIcon } from '@/lib/task-status-icons'
import { TaskCardContent } from './content'
import { roundUpDurationMinutes, formatDurationLabel } from '../../shared/duration'
import { sidebarCardShellClass } from '../../shared/card-shell'
import { firePlannerCompletionConfetti } from '../../../shared/completion-confetti'

export function SidebarTaskCard({ task }: { task: Task }) {
  const roundedDurationMinutes = roundUpDurationMinutes(task.durationMinutes)
  const roundedDurationLabel = formatDurationLabel(roundedDurationMinutes)
  const priorityBorderColor = priorityLeftBorderColor[task.priority]
  const [justCompleted, setJustCompleted] = useState(false)
  const { ref, isDragging, onPointerDown } = useCalendarDragSource<HTMLElement>({
    createDragData: () => makeSidebarDragData(task.id, task.title, roundedDurationMinutes, {
      className: 'border-zinc-200 bg-white hover:border-zinc-300 before:absolute before:left-0 before:inset-y-0 before:w-[3px] before:bg-[var(--evt-border)]',
      style: { '--evt-border': priorityLeftBorderColor[task.priority] } as React.CSSProperties,
      icon: task.status === 'completed' ? CompletedStatusIcon : PendingStatusIcon,
      dragMeta: {
        kind: 'task' as const,
        clientName: task.clientName ?? '',
        dueDateLabel: task.dueDateLabel ?? null,
        isCompleted: task.status === 'completed',
        isRecurring: !!task.isRecurring,
        recurringType: task.recurringType,
        durationLabel: roundedDurationLabel,
        priorityBorderColor: priorityLeftBorderColor[task.priority],
      },
    }),
  })

  return (
    <article
      ref={ref}
      onPointerDown={onPointerDown}
      className={sidebarCardShellClass('light', isDragging)}
    >
      <TaskCardContent
        title={task.title}
        durationLabel={roundedDurationLabel}
        clientName={task.clientName ?? ''}
        dueDateLabel={task.dueDateLabel ?? null}
        isCompleted={task.status === 'completed'}
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
              if (next === 'completed') {
                firePlannerCompletionConfetti(e.currentTarget)
              }
            }}
            className="relative z-10 mt-[0.1rem] inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[4px]"
            aria-label={`Toggle ${task.title} completion`}
            title="Toggle task completion"
          >
            {task.status === 'completed'
              ? <CompletedStatusIcon className="size-[0.7rem]" animate={justCompleted} />
              : <PendingStatusIcon className="size-[0.7rem]" />}
          </span>
        }
      />
    </article>
  )
}
