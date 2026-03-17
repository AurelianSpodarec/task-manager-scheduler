import { describe, expect, it } from 'vitest'
import {
  cosineInterpolation,
  createPoissonSpline,
  createSplineY,
  stepParticle,
} from '../physics'
import type { ConfettiParticle } from '../types'

function makeParticle(overrides: Partial<ConfettiParticle> = {}): ConfettiParticle {
  const splineX = [0, 0.35, 0.7, 1]
  const splineY = [20, 60, 30, 50]

  return {
    x: 120,
    y: -40,
    drawX: 120,
    drawY: -40,
    dx: 0.08,
    dy: 0.15,
    velocity: 42,
    gravity: 2.4,
    decay: 0.9,
    drift: 0,
    theta: 180,
    dTheta: 0.52,
    ageMs: 0,
    lifeMs: 2000,
    fadeCurve: 1,
    opacity: 1,
    frame: 0,
    splineX,
    splineY,
    deviation: 100,
    oscillationPeriodMs: 7777,
    width: 8,
    height: 6,
    axisX: 0.6,
    axisY: 0.4,
    shape: 'rect',
    color: 'rgb(120,120,120)',
    ...overrides,
  }
}

describe('reference confetti physics', () => {
  it('performs cosine interpolation with endpoint and midpoint stability', () => {
    expect(cosineInterpolation(10, 90, 0)).toBe(10)
    expect(cosineInterpolation(10, 90, 1)).toBe(90)
    expect(cosineInterpolation(10, 90, 0.5)).toBeCloseTo(50, 5)
  })

  it('creates sorted poisson splines over [0, 1]', () => {
    const spline = createPoissonSpline(10)
    expect(spline[0]).toBe(0)
    expect(spline[spline.length - 1]).toBe(1)
    for (let i = 1; i < spline.length; i++) {
      expect(spline[i]).toBeGreaterThanOrEqual(spline[i - 1])
    }
  })

  it('creates spline Y values aligned with spline index boundaries', () => {
    const splineX = [0, 0.2, 0.8, 1]
    const splineY = createSplineY(splineX, 100)
    expect(splineY.length).toBe(splineX.length)
    expect(splineY[0]).toBeGreaterThanOrEqual(0)
    expect(splineY[splineY.length - 1]).toBeGreaterThanOrEqual(0)
  })

  it('advances particle trajectory using dx/dy and spline orbit', () => {
    const particle = makeParticle()
    const alive = stepParticle(particle, 16.67, 900)

    expect(alive).toBe(true)
    expect(particle.x).toBeGreaterThan(120)
    expect(particle.y).toBeGreaterThan(-40)
    expect(particle.theta).toBeGreaterThan(180)
    expect(particle.drawX).not.toBe(particle.x)
    expect(particle.drawY).not.toBe(particle.y)
  })

  it('expires particle when it passes viewport height plus deviation', () => {
    const particle = makeParticle({
      y: 955,
      dy: 0.4,
      deviation: 60,
    })

    const alive = stepParticle(particle, 40, 900)
    expect(alive).toBe(false)
  })
})
