import { getConfettiEngine } from './engine'
import {
  getPhysicsPreset,
  getShotPreset,
  getStylePreset,
  normalizeFireInput,
  normalizeRainOptions,
} from './presets'
import { createBurstParticles, createRainParticles } from './shots'
import type {
  ConfettiEngineLike,
  FireConfettiInput,
  FireConfettiRainOptions,
} from './types'

type TestOverrides = {
  isBrowser?: (() => boolean) | null
  prefersReducedMotion?: (() => boolean) | null
  engine?: ConfettiEngineLike | null
}

let testOverrides: TestOverrides = {}

function isBrowserEnvironment(): boolean {
  return testOverrides.isBrowser
    ? testOverrides.isBrowser()
    : (typeof window !== 'undefined' && typeof document !== 'undefined')
}

function prefersReducedMotion(): boolean {
  if (!isBrowserEnvironment()) return false
  if (testOverrides.prefersReducedMotion) return testOverrides.prefersReducedMotion()
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function getEngine(): ConfettiEngineLike {
  return testOverrides.engine ?? getConfettiEngine()
}

function sanitizeCoordinate(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback
}

function scheduleBurst(callback: () => void, delayMs: number): void {
  if (delayMs <= 0) {
    callback()
    return
  }

  window.setTimeout(callback, delayMs)
}

function distributeCount(total: number, buckets: number): number[] {
  const normalizedBuckets = Math.max(1, buckets)
  const base = Math.floor(total / normalizedBuckets)
  let remainder = total % normalizedBuckets

  return Array.from({ length: normalizedBuckets }, () => {
    const value = base + (remainder > 0 ? 1 : 0)
    if (remainder > 0) remainder -= 1
    return value
  }).filter((count) => count > 0)
}

export function fireConfetti(x: number, y: number, input: FireConfettiInput = 'party'): void {
  if (!isBrowserEnvironment()) return
  if (prefersReducedMotion()) return

  const options = normalizeFireInput(input)
  const originX = sanitizeCoordinate(x, window.innerWidth / 2)
  const originY = sanitizeCoordinate(y, window.innerHeight / 2)
  const style = getStylePreset(options.style)
  const physics = getPhysicsPreset(options.physics)
  const shot = getShotPreset(options.shot)
  const engine = getEngine()

  for (const burst of shot.bursts) {
    scheduleBurst(() => {
      const count = Math.max(1, Math.round(options.burstCount * burst.countScale))
      const particles = createBurstParticles({
        originX,
        originY,
        count,
        direction: burst.direction,
        spreadDeg: burst.spreadDeg,
        speedScale: burst.speedScale,
        scalar: options.scalar,
        wind: options.wind,
        style,
        physics,
      })

      engine.spawn(particles)
    }, burst.delayMs)
  }
}

export function fireConfettiRain(input: FireConfettiRainOptions = {}): void {
  if (!isBrowserEnvironment()) return
  if (prefersReducedMotion()) return

  const options = normalizeRainOptions(input)
  const style = getStylePreset(options.style)
  const physics = getPhysicsPreset(options.physics)
  const waveDelayMs = 110
  const waveCount = Math.max(1, Math.round(options.durationMs / waveDelayMs))
  const bucketCounts = distributeCount(options.count, waveCount)
  const engine = getEngine()

  bucketCounts.forEach((count, index) => {
    scheduleBurst(() => {
      const particles = createRainParticles({
        viewportWidth: window.innerWidth,
        count,
        sourceY: options.sourceY,
        widthRatio: options.widthRatio,
        scalar: options.scalar,
        wind: options.wind,
        style,
        physics,
      })

      engine.spawn(particles)
    }, index * waveDelayMs)
  })
}

export function fireBananaConfetti(x: number, y: number): void {
  fireConfetti(x, y, { style: 'banana', shot: 'pop', physics: 'balanced' })
}

export function __setConfettiTestOverrides(overrides: TestOverrides): void {
  testOverrides = { ...testOverrides, ...overrides }
}

export function __resetConfettiTestOverrides(): void {
  testOverrides = {}
}
