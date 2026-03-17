import type { DragRenderState } from '@/features/calendar'
import { CompletedStatusIcon, PendingStatusIcon } from '@/lib/task-status-icons'
import type { WorkDragMeta } from '../types'
import { TaskCardContent } from '../task-card-content'

const MIN_PREVIEW_WIDTH = 280

export function TaskDragPreview({ drag, meta }: { drag: DragRenderState; meta: WorkDragMeta }) {
  return (
    <div
      className="relative overflow-hidden rounded-[10px] border border-zinc-200 bg-card px-3 py-3 shadow-[0_14px_28px_rgba(0,0,0,0.18)]"
      style={{ width: Math.max(drag.elementSize.width, MIN_PREVIEW_WIDTH) }}
    >
      <TaskCardContent
        title={drag.title ?? ''}
        durationLabel={meta.durationLabel}
        clientName={meta.clientName}
        dueDateLabel={meta.dueDateLabel}
        isCompleted={!!meta.isCompleted}
        priorityBorderColor={meta.priorityBorderColor}
        isRecurring={meta.isRecurring}
        recurringType={meta.recurringType}
        statusSlot={
          <span className="mt-0.5 inline-flex shrink-0 items-center justify-center rounded-[4px]">
            {meta.isCompleted
              ? <CompletedStatusIcon className="size-3.5" />
              : <PendingStatusIcon className="size-3.5" />}
          </span>
        }
      />
    </div>
  )
}
