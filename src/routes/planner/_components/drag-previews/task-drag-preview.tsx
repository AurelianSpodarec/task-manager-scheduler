import type { DragRenderState } from '@/features/calendar'
import type { WorkDragMeta } from '../types'
import { Briefcase, CalendarDays, Clock3, Repeat2 } from 'lucide-react'

export function TaskDragPreview({ drag, meta }: { drag: DragRenderState; meta: WorkDragMeta }) {
  const width = Math.max(drag.elementSize.width, 120)
  return (
    <div
      className="relative overflow-hidden rounded-[10px] border border-zinc-200 bg-white px-3 py-3 shadow-[0_14px_28px_rgba(0,0,0,0.18)]"
      style={{ width }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left: 0, top: 0, bottom: 0, width: 3, backgroundColor: meta.priorityBorderColor }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[14px] leading-5 font-semibold text-zinc-900">
            {drag.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] leading-4 text-zinc-500">
            <span className="font-medium text-zinc-700">{meta.clientName}</span>
            {meta.dueDateLabel && (
              <>
                <span aria-hidden="true">&bull;</span>
                <CalendarDays aria-hidden="true" className="size-3 text-zinc-400" />
                <span className="font-medium text-zinc-500">{meta.dueDateLabel}</span>
              </>
            )}
          </div>
        </div>
        <div className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500">
          <Clock3 aria-hidden="true" className="size-3.5" />
          <span className="tabular-nums">{meta.durationLabel}</span>
        </div>
      </div>
      {meta.isRecurring && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
            {meta.recurringType === 'retainer' ? (
              <Briefcase aria-hidden="true" className="size-3" />
            ) : (
              <Repeat2 aria-hidden="true" className="size-3" />
            )}
            <span>{meta.recurringType === 'retainer' ? 'Retainer' : 'Recurring'}</span>
          </span>
        </div>
      )}
    </div>
  )
}
