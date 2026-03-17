import type { ReactNode } from 'react'
import { PendingStatusIcon } from '@/lib/task-status-icons'
import { Briefcase, Repeat2 } from 'lucide-react'

type TaskCardContentProps = {
  title: string
  durationLabel: string
  clientName: string
  dueDateLabel: string | null
  isCompleted?: boolean
  priorityBorderColor: string
  isRecurring: boolean
  recurringType?: 'standard' | 'retainer'
  /** Interactive checkbox — falls back to a static PendingStatusIcon when omitted. */
  statusSlot?: ReactNode
  /** Enables the collapsible badge toggle (sidebar-only). */
  metaToggleId?: string
}

/**
 * Shared presentational content for work-task cards.
 * Used by both SidebarTaskCard (interactive) and TaskDragPreview (static).
 */
export function TaskCardContent({
  title, durationLabel, clientName, dueDateLabel,
  isCompleted = false,
  priorityBorderColor, isRecurring, recurringType,
  statusSlot, metaToggleId,
}: TaskCardContentProps) {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left: 0, top: 0, bottom: 0, width: 2.4, backgroundColor: priorityBorderColor }}
      />
      <div className="flex items-start gap-[0.4rem]">
        {statusSlot ?? (
          <span className="mt-[0.1rem] inline-flex shrink-0 items-center justify-center rounded-[4px]">
            <PendingStatusIcon className="size-[0.7rem]" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-[0.6rem]">
            <h3
              data-completed={isCompleted}
              className={`completion-title line-clamp-2 min-w-0 text-[11.2px] leading-[1rem] font-semibold ${isCompleted ? 'text-zinc-700' : 'text-zinc-900'}`}
            >
              <span className="completion-title-strike-wrap">
                <span className="relative z-10">{title}</span>
                <span aria-hidden="true" className="completion-title-strike" />
              </span>
            </h3>
            <span className="mt-[0.1rem] shrink-0 text-[8.8px] tabular-nums font-medium text-zinc-500">
              {durationLabel}
            </span>
          </div>
          <div className="mt-[0.1rem] flex items-center justify-between text-[9.6px] leading-[0.8rem] text-zinc-500">
            <span className="font-medium text-zinc-700">{clientName}</span>
            {dueDateLabel && (
              <span className="font-medium text-zinc-500">Due on {dueDateLabel}</span>
            )}
          </div>
          {isRecurring && (
            <RecurringBadge
              recurringType={recurringType}
              metaToggleId={metaToggleId}
            />
          )}
        </div>
      </div>
    </>
  )
}

function RecurringBadge({ recurringType, metaToggleId }: { recurringType?: 'standard' | 'retainer'; metaToggleId?: string }) {
  const icon = recurringType === 'retainer'
    ? <Briefcase aria-hidden="true" className="size-[0.6rem]" />
    : <Repeat2 aria-hidden="true" className="size-[0.6rem]" />
  const label = recurringType === 'retainer' ? 'Retainer' : 'Recurring'

  return (
    <div className="mt-[0.4rem] flex flex-wrap items-center gap-[0.3rem]">
      {metaToggleId && (
        <input id={metaToggleId} type="checkbox" className="task-meta-toggle sr-only" />
      )}
      {metaToggleId ? (
        <label
          htmlFor={metaToggleId}
          className="task-meta-badge inline-flex cursor-pointer items-center gap-[0.2rem] rounded-full border border-zinc-200 bg-zinc-50 px-[0.4rem] py-[0.1rem] text-[8.8px] font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
          title="Toggle compact metadata labels"
        >
          {icon}
          <span className="task-meta-label">{label}</span>
        </label>
      ) : (
        <span className="inline-flex items-center gap-[0.2rem] rounded-full border border-zinc-200 bg-zinc-50 px-[0.4rem] py-[0.1rem] text-[8.8px] font-medium text-zinc-600">
          {icon}
          <span>{label}</span>
        </span>
      )}
    </div>
  )
}
