import type { DragRenderState } from '@/features/calendar'
import type { MeetingDragMeta } from '../../shared/drag-meta'
import { MeetingCardContent } from './content'
import { dragPreviewCardShellClass } from '../../shared/card-shell'
import { getDragPreviewWidth } from '../../shared/preview'

export function MeetingDragPreview({ drag, meta }: { drag: DragRenderState; meta: MeetingDragMeta }) {
  return (
    <div
      className={dragPreviewCardShellClass('light')}
      style={{ width: getDragPreviewWidth(drag) }}
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
