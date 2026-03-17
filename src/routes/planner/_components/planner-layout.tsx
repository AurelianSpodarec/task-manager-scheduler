import { useEffect, useRef } from 'react'
import { registerSidebarDropzone, useCalendarInstanceId, useDragRender } from '@/features/calendar'
import { PlannerSidebar } from './planner-sidebar'
import { PlannerContent } from './planner-content'

export function PlannerLayout() {
  const dragRender = useDragRender()
  const sidebarHighlight = dragRender?.sidebarDropHovered
  const sidebarRef = useRef<HTMLElement>(null)
  const instanceId = useCalendarInstanceId()

  useEffect(() => {
    const element = sidebarRef.current
    if (!element) return
    return registerSidebarDropzone(instanceId, element)
  }, [instanceId])

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-card md:flex-row">
      <aside
        ref={sidebarRef}
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
