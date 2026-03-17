import type { DragRenderState } from '@/features/calendar'
import type { MeetingDragMeta } from '../types'
import { MeetingCardContent } from '../meeting-card-content'

const MIN_PREVIEW_WIDTH = 224

export function MeetingDragPreview({ drag, meta }: { drag: DragRenderState; meta: MeetingDragMeta }) {
  return (
    <div
      className="relative overflow-hidden rounded-[9px] border border-zinc-700/60 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-[0.62rem] py-[0.62rem] shadow-[0_14px_28px_rgba(0,0,0,0.3)]"
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
