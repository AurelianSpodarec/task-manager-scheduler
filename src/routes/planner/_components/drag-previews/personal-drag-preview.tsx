import type { DragRenderState } from '@/features/calendar'
import type { PersonalDragMeta } from '../types'
import { personalActivityLeftBorder } from '@/lib/personal-activity'
import { PersonalCardContent } from '../personal-card-content'
import { dragPreviewCardShellClass } from '../card-shell'

const MIN_PREVIEW_WIDTH = 224

export function PersonalDragPreview({ drag, meta }: { drag: DragRenderState; meta: PersonalDragMeta }) {
  return (
    <div
      className={`${dragPreviewCardShellClass('light')} flex w-full min-h-[2.2rem] items-center gap-[0.4rem]`}
      style={{ width: Math.max(drag.elementSize.width, MIN_PREVIEW_WIDTH) }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left: 0, top: 0, bottom: 0, width: 2.4, backgroundColor: personalActivityLeftBorder[meta.activityType] }}
      />
      <PersonalCardContent
        title={drag.title ?? ''}
        durationLabel={meta.durationLabel}
        activityType={meta.activityType}
      />
    </div>
  )
}
