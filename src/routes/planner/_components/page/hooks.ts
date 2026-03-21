import { useEffect, type RefObject } from 'react'
import { registerSidebarDropzone } from '@/features/calendar'
import { syncElapsedScheduledTaskStatuses } from '@/services/task-service'

export function usePlannerSidebarDropzone(
  instanceId: string,
  sidebarRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const element = sidebarRef.current
    if (!element) return
    return registerSidebarDropzone(instanceId, element)
  }, [instanceId, sidebarRef])
}

export function usePlannerElapsedStatusSync(): void {
  useEffect(() => {
    syncElapsedScheduledTaskStatuses()
    const interval = setInterval(() => {
      syncElapsedScheduledTaskStatuses()
    }, 60_000)
    return () => clearInterval(interval)
  }, [])
}
