import { fireConfetti } from '@/lib/confetti'

const PLANNER_COMPLETION_CONFETTI = {
  style: 'party',
  physics: 'floaty',
  shot: 'pop',
  burstCount: 22,
  scalar: 0.45,
  distanceScale: 0.52,
} as const

export function firePlannerCompletionConfetti(target: HTMLElement): void {
  const rect = target.getBoundingClientRect()
  fireConfetti(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    PLANNER_COMPLETION_CONFETTI,
  )
}
