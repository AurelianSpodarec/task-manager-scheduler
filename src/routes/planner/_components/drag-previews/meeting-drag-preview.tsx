import type { DragRenderState } from '@/features/calendar'
import type { MeetingDragMeta } from '../types'
import { MeetingCardContent } from '../meeting-card-content'
import { dragPreviewCardShellClass } from '../card-shell'

const MIN_PREVIEW_WIDTH = 224

export function MeetingDragPreview({ drag, meta }: { drag: DragRenderState; meta: MeetingDragMeta }) {
  return (
    <div
      className={dragPreviewCardShellClass('light')}
      style={{ width: Math.max(drag.elementSize.width, MIN_PREVIEW_WIDTH) }}
    >
      <MeetingCardContent
        title={drag.title ?? ''}
        timeLabel={meta.timeLabel || meta.durationLabel}
        provider={meta.provider}
        participants={meta.participants}
        showJoinAction={false}
      />
    </div>
  )
}
