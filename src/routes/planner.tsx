import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/planner')({
  component: PlannerPage,
})

function PlannerPage() {
  return (
    <div>
      <h1>Planner</h1>
    </div>
  )
}
