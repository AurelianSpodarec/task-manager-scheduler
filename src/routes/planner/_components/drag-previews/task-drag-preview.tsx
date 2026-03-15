import type { DragRenderState } from '@/features/calendar'
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
        priorityBorderColor={meta.priorityBorderColor}
        isRecurring={meta.isRecurring}
        recurringType={meta.recurringType}
      />
    </div>
  )
}
