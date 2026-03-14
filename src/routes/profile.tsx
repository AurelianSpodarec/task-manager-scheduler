import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return <Navigate to="/planner" replace />
}
