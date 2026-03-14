import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays, Clock3, Repeat2 } from 'lucide-react'

export const Route = createFileRoute('/planner')({
  component: PlannerPage,
})

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

type SidebarTask = {
  id: string
  title: string
  duration: string
  clientName: string
  dueDateLabel: string
  isRecurring: boolean
  priority: TaskPriority
}

const recurringPriorityBorderClass: Record<TaskPriority, string> = {
  critical: 'border-l-zinc-900',
  high: 'border-l-zinc-700',
  medium: 'border-l-zinc-500',
  low: 'border-l-zinc-300',
}

const sidebarTasks: SidebarTask[] = [
  {
    id: 'task-graphic-design-edits',
    title: 'Graphic Design Edits',
    duration: '2:10h',
    clientName: 'Client name',
    dueDateLabel: 'Aug 27',
    isRecurring: true,
    priority: 'high',
  },
  {
    id: 'task-invoice-review',
    title: 'Invoice Review',
    duration: '1:00h',
    clientName: 'Finance',
    dueDateLabel: 'Aug 29',
    isRecurring: false,
    priority: 'medium',
  },
]

function SidebarTaskCard({ task }: { task: SidebarTask }) {
  return (
    <article
      className={cn(
        'rounded-lg border border-zinc-200 bg-card px-3 py-2 shadow-sm',
        task.isRecurring && [
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
          {task.isRecurring && <Repeat2 aria-hidden="true" className="size-3.5" />}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <span className="font-semibold text-card-foreground">{task.clientName}</span>
        <span aria-hidden="true">-</span>
        <CalendarDays aria-hidden="true" className="size-3.5" />
        <span>{task.dueDateLabel}</span>
      </div>
    </article>
  )
}

export function PlannerSidebar() {
  return (
    <Tabs defaultValue="tasks" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="personal">Personal</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks" className="space-y-2">
        {sidebarTasks.map((task) => (
          <SidebarTaskCard key={task.id} task={task} />
        ))}
      </TabsContent>
      <TabsContent value="personal">
        <Card>
          <CardHeader>
            <CardTitle>Personal</CardTitle>
            <CardDescription>
              Keep personal reminders, notes, and routines in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You have 2 personal reminders this week.
          </CardContent>
        </Card>
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
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-stretch gap-4 p-4 md:flex-row md:gap-6 md:p-6">
      <aside className="h-full min-h-0 w-full rounded-lg border bg-card p-4 md:w-72 md:shrink-0">
        <PlannerSidebar />
      </aside>
      <section className="h-full min-h-0 flex-1 rounded-lg border bg-card p-4 md:p-6">
        <PlannerContent />
      </section>
    </div>
  )
}
