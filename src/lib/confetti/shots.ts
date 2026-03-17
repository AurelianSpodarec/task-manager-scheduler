import { createPoissonSpline, createSplineY } from './physics'
import type {
  ConfettiDirection,
  ConfettiParticle,
  PhysicsPreset,
  StylePreset,
  WeightedShape,
} from './types'

type BurstParticleInput = {
  originX: number
  originY: number
  count: number
  direction: ConfettiDirection
  spreadDeg: number
  speedScale: number
  scalar: number
  wind: number
  style: StylePreset
  physics: PhysicsPreset
}

type RainParticleInput = {
  viewportWidth: number
  count: number
  sourceY: number
  widthRatio: number
  scalar: number
  wind: number
  style: StylePreset
  physics: PhysicsPreset
}

const DEG_TO_RAD = Math.PI / 180

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function pickWeightedShape(shapes: WeightedShape[]): WeightedShape['shape'] {
  const total = shapes.reduce((sum, shape) => sum + shape.weight, 0)
  if (total <= 0) return shapes[0].shape

  let remaining = Math.random() * total
  for (const entry of shapes) {
    remaining -= entry.weight
    if (remaining <= 0) return entry.shape
  }

  return shapes[shapes.length - 1].shape
}

function directionDegrees(direction: ConfettiDirection): number {
  switch (direction) {
    case 'top':
      return 270
    case 'top-left':
      return 235
    case 'top-right':
      return 305
    case 'left':
      return 180
    case 'right':
      return 0
    case 'down':
      return 90
    default:
      return 270
  }
}

function directionBias(direction: ConfettiDirection): number {
  switch (direction) {
    case 'left':
      return -1
    case 'top-left':
      return -0.55
    case 'top-right':
      return 0.55
    case 'right':
      return 1
    case 'top':
    case 'down':
    default:
      return 0
  }
}

function createReferenceParticle(
  x: number,
  y: number,
  direction: ConfettiDirection,
  spreadDeg: number,
  speedScale: number,
  scalar: number,
  wind: number,
  style: StylePreset,
  physics: PhysicsPreset,
): ConfettiParticle {
  const directionRad = directionDegrees(direction) * DEG_TO_RAD
  const spreadRad = randomBetween(-spreadDeg / 2, spreadDeg / 2) * DEG_TO_RAD
  const launchRad = directionRad + spreadRad
  const launchSpeed = (physics.dyMin + physics.dyRange * Math.random()) * speedScale * (0.9 + scalar * 0.1)
  const launchDistance = randomBetween(0, 4 * scalar)
  const baseDx = Math.sin(physics.dxThetaMin + physics.dxThetaRange * Math.random()) * 0.18
  const dx = Math.cos(launchRad) + baseDx + physics.directionalDx + wind * 0.15 + directionBias(direction) * 0.03
  const dy = Math.sin(launchRad)

  const width = (style.sizeMin + style.sizeVariance * Math.random()) * scalar
  const height = (style.sizeMin + style.sizeVariance * Math.random()) * scalar
  const splineX = createPoissonSpline(physics.eccentricity)
  const splineY = createSplineY(splineX, physics.deviation)

  return {
    x: x + Math.cos(launchRad) * launchDistance,
    y: y + Math.sin(launchRad) * launchDistance,
    drawX: x,
    drawY: y,
    dx,
    dy,
    velocity: launchSpeed,
    gravity: physics.gravity,
    decay: physics.decay,
    drift: physics.drift + wind * 0.9,
    theta: 360 * Math.random(),
    dTheta: physics.dThetaMin + physics.dThetaRange * Math.random(),
    frame: 0,
    splineX,
    splineY,
    deviation: physics.deviation,
    oscillationPeriodMs: physics.oscillationPeriodMs,
    width,
    height,
    axisX: Math.cos(360 * Math.random()),
    axisY: Math.cos(360 * Math.random()),
    shape: pickWeightedShape(style.shapes),
    color: style.colorTheme(),
  }
}

export function createBurstParticles(input: BurstParticleInput): ConfettiParticle[] {
  const particles: ConfettiParticle[] = []

  for (let i = 0; i < input.count; i++) {
    particles.push(createReferenceParticle(
      input.originX,
      input.originY,
      input.direction,
      input.spreadDeg,
      input.speedScale,
      input.scalar,
      input.wind,
      input.style,
      input.physics,
    ))
  }

  return particles
}

export function createRainParticles(input: RainParticleInput): ConfettiParticle[] {
  const particles: ConfettiParticle[] = []
  const centerX = input.viewportWidth / 2
  const halfSpan = (input.viewportWidth * input.widthRatio) / 2
  const minX = centerX - halfSpan
  const maxX = centerX + halfSpan

  for (let i = 0; i < input.count; i++) {
    particles.push(createReferenceParticle(
      randomBetween(minX, maxX),
      input.sourceY - Math.random() * input.physics.deviation,
      'down',
      22,
      0.85,
      input.scalar,
      input.wind,
      input.style,
      input.physics,
    ))
  }

  return particles
}
