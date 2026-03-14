import { createFileRoute } from '@tanstack/react-router'
import {
  Briefcase,
  Backpack,
  CalendarDays,
  Car,
  Clock3,
  Dumbbell,
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
const recurringPriorityBorderClass: Record<TaskPriority, string> = {
  none: 'border-l-zinc-500',
  low: 'border-l-blue-500',
  medium: 'border-l-yellow-400',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
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
  schoolRun: 'border-[#fed7aa] bg-[#ffedd6] text-black',
  lunch: 'border-[#fecdd3] bg-[#ffe4e6] text-black',
  dentist: 'border-[#bbf7d0] bg-[#dcfce7] text-black',
  driving: 'border-[#c7d2fe] bg-[#e0e7ff] text-black',
  gym: 'border-[#e9d5ff] bg-[#f3e8ff] text-black',
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
  return (
    <article
      className={cn(
        'rounded-[4px] border border-zinc-200 bg-card px-3 py-2 shadow-sm',
        (task.isRecurring || task.priority === 'none') && [
          'border-l-4',
          recurringPriorityBorderClass[task.priority],
        ]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate text-sm font-medium text-card-foreground">
          {task.title}
        </h3>
        <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Clock3 aria-hidden="true" className="size-3.5" />
          <span>{task.duration}</span>
          {task.isRecurring &&
            (task.recurringType === 'retainer' ? (
              <Briefcase aria-hidden="true" className="size-3.5" />
            ) : (
              <Repeat2 aria-hidden="true" className="size-3.5" />
            ))}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <span className="font-semibold text-card-foreground">{task.clientName}</span>
        {task.dueDateLabel && (
          <>
            <span aria-hidden="true">-</span>
            <CalendarDays aria-hidden="true" className="size-3.5" />
            <span>{task.dueDateLabel}</span>
          </>
        )}
      </div>
    </article>
  )
}

function PersonalTaskCard({ task }: { task: PersonalTask }) {
  const ActivityIcon = personalTaskIcons[task.activityType]
  return (
    <article
      className={cn(
        'flex min-h-10 items-center gap-2 rounded-[4px] border px-2.5 py-2',
        personalTaskStyles[task.activityType]
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-4 items-center justify-center"
      >
        <ActivityIcon className="size-3.5" strokeWidth={2} />
      </span>
      <span className="text-[12px] leading-none font-semibold tracking-[0.02em] uppercase">
        {task.label}
      </span>
    </article>
  )
}
export function PlannerSidebar() {
  return (
    <Tabs defaultValue="tasks" className="w-full">
      <TabsList className="w-full rounded-[4px] p-0">
        <TabsTrigger value="tasks" className="rounded-[3px] px-0 py-0">Tasks</TabsTrigger>
        <TabsTrigger value="personal" className="rounded-[3px] px-0 py-0">Personal</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks" className="space-y-2">
        {sidebarTasks.map((task) => (
          <SidebarTaskCard key={task.id} task={task} />
        ))}
      </TabsContent>
      <TabsContent value="personal" className="space-y-1.5">
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
      <p className="mt-2 text-sm text-muted-foreground">
        Calendar view placeholder.
      </p>
    </>
  )
}

function PlannerPage() {

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-stretch md:flex-row">
      <aside className="h-full min-h-0 w-full border border-zinc-200/70 bg-card p-4 md:w-72 md:shrink-0 md:border-r">
        <PlannerSidebar />
      </aside>
      <section className="h-full min-h-0 flex-1 border border-zinc-200/70 bg-card p-4 md:border-l-0 md:p-6">
        <PlannerContent />
      </section>
    </div>
  )
}
