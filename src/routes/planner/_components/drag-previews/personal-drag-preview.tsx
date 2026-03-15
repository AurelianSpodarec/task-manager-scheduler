import type { DragRenderState } from '@/features/calendar'
import type { PersonalDragMeta } from '../types'
import { personalActivityStyles, personalActivityIcons } from '@/lib/personal-activity'
import { Clock3 } from 'lucide-react'

export function PersonalDragPreview({ drag, meta }: { drag: DragRenderState; meta: PersonalDragMeta }) {
  const width = Math.max(drag.elementSize.width, 120)
  const ActivityIcon = personalActivityIcons[meta.activityType]
  const style = personalActivityStyles[meta.activityType] ?? ''

  return (
    <div
      className={`flex min-h-11 items-center gap-2 rounded-[10px] border px-3 py-2.5 shadow-[0_14px_28px_rgba(0,0,0,0.18)] ${style}`}
      style={{ width }}
    >
      <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center">
        <ActivityIcon className="size-3.5" strokeWidth={2} />
      </span>
      <span className="flex-1 text-[12px] leading-none font-semibold tracking-[0.03em] uppercase">
        {drag.title}
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white/50 px-1.5 py-0.5 text-[11px] font-medium opacity-70">
        <Clock3 aria-hidden="true" className="size-3" />
        <span className="tabular-nums">{meta.durationLabel}</span>
      </span>
    </div>
  )
}
