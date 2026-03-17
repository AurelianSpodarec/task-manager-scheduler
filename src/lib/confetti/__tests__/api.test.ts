import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  __resetConfettiTestOverrides,
  __setConfettiTestOverrides,
  fireConfetti,
  fireConfettiRain,
} from '../api'
import type { ConfettiParticle } from '../types'

function createEngineSpy() {
  return {
    spawn: vi.fn<(particles: ConfettiParticle[]) => void>(),
  }
}

afterEach(() => {
  vi.useRealTimers()
  __resetConfettiTestOverrides()
})

describe('confetti api', () => {
  it('does not spawn particles when reduced motion is enabled', () => {
    const engine = createEngineSpy()

    __setConfettiTestOverrides({
      isBrowser: () => true,
      prefersReducedMotion: () => true,
      engine,
    })

    fireConfetti(320, 300, { style: 'colorful', shot: 'fanBurst' })
    fireConfettiRain({ style: 'colorful' })
    expect(engine.spawn).not.toHaveBeenCalled()
  })

  it('does not spawn particles outside browser contexts', () => {
    const engine = createEngineSpy()

    __setConfettiTestOverrides({
      isBrowser: () => false,
      prefersReducedMotion: () => false,
      engine,
    })

    fireConfetti(100, 100, 'party')
    fireConfettiRain()
    expect(engine.spawn).not.toHaveBeenCalled()
  })

  it('spawns particles for burst and rain when enabled', () => {
    vi.useFakeTimers()
    const engine = createEngineSpy()

    __setConfettiTestOverrides({
      isBrowser: () => true,
      prefersReducedMotion: () => false,
      engine,
    })

    fireConfetti(480, 420, { shot: 'pop', burstCount: 12, style: 'colorful' })
    fireConfettiRain({ count: 24, durationMs: 220, style: 'colorful' })
    vi.runAllTimers()

    expect(engine.spawn).toHaveBeenCalled()
    const firstSpawnArgs = engine.spawn.mock.calls[0][0]
    expect(firstSpawnArgs.length).toBeGreaterThan(0)
  })
})
