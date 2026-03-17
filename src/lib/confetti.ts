import { tsParticles } from '@tsparticles/engine'
import { loadConfettiPreset } from '@tsparticles/preset-confetti'
import { loadEmojiShape } from '@tsparticles/shape-emoji'

type ConfettiContainer = Awaited<ReturnType<typeof tsParticles.load>> & {
  addEmitter: (options: Record<string, unknown>) => Promise<void>
}

let container: ConfettiContainer | null = null
let initPromise: Promise<void> | null = null
const CONFETTI_PARTICLE_LIFE_SECONDS = 0.9
const CONFETTI_OPACITY_FADE_SPEED = 2.2
const CONFETTI_BURST_COUNT = 12
const CONFETTI_EMITTER_LIFE_SECONDS = 0.08

async function init() {
  await loadEmojiShape(tsParticles, false)
  await loadConfettiPreset(tsParticles)

  const c = await tsParticles.load({
    id: 'task-confetti',
    options: {
      particles: {
        shape: {
          type: 'emoji',
          options: {
            emoji: { value: ['🌙'] },
          },
        },
        life: {
          duration: { sync: true, value: CONFETTI_PARTICLE_LIFE_SECONDS },
          count: 1,
        },
        opacity: {
          value: { min: 0, max: 1 },
          animation: { enable: true, speed: CONFETTI_OPACITY_FADE_SPEED, startValue: 'max', destroy: 'min' },
        },
      },
      preset: 'confetti',
      emitters: [],
    },
  })

  container = (c as ConfettiContainer) ?? null
}

/** Fire a small confetti burst at viewport (x, y). */
export function fireConfetti(x: number, y: number): void {
  if (typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  if (!initPromise) initPromise = init()

  initPromise.then(() => {
    if (!container) return

    container.addEmitter({
      position: {
        x: (x / window.innerWidth) * 100,
        y: (y / window.innerHeight) * 100,
      },
      size: { width: 0, height: 0 },
      startCount: CONFETTI_BURST_COUNT,
      rate: { delay: 0, quantity: 0 },
      life: { duration: CONFETTI_EMITTER_LIFE_SECONDS, count: 1 },
    })
  })
}
