import { createFileRoute } from '@tanstack/react-router'

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

function TaskCard() {
  return (
    <div>
      Title
      Duration Time
      isRecurring (small recycle icon)
      Priority (this will be left border, can also try trello style of icon)
      Due Date(if exists)
    </div>
  )
}

export function PlannerSidebar() {
  return (
    <Tabs defaultValue="tasks" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="personal">Personal</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks">
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              Track your work items and monitor progress across ongoing tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You have 3 priority tasks due today.
          </CardContent>
        </Card>
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
