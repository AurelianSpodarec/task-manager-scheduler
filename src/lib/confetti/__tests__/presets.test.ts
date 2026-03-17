import { describe, expect, it } from 'vitest'
import {
  getStylePreset,
  normalizeFireInput,
  normalizeRainOptions,
} from '../presets'

describe('confetti presets', () => {
  it('normalizes string fire input to default physics and shot', () => {
    const options = normalizeFireInput('party')
    expect(options.style).toBe('party')
    expect(options.physics).toBe('balanced')
    expect(options.shot).toBe('pop')
    expect(options.burstCount).toBeGreaterThan(0)
  })

  it('clamps invalid numeric fire options', () => {
    const options = normalizeFireInput({
      scalar: 0,
      wind: 100,
      burstCount: -3,
    })

    expect(options.scalar).toBe(1)
    expect(options.wind).toBe(3)
    expect(options.burstCount).toBeGreaterThan(0)
  })

  it('provides reference-style rgb theme output', () => {
    const partyColor = getStylePreset('party').colorTheme()
    const metallicColor = getStylePreset('metallic').colorTheme()
    expect(partyColor).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
    expect(metallicColor).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
  })

  it('normalizes rain options with sensible defaults and bounds', () => {
    const options = normalizeRainOptions({
      widthRatio: 99,
      durationMs: 10,
      count: 0,
    })

    expect(options.widthRatio).toBeLessThanOrEqual(1.8)
    expect(options.durationMs).toBeGreaterThanOrEqual(160)
    expect(options.count).toBeGreaterThan(0)
    expect(options.style).toBe('colorful')
  })
})
