import { createFileRoute } from '@tanstack/react-router'
import { ColorfulConfettiBlock } from './scheduler/_components/colorful-confetti-block'

export const Route = createFileRoute('/scheduler')({
  component: SchedulerPage,
})

function SchedulerPage() {
  return (
    <div className="flex h-full min-h-0 w-full justify-center overflow-y-auto p-4 md:p-6">
      <section className="w-full max-w-4xl space-y-4">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold text-zinc-900">Scheduler</h1>
          <p className="text-sm text-zinc-600">
            Confetti generator playground.
          </p>
        </header>
        <ColorfulConfettiBlock />
      </section>
    </div>
  )
}
