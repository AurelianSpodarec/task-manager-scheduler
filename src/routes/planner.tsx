import { useRef, useCallback, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarShell,
  getSlotDuration,
  makeSidebarDragData,
  startPointerDrag,
  useDragRender,
  setDataSource,
  type DragRenderState,
} from '@/features/calendar'
import { SyncDbDataSource } from '@/services/sync-db-data-source'
import {
  useUnscheduledTasks,
  scheduleTask,
  moveScheduledTask,
  spawnScheduledTask,
  unscheduleTask,
  deleteScheduledTask,
} from '@/services/task-service'
import { getTask } from '@/database/db'
import type { Task } from '@/database/schema'
import {
  Briefcase,
  CalendarDays,
  Clock3,
  Repeat2,
} from 'lucide-react'

// Wire the data source before any calendar component mounts
setDataSource(new SyncDbDataSource())

export const Route = createFileRoute('/planner')({
  component: PlannerPage,
})

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { priorityLeftBorderColor } from "@/lib/priority"
import { PendingStatusIcon } from '@/lib/task-status-icons'
import {
  personalActivityStyles,
  personalActivityIcons,
  type PersonalActivityType,
} from '@/lib/personal-activity'

function roundUpDurationMinutes(minutes: number): number {
  const slot = getSlotDuration()
  const safeMinutes = Number.isFinite(minutes) ? Math.max(minutes, slot) : 60
  return Math.ceil(safeMinutes / slot) * slot
}

function formatDurationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}:${String(remainingMinutes).padStart(2, '0')}h`
}

function SidebarTaskCard({ task }: { task: Task }) {
  const roundedDurationMinutes = roundUpDurationMinutes(task.durationMinutes)
  const roundedDurationLabel = formatDurationLabel(roundedDurationMinutes)
  const priorityBorderColor = priorityLeftBorderColor[task.priority]
  const hasStatusBadges = !!task.isRecurring
  const metaToggleId = `compact-meta-${task.id}`
  const ref = useRef<HTMLElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    const el = ref.current
    if (!el) return
    const data = makeSidebarDragData(task.id, task.title, roundedDurationMinutes, {
      className: 'border-zinc-200 bg-white hover:border-zinc-300 before:absolute before:left-0 before:inset-y-0 before:w-[3px] before:bg-[var(--evt-border)]',
      style: { '--evt-border': priorityLeftBorderColor[task.priority] } as React.CSSProperties,
      icon: PendingStatusIcon,
      dragMeta: {
        kind: 'task' as const,
        clientName: task.clientName ?? '',
        dueDateLabel: task.dueDateLabel ?? null,
        isRecurring: !!task.isRecurring,
        recurringType: task.recurringType,
        durationLabel: roundedDurationLabel,
        priorityBorderColor: priorityLeftBorderColor[task.priority],
      },
    })
    startPointerDrag(el, e.nativeEvent, data, {
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    })
  }, [task.id, task.title, task.priority, task.clientName, task.dueDateLabel, task.isRecurring, task.recurringType, roundedDurationMinutes, roundedDurationLabel])

  return (
    <article
      ref={ref}
      onPointerDown={onPointerDown}
      className={`relative w-full cursor-grab overflow-hidden rounded-[10px] border border-zinc-200 bg-card px-3 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:border-zinc-300 ${isDragging ? 'opacity-40' : ''}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left: 0, top: 0, bottom: 0, width: 3, backgroundColor: priorityBorderColor }}
      />
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 min-w-0 text-[14px] leading-5 font-semibold text-zinc-900">
          {task.title}
        </h3>
        <span className="mt-0.5 shrink-0 text-[11px] tabular-nums font-medium text-zinc-500">
          {roundedDurationLabel}
        </span>
      </div>
      <div className="mt-0.5 flex items-center justify-between text-[12px] leading-4 text-zinc-500">
        <span className="font-medium text-zinc-700">{task.clientName ?? ''}</span>
        {task.dueDateLabel && (
          <span className="font-medium text-zinc-500">Due on {task.dueDateLabel}</span>
        )}
      </div>
      {hasStatusBadges && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <input id={metaToggleId} type="checkbox" className="task-meta-toggle sr-only" />
          {task.isRecurring && (
            <label
              htmlFor={metaToggleId}
              className={cn(
                'task-meta-badge inline-flex cursor-pointer items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-100'
              )}
              title="Toggle compact metadata labels"
            >
              {task.recurringType === 'retainer' ? (
                <Briefcase aria-hidden="true" className="size-3" />
              ) : (
                <Repeat2 aria-hidden="true" className="size-3" />
              )}
              <span className="task-meta-label">
                {task.recurringType === 'retainer' ? 'Retainer' : 'Recurring'}
              </span>
            </label>
          )}
        </div>
      )}
    </article>
  )
}

function PersonalTaskCard({ task }: { task: Task }) {
  const activityType = task.personalActivityType as PersonalActivityType
  const roundedDurationMinutes = roundUpDurationMinutes(task.durationMinutes)
  const roundedDurationLabel = formatDurationLabel(roundedDurationMinutes)
  const ActivityIcon = personalActivityIcons[activityType]
  const ref = useRef<HTMLElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    const el = ref.current
    if (!el) return
    const data = makeSidebarDragData(task.id, task.title, roundedDurationMinutes, {
      color: task.color,
      className: personalActivityStyles[activityType],
      icon: personalActivityIcons[activityType],
      dragMeta: {
        kind: 'personal' as const,
        activityType,
        durationLabel: roundedDurationLabel,
      },
    })
    startPointerDrag(el, e.nativeEvent, data, {
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    })
  }, [task.id, task.title, task.priority, task.color, activityType, roundedDurationMinutes, roundedDurationLabel])

  return (
    <article
      ref={ref}
      onPointerDown={onPointerDown}
      className={cn(
        'flex w-full min-h-11 cursor-grab items-center gap-2 rounded-[10px] border px-3 py-2.5 transition-colors',
        personalActivityStyles[activityType],
        isDragging && 'opacity-40'
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-4 shrink-0 items-center justify-center"
      >
        <ActivityIcon className="size-3.5" strokeWidth={2} />
      </span>
      <span className="flex-1 text-[12px] leading-none font-semibold tracking-[0.03em] uppercase">
        {task.title}
      </span>
      <span className="shrink-0 text-[11px] tabular-nums font-medium opacity-70">
        {roundedDurationLabel}
      </span>
    </article>
  )
}
export function PlannerSidebar() {
  const workTasks = useUnscheduledTasks('work')
  const personalTasks = useUnscheduledTasks('personal')

  return (
    <Tabs defaultValue="tasks" className="h-full min-h-0 w-full gap-3">
      <TabsList className="h-auto w-full shrink-0 rounded-md border border-zinc-200 bg-zinc-50 p-0.5">
        <TabsTrigger
          value="tasks"
          className="h-7 rounded-[5px] px-2.5 py-0 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 data-active:bg-white data-active:text-zinc-900 data-active:shadow-none"
        >
          Tasks
        </TabsTrigger>
        <TabsTrigger
          value="personal"
          className="h-7 rounded-[5px] px-2.5 py-0 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 data-active:bg-white data-active:text-zinc-900 data-active:shadow-none"
        >
          Personal
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tasks" className="sidebar-scrollbar min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {workTasks.map((task) => (
          <SidebarTaskCard key={task.id} task={task} />
        ))}
      </TabsContent>
      <TabsContent value="personal" className="sidebar-scrollbar min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {personalTasks.map((task) => (
          <PersonalTaskCard key={task.id} task={task} />
        ))}
      </TabsContent>
    </Tabs>
  )
}

// ---------------------------------------------------------------------------
// Consumer-owned drag previews (moved out of calendar package)
// ---------------------------------------------------------------------------
type WorkDragMeta = {
  kind: 'task'
  clientName: string
  dueDateLabel: string | null
  isRecurring: boolean
  recurringType?: 'standard' | 'retainer'
  durationLabel: string
  priorityBorderColor: string
}

type PersonalDragMeta = {
  kind: 'personal'
  activityType: PersonalActivityType
  durationLabel: string
}

type AppDragMeta = WorkDragMeta | PersonalDragMeta

function TaskDragPreview({ drag, meta }: { drag: DragRenderState; meta: WorkDragMeta }) {
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

function PersonalDragPreview({ drag, meta }: { drag: DragRenderState; meta: PersonalDragMeta }) {
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

function renderDragPreview(drag: DragRenderState): React.ReactNode {
  const meta = drag.dragMeta as AppDragMeta | undefined
  if (meta?.kind === 'task') return <TaskDragPreview drag={drag} meta={meta} />
  if (meta?.kind === 'personal') return <PersonalDragPreview drag={drag} meta={meta} />
  // Calendar-originating event drags — fall through to the calendar's default preview
  return null
}

function PlannerContent() {
  return (
    <CalendarShell config={{
      renderDragPreview,
      eventHandlers: {
        onEventDrop: (id, start, end, allDay) => {
          const task = getTask(id)
          if (!task) return
          task.type === 'personal'
            ? spawnScheduledTask(id, start, end, allDay)
            : scheduleTask(id, start, end, allDay)
        },
        onEventMove: moveScheduledTask,
        onEventRemove: (id) => {
          const task = getTask(id)
          task?.personalActivityType
            ? deleteScheduledTask(id)
            : unscheduleTask(id)
        },
      },
    }} />
  )
}

function PlannerPage() {
  const dragRender = useDragRender()
  const sidebarHighlight = dragRender?.sidebarDropHovered

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-card md:flex-row">
      <aside
        data-sidebar-dropzone
        className={`flex h-full min-h-0 w-full overflow-hidden p-4 md:w-[20.5rem] md:shrink-0 transition-colors ${
          sidebarHighlight ? 'bg-zinc-100 ring-2 ring-inset ring-zinc-300 rounded-l-xl' : ''
        }`}
      >
        <PlannerSidebar />
      </aside>
      <section className="h-full min-h-0 flex-1 overflow-hidden border-t border-zinc-200/80 md:border-t-0 md:border-l">
        <PlannerContent />
      </section>
    </div>
  )
}
