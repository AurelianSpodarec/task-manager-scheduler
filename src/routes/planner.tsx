import { createFileRoute } from '@tanstack/react-router'
import { setDataSource, useDragRender } from '@/features/calendar'
import { SyncDbDataSource } from '@/services/sync-db-data-source'
import { PlannerSidebar } from './planner/_components/planner-sidebar'
import { PlannerContent } from './planner/_components/planner-content'

// Wire the data source before any calendar component mounts
setDataSource(new SyncDbDataSource())

export const Route = createFileRoute('/planner')({
  component: PlannerPage,
})

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
