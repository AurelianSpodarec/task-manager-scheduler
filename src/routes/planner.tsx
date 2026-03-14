import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/planner')({
  component: PlannerPage,
})

function PlannerPage() {
  return (
    <div className="flex flex-row">
      <aside>
        Planner
      </aside>
      <div>
        Calendar
      </div>
    </div>
  )
}
