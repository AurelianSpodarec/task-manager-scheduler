import type { ConfettiParticle } from './types'

const PI = Math.PI
const PI2 = PI * 2

function normalizeDelta(deltaMs: number): number {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return 16.67
  return Math.min(40, Math.max(8, deltaMs))
}

export function cosineInterpolation(a: number, b: number, t: number): number {
  const progress = Math.min(1, Math.max(0, t))
  return ((1 - Math.cos(PI * progress)) / 2) * (b - a) + a
}

export function createPoissonSpline(eccentricity: number): number[] {
  const radius = 1 / Math.max(1.2, eccentricity)
  const radius2 = radius + radius
  const domain: number[] = [radius, 1 - radius]
  let measure = 1 - radius2
  const spline = [0, 1]

  while (measure > 0) {
    let dart = measure * Math.random()
    let intervalStart = 0
    let intervalEnd = 0
    let accumulated = 0

    for (let i = 0; i < domain.length; i += 2) {
      intervalStart = domain[i]
      intervalEnd = domain[i + 1]
      const intervalMeasure = intervalEnd - intervalStart
      if (dart < accumulated + intervalMeasure) {
        dart += intervalStart - accumulated
        spline.push(dart)
        break
      }
      accumulated += intervalMeasure
    }

    const c = dart - radius
    const d = dart + radius

    for (let i = domain.length - 1; i > 0; i -= 2) {
      const leftIndex = i - 1
      const a = domain[leftIndex]
      const b = domain[i]

      if (a >= c && a < d) {
        if (b > d) domain[leftIndex] = d
        else domain.splice(leftIndex, 2)
      } else if (a < c && b > c) {
        if (b <= d) domain[i] = c
        else domain.splice(i, 0, c, d)
      }
    }

    measure = 0
    for (let i = 0; i < domain.length; i += 2) {
      measure += domain[i + 1] - domain[i]
    }
  }

  return spline.sort((a, b) => a - b)
}

export function createSplineY(splineX: number[], deviation: number): number[] {
  const values: number[] = []
  const lastIndex = splineX.length - 1

  for (let i = 1; i < lastIndex; i++) {
    values[i] = deviation * Math.random()
  }

  values[0] = deviation * Math.random()
  values[lastIndex] = deviation * Math.random()
  return values
}

function resolveRho(particle: ConfettiParticle): number {
  const period = particle.oscillationPeriodMs
  const phase = (particle.frame % period) / period

  let i = 0
  let j = 1
  while (j < particle.splineX.length - 1 && phase >= particle.splineX[j]) {
    i = j
    j += 1
  }

  const denominator = particle.splineX[j] - particle.splineX[i]
  const segmentProgress = denominator > 0 ? (phase - particle.splineX[i]) / denominator : 0
  return cosineInterpolation(particle.splineY[i], particle.splineY[j], segmentProgress)
}

export function stepParticle(
  particle: ConfettiParticle,
  deltaMs: number,
  viewportHeight: number,
): boolean {
  const delta = normalizeDelta(deltaMs)
  const deltaScale = delta / 16.6666666667
  particle.frame += delta
  particle.x += particle.dx * particle.velocity * deltaScale + particle.drift * deltaScale
  particle.y += particle.dy * particle.velocity * deltaScale + particle.gravity * deltaScale
  particle.velocity *= Math.pow(particle.decay, deltaScale)
  particle.theta += particle.dTheta * delta

  const rho = resolveRho(particle)
  const phase = (particle.frame % particle.oscillationPeriodMs) / particle.oscillationPeriodMs
  const phi = phase * PI2

  particle.drawX = particle.x + rho * Math.cos(phi)
  particle.drawY = particle.y + rho * Math.sin(phi)
  return particle.y <= viewportHeight + particle.deviation
}
