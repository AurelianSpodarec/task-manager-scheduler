import type { DragRenderState } from '@/features/calendar'
import type { PersonalDragMeta } from '../../shared/drag-meta'
import { personalActivityStyles } from '@/lib/personal-activity'
import { PersonalCardContent } from './content'
import { getDragPreviewWidth } from '../../shared/preview'

export function PersonalDragPreview({ drag, meta }: { drag: DragRenderState; meta: PersonalDragMeta }) {
  const style = personalActivityStyles[meta.activityType] ?? ''
  return (
    <div
      className={`flex w-full min-h-[2.2rem] items-center gap-[0.4rem] rounded-[8px] border px-[0.6rem] py-[0.5rem] shadow-[0_14px_28px_rgba(0,0,0,0.18)] ${style}`}
      style={{ width: getDragPreviewWidth(drag) }}
    >
      <PersonalCardContent
        title={drag.title ?? ''}
        durationLabel={meta.durationLabel}
        activityType={meta.activityType}
      />
    </div>
  )
}
