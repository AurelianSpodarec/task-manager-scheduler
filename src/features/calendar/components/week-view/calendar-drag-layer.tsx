import {
  Briefcase,
  Backpack,
  CalendarDays,
  Car,
  Check,
  Clock3,
  Dumbbell,
  Repeat2,
  Stethoscope,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { useDragRender } from '../../calendar-store'
import { EVENT_COLOR_MAP } from '../../constants'
import { priorityBadgeClass, priorityBadgeLabel, priorityBadgeIcon } from '@/lib/priority'
import type { DragRenderState, TaskDragMeta, PersonalDragMeta, EventDragMeta } from '../../types'

const personalStyleMap: Record<string, string> = {
  schoolRun: 'border-orange-200 bg-orange-50 text-orange-950',
  lunch: 'border-rose-200 bg-rose-50 text-rose-950',
  dentist: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  driving: 'border-indigo-200 bg-indigo-50 text-indigo-950',
  gym: 'border-violet-200 bg-violet-50 text-violet-950',
}

const personalIconMap: Record<string, LucideIcon> = {
  schoolRun: Backpack,
  lunch: Utensils,
  dentist: Stethoscope,
  driving: Car,
  gym: Dumbbell,
}

export function CalendarDragLayer() {
  const dragRender = useDragRender()
  if (!dragRender || dragRender.slot) return null

  const left = dragRender.pointer.clientX - dragRender.pointerOffset.x
  const top = dragRender.pointer.clientY - dragRender.pointerOffset.y
  const width = Math.max(dragRender.elementSize.width, 120)
  const height = Math.max(dragRender.elementSize.height, 20)

  let content: React.ReactNode

  if (dragRender.taskMeta) {
    content = <TaskPreview drag={dragRender} meta={dragRender.taskMeta} width={width} height={height} />
  } else if (dragRender.personalMeta) {
    content = <PersonalPreview drag={dragRender} meta={dragRender.personalMeta} width={width} height={height} />
  } else if (dragRender.eventMeta) {
    content = <EventPreview drag={dragRender} meta={dragRender.eventMeta} width={width} height={height} />
  } else {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed z-[80] select-none"
      style={{ left, top, width, height }}
      aria-hidden="true"
    >
      {content}
    </div>
  )
}

/** Sidebar task card — 1:1 clone of SidebarTaskCard */
function TaskPreview({ drag, meta, width }: { drag: DragRenderState; meta: TaskDragMeta; width: number; height: number }) {
  const pClass = priorityBadgeClass[meta.priority]
  const pLabel = priorityBadgeLabel[meta.priority]
  const PIcon = priorityBadgeIcon[meta.priority]
  const hasStatusBadges = meta.isRecurring || Boolean(pClass)

  return (
    <div
      className="rounded-[10px] border border-zinc-200 bg-white px-3 py-3 shadow-[0_14px_28px_rgba(0,0,0,0.18)]"
      style={{ width }}
    >
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
      {hasStatusBadges && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {meta.isRecurring && (
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
              {meta.recurringType === 'retainer' ? (
                <Briefcase aria-hidden="true" className="size-3" />
              ) : (
                <Repeat2 aria-hidden="true" className="size-3" />
              )}
              <span>{meta.recurringType === 'retainer' ? 'Retainer' : 'Recurring'}</span>
            </span>
          )}
          {pClass && pLabel && PIcon && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${pClass}`}>
              <PIcon aria-hidden="true" className="size-3" />
              <span>{pLabel}</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/** Personal task pill — 1:1 clone of PersonalTaskCard */
function PersonalPreview({ drag, meta, width }: { drag: DragRenderState; meta: PersonalDragMeta; width: number; height: number }) {
  const ActivityIcon = personalIconMap[meta.activityType] ?? Utensils
  const style = personalStyleMap[meta.activityType] ?? ''

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

/** Calendar event card — 1:1 clone of resting EventBlock */
function EventPreview({ drag, meta, width, height }: { drag: DragRenderState; meta: EventDragMeta; width: number; height: number }) {
  const colors = EVENT_COLOR_MAP[drag.color]
  const pClass = priorityBadgeClass[meta.priority]
  const PIcon = priorityBadgeIcon[meta.priority]
  const start = drag.originalStart ? new Date(drag.originalStart) : null
  const end = drag.originalEnd ? new Date(drag.originalEnd) : null

  return (
    <div
      className="flex flex-col overflow-hidden rounded-[7px] border border-zinc-200 border-l-[3px] bg-white px-2 py-1.5 shadow-[0_14px_28px_rgba(0,0,0,0.18)]"
      style={{ width, height, borderLeftColor: colors.border }}
    >
      {/* Row 1: checkbox + title + priority icon */}
      <div className="flex min-w-0 items-center gap-1.5">
        {meta.status === 'completed' ? (
          <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: colors.border }}>
            <Check className="size-2 text-white" strokeWidth={3} />
          </span>
        ) : (
          <span className="size-3.5 shrink-0 rounded-full border-2" style={{ borderColor: colors.border }} />
        )}
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-tight text-zinc-900">
          {drag.title}
        </span>
        {pClass && PIcon && (
          <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none ${pClass}`}>
            <PIcon aria-hidden="true" className="size-2.5" />
          </span>
        )}
      </div>

      {/* Row 2: time range */}
      {start && end && (
        <span className="mt-auto text-[10px] leading-tight text-zinc-500">
          {formatTime(start)} – {formatTime(end)}
        </span>
      )}
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
