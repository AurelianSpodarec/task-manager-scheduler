import { useCurrentTime } from '@/features/calendar'
import { useSidebarTasksTabTasks, useUnscheduledTasks } from '@/services/task-service'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { SidebarTaskCard } from '../task-cards/variants/work/rest-card'
import { PersonalTaskCard } from '../task-cards/variants/personal/rest-card'
import { MeetingTaskCard } from '../task-cards/variants/meeting/rest-card'
const TAB_TRIGGER_CLASS_NAME = 'h-[1.4rem] rounded-[4px] px-[0.5rem] py-0 text-[10.4px] font-medium text-zinc-600 hover:text-zinc-900 data-active:bg-white data-active:text-zinc-900 data-active:shadow-none'

export function PlannerSidebar() {
  const sidebarTasks = useSidebarTasksTabTasks()
  const personalTasks = useUnscheduledTasks('personal')
  const now = useCurrentTime()

  return (
    <Tabs defaultValue="tasks" className="h-full min-h-0 w-full gap-[0.6rem]">
      <TabsList className="h-auto w-full shrink-0 rounded-md border border-zinc-200 bg-zinc-50 p-[0.1rem]">
        <TabsTrigger
          value="tasks"
          className={TAB_TRIGGER_CLASS_NAME}
        >
          Tasks
        </TabsTrigger>
        <TabsTrigger
          value="personal"
          className={TAB_TRIGGER_CLASS_NAME}
        >
          Personal
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tasks" className="sidebar-scrollbar min-h-0 flex-1 space-y-[0.3rem] overflow-y-auto pr-[0.2rem]">
        {sidebarTasks.map((task) => (
          task.type === 'meeting'
            ? <MeetingTaskCard key={task.id} task={task} now={now} />
            : <SidebarTaskCard key={task.id} task={task} />
        ))}
      </TabsContent>
      <TabsContent value="personal" className="sidebar-scrollbar min-h-0 flex-1 space-y-[0.3rem] overflow-y-auto pr-[0.2rem]">
        {personalTasks.map((task) => (
          <PersonalTaskCard key={task.id} task={task} />
        ))}
      </TabsContent>
    </Tabs>
  )
}
