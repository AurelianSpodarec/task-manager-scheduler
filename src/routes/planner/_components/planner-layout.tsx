import { useEffect, useRef } from 'react'
import {
  registerSidebarDropzone,
  useCalendarInstanceId,
  useDragRender,
  useSettingsPanelOpen,
  useSidebarPosition,
} from '@/features/calendar'
import { CalendarSettingsPanel } from '@/components/calendar-settings/calendar-settings-panel'
import { syncElapsedScheduledTaskStatuses } from '@/services/task-service'
import { PlannerSidebar } from './planner-sidebar'
import { PlannerContent } from './planner-content'

export function PlannerLayout() {
  const dragRender = useDragRender()
  const sidebarHighlight = dragRender?.sidebarDropHovered
  const sidebarRef = useRef<HTMLElement>(null)
  const instanceId = useCalendarInstanceId()
  const settingsOpen = useSettingsPanelOpen()
  const sidebarPosition = useSidebarPosition()
  const sidebarRight = sidebarPosition === 'right'

  useEffect(() => {
    const element = sidebarRef.current
    if (!element) return
    return registerSidebarDropzone(instanceId, element)
  }, [instanceId])

  useEffect(() => {
    syncElapsedScheduledTaskStatuses()
    const interval = setInterval(() => {
      syncElapsedScheduledTaskStatuses()
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-card md:flex-row">
      <aside
        ref={sidebarRef}
        data-sidebar-dropzone
        className={`flex h-full min-h-0 w-full overflow-hidden p-[0.8rem] transition-colors md:w-[16.4rem] md:shrink-0 ${
          sidebarRight ? 'md:order-2' : 'md:order-1'
        } ${
          sidebarHighlight ? 'bg-zinc-100 ring-2 ring-inset ring-zinc-300 rounded-l-xl' : ''
        }`}
      >
        <PlannerSidebar />
      </aside>
      <section className={`h-full min-h-0 flex-1 overflow-hidden border-t border-zinc-200/80 md:border-t-0 ${
        sidebarRight ? 'md:order-1 md:border-r md:border-l-0' : 'md:order-2 md:border-l'
      }`}>
        <PlannerContent />
      </section>
      <div className={`shrink-0 overflow-hidden transition-[width] duration-200 ease-out md:order-3 ${
        settingsOpen ? 'w-full md:w-[17rem]' : 'w-0'
      }`}>
        {settingsOpen && (
          <div className="h-full w-full md:w-[17rem]">
            <CalendarSettingsPanel />
          </div>
        )}
      </div>
    </div>
  )
}
