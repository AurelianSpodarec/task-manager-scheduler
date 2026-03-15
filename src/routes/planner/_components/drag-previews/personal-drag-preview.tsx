import type { DragRenderState } from '@/features/calendar'
import type { PersonalDragMeta } from '../types'
import { personalActivityStyles } from '@/lib/personal-activity'
import { PersonalCardContent } from '../personal-card-content'

const MIN_PREVIEW_WIDTH = 280

export function PersonalDragPreview({ drag, meta }: { drag: DragRenderState; meta: PersonalDragMeta }) {
  const style = personalActivityStyles[meta.activityType] ?? ''
  return (
    <div
      className={`flex w-full min-h-11 items-center gap-2 rounded-[10px] border px-3 py-2.5 shadow-[0_14px_28px_rgba(0,0,0,0.18)] ${style}`}
      style={{ width: Math.max(drag.elementSize.width, MIN_PREVIEW_WIDTH) }}
    >
      <PersonalCardContent
        title={drag.title ?? ''}
        durationLabel={meta.durationLabel}
        activityType={meta.activityType}
      />
    </div>
  )
}
