import { useRef, useCallback, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CalendarShell } from '@/features/calendar/components/calendar-shell'
import { SLOT_INCREMENT_MINUTES } from '@/features/calendar/constants'
import { makeSidebarDragData, startPointerDrag } from '@/features/calendar/hooks/use-calendar-dnd'
import { useDragRender } from '@/features/calendar/calendar-store'
import { useUnscheduledTasks } from '@/services/task-service'
import type { Task } from '@/database/schema'
import {
  Briefcase,
  Repeat2,
} from 'lucide-react'

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
import {
  personalActivityStyles,
  personalActivityIcons,
  type PersonalActivityType,
} from '@/lib/personal-activity'

function roundUpDurationMinutes(minutes: number): number {
  const safeMinutes = Number.isFinite(minutes) ? Math.max(minutes, SLOT_INCREMENT_MINUTES) : 60
  return Math.ceil(safeMinutes / SLOT_INCREMENT_MINUTES) * SLOT_INCREMENT_MINUTES
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
    const data = makeSidebarDragData(task.id, task.title, roundedDurationMinutes, task.priority, {
      taskMeta: {
        clientName: task.clientName ?? '',
        dueDateLabel: task.dueDateLabel ?? null,
        isRecurring: !!task.isRecurring,
        recurringType: task.recurringType,
        durationLabel: roundedDurationLabel,
        priority: task.priority,
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
    const data = makeSidebarDragData(task.id, task.title, roundedDurationMinutes, task.priority, {
      color: task.color,
      personalActivityType: activityType,
      personalMeta: {
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

function PlannerContent() {
  return <CalendarShell />
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
