import { createFileRoute } from '@tanstack/react-router'
import { CalendarRoot, setDataSource } from '@/features/calendar'
import { SyncDbDataSource } from '@/services/sync-db-data-source'
import { PlannerLayout } from './planner/_components/planner-layout'

// Wire the data source before any calendar component mounts
setDataSource(new SyncDbDataSource())

export const Route = createFileRoute('/planner')({
  component: PlannerPage,
})

function PlannerPage() {
  return (
    <CalendarRoot>
      <PlannerLayout />
    </CalendarRoot>
  )
}
