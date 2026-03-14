import { createFileRoute } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Briefcase,
  Backpack,
  CalendarDays,
  Car,
  Clock3,
  Dumbbell,
  Minus,
  Repeat2,
  Stethoscope,
  Utensils,
  type LucideIcon,
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

type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'critical'
type PersonalActivityType = 'schoolRun' | 'lunch' | 'dentist' | 'driving' | 'gym'

type SidebarTask = {
  id: string
  title: string
  duration: string
  clientName: string
  dueDateLabel?: string | null
  isRecurring: boolean
  recurringType?: 'standard' | 'retainer'
  priority: TaskPriority
}

type PersonalTask = {
  id: string
  activityType: PersonalActivityType
  label: string
}
const priorityBadgeClass: Record<TaskPriority, string | null> = {
  none: null,
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  high: 'border-orange-200 bg-orange-50 text-orange-700',
  critical: 'border-red-200 bg-red-50 text-red-700',
}

const priorityBadgeLabel: Record<TaskPriority, string | null> = {
  none: null,
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

const priorityBadgeIcon: Record<TaskPriority, LucideIcon | null> = {
  none: null,
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  critical: AlertTriangle,
}

const sidebarTasks: SidebarTask[] = [
  {
    id: 'task-brand-refresh-workshop',
    title: 'Brand Refresh Workshop',
    duration: '2:05h',
    clientName: 'Laser Red',
    dueDateLabel: 'Mar 18',
    isRecurring: true,
    recurringType: 'retainer',
    priority: 'medium',
  },
  {
    id: 'task-dashboard-qa-pass',
    title: 'Dashboard QA Pass',
    duration: '1:20h',
    clientName: 'MyEnergi Ltd',
    dueDateLabel: null,
    isRecurring: false,
    priority: 'none',
  },
  {
    id: 'task-weekly-insights-sync',
    title: 'Weekly Insights Sync',
    duration: '0:45h',
    clientName: 'FiveCast',
    dueDateLabel: 'Mar 15',
    isRecurring: true,
    recurringType: 'standard',
    priority: 'high',
  },
  {
    id: 'task-campaign-copy-review',
    title: 'Campaign Copy Review',
    duration: '1:35h',
    clientName: 'Bush Tyres',
    dueDateLabel: 'Mar 22',
    isRecurring: false,
    priority: 'none',
  },
  {
    id: 'task-donation-form-audit',
    title: 'Donation Form Audit',
    duration: '2:40h',
    clientName: 'St Barbans Hospice',
    dueDateLabel: null,
    isRecurring: false,
    priority: 'none',
  },
  {
    id: 'task-mobile-nav-hotfix',
    title: 'Mobile Nav Hotfix',
    duration: '0:55h',
    clientName: 'Smartev Limited',
    dueDateLabel: 'Mar 16',
    isRecurring: true,
    recurringType: 'standard',
    priority: 'critical',
  },
  {
    id: 'task-seo-content-batch',
    title: 'SEO Content Batch',
    duration: '3:10h',
    clientName: 'National Education Union',
    dueDateLabel: 'Mar 29',
    isRecurring: false,
    priority: 'none',
  },
  {
    id: 'task-api-contract-check',
    title: 'API Contract Check',
    duration: '1:50h',
    clientName: 'Synapsys Solutions',
    dueDateLabel: null,
    isRecurring: true,
    recurringType: 'standard',
    priority: 'high',
  },
]

const personalTaskStyles: Record<PersonalActivityType, string> = {
  schoolRun: 'border-orange-200 bg-orange-50 text-orange-950',
  lunch: 'border-rose-200 bg-rose-50 text-rose-950',
  dentist: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  driving: 'border-indigo-200 bg-indigo-50 text-indigo-950',
  gym: 'border-violet-200 bg-violet-50 text-violet-950',
}

const personalTaskIcons: Record<PersonalActivityType, LucideIcon> = {
  schoolRun: Backpack,
  lunch: Utensils,
  dentist: Stethoscope,
  driving: Car,
  gym: Dumbbell,
}

const personalTasks: PersonalTask[] = [
  { id: 'personal-school-run', activityType: 'schoolRun', label: 'School Run' },
  { id: 'personal-lunch', activityType: 'lunch', label: 'Lunch' },
  { id: 'personal-dentist', activityType: 'dentist', label: 'Dentist' },
  { id: 'personal-driving', activityType: 'driving', label: 'Driving' },
  { id: 'personal-gym', activityType: 'gym', label: 'Gym' },
]
function SidebarTaskCard({ task }: { task: SidebarTask }) {
  const priorityClass = priorityBadgeClass[task.priority]
  const priorityLabel = priorityBadgeLabel[task.priority]
  const PriorityIcon = priorityBadgeIcon[task.priority]
  const hasStatusBadges = task.isRecurring || Boolean(priorityClass)
  const metaToggleId = `compact-meta-${task.id}`
  return (
    <article className="rounded-[10px] border border-zinc-200 bg-card px-3 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:border-zinc-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[14px] leading-5 font-semibold text-zinc-900">
            {task.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] leading-4 text-zinc-500">
            <span className="font-medium text-zinc-700">{task.clientName}</span>
            {task.dueDateLabel && (
              <>
                <span aria-hidden="true">•</span>
                <CalendarDays aria-hidden="true" className="size-3 text-zinc-400" />
                <span className="font-medium text-zinc-500">{task.dueDateLabel}</span>
              </>
            )}
          </div>
        </div>
        <div className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500">
          <Clock3 aria-hidden="true" className="size-3.5" />
          <span className="tabular-nums">{task.duration}</span>
        </div>
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
          {priorityClass && priorityLabel && PriorityIcon && (
            <label
              htmlFor={metaToggleId}
              className={cn(
                'task-meta-badge inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors',
                priorityClass
              )}
              title="Toggle compact metadata labels"
            >
              <PriorityIcon aria-hidden="true" className="size-3" />
              <span className="task-meta-label">{priorityLabel}</span>
            </label>
          )}
        </div>
      )}
    </article>
  )
}

function PersonalTaskCard({ task }: { task: PersonalTask }) {
  const ActivityIcon = personalTaskIcons[task.activityType]
  return (
    <article
      className={cn(
        'flex min-h-11 items-center gap-2 rounded-[10px] border px-3 py-2.5',
        personalTaskStyles[task.activityType]
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-4 shrink-0 items-center justify-center"
      >
        <ActivityIcon className="size-3.5" strokeWidth={2} />
      </span>
      <span className="text-[12px] leading-none font-semibold tracking-[0.03em] uppercase">
        {task.label}
      </span>
    </article>
  )
}
export function PlannerSidebar() {
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
      <TabsContent value="tasks" className="sidebar-scrollbar min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
        {sidebarTasks.map((task) => (
          <SidebarTaskCard key={task.id} task={task} />
        ))}
      </TabsContent>
      <TabsContent value="personal" className="sidebar-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {personalTasks.map((task) => (
          <PersonalTaskCard key={task.id} task={task} />
        ))}
      </TabsContent>
    </Tabs>
  )
}

function PlannerContent() {
  return (
    <>
      <h2 className="text-lg font-semibold text-card-foreground">Calendar</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Calendar view placeholder.
      </p>
    </>
  )
}

function PlannerPage() {

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-card md:flex-row">
      <aside className="flex h-full min-h-0 w-full overflow-hidden p-4 md:w-[20.5rem] md:shrink-0">
        <PlannerSidebar />
      </aside>
      <section className="h-full min-h-0 flex-1 overflow-auto border-t border-zinc-200/80 p-4 md:border-t-0 md:border-l md:p-6">
        <PlannerContent />
      </section>
    </div>
  )
}
