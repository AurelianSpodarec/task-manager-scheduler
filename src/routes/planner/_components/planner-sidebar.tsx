import { useUnscheduledTasks } from '@/services/task-service'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { SidebarTaskCard } from './sidebar-task-card'
import { PersonalTaskCard } from './personal-task-card'

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
