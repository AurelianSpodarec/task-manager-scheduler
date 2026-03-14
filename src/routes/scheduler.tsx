import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/scheduler')({
  component: SchedulerPage,
})

function SchedulerPage() {
  return (
    <div>
      <h1>Scheduler</h1>
    </div>
  )
}
