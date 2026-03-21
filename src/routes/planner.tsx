import { createFileRoute } from '@tanstack/react-router'
import { setDataSource } from '@/features/calendar'
import { SyncDbDataSource } from '@/services/sync-db-data-source'
import { PlannerPage } from './planner/_components'

// Wire the data source before any calendar component mounts
setDataSource(new SyncDbDataSource())

export const Route = createFileRoute('/planner')({
  component: PlannerPage,
})
