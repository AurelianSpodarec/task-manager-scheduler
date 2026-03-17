import { getStyleTheme } from './themes'
import type {
  ConfettiPhysics,
  ConfettiShot,
  ConfettiStyle,
  FireConfettiInput,
  FireConfettiRainOptions,
  NormalizedConfettiRainOptions,
  NormalizedFireConfettiOptions,
  PhysicsPreset,
  ShotPreset,
  StylePreset,
} from './types'

const DEFAULT_FIRE_STYLE: ConfettiStyle = 'party'
const DEFAULT_FIRE_PHYSICS: ConfettiPhysics = 'balanced'
const DEFAULT_FIRE_SHOT: ConfettiShot = 'pop'
const DEFAULT_BURST_COUNT = 28

const DEFAULT_RAIN_STYLE: ConfettiStyle = 'colorful'
const DEFAULT_RAIN_PHYSICS: ConfettiPhysics = 'floaty'
const DEFAULT_RAIN_COUNT = 96
const DEFAULT_RAIN_DURATION_MS = 1000
const DEFAULT_RAIN_WIDTH_RATIO = 0.95
const DEFAULT_RAIN_SOURCE_Y = -24

export const CONFETTI_STYLE_LABELS: Record<ConfettiStyle, string> = {
  colorful: 'Colorful',
  party: 'Party Confetti',
  metallic: 'Metallic Confetti',
  streamers: 'Streamer Confetti',
  banana: 'Banana Confetti',
}

export const CONFETTI_PHYSICS_LABELS: Record<ConfettiPhysics, string> = {
  balanced: 'Balanced',
  floaty: 'Floaty',
  heavy: 'Heavy Fall',
  gustLeft: 'Wind Gust Left',
  gustRight: 'Wind Gust Right',
}

export const CONFETTI_SHOT_LABELS: Record<ConfettiShot, string> = {
  pop: 'Pop',
  doubleTap: 'Double Tap',
  fanBurst: 'Fan Burst',
  cannonSweep: 'Cannon Sweep',
}

const STYLE_PRESETS: Record<ConfettiStyle, StylePreset> = {
  colorful: {
    colorTheme: getStyleTheme('colorful'),
    shapes: [
      { shape: 'rect', weight: 0.32 },
      { shape: 'circle', weight: 0.2 },
      { shape: 'triangle', weight: 0.14 },
      { shape: 'ribbon', weight: 0.26 },
      { shape: 'crescent', weight: 0.08 },
    ],
    sizeMin: 3,
    sizeVariance: 9,
  },
  party: {
    colorTheme: getStyleTheme('party'),
    shapes: [
      { shape: 'rect', weight: 0.42 },
      { shape: 'circle', weight: 0.18 },
      { shape: 'triangle', weight: 0.1 },
      { shape: 'ribbon', weight: 0.3 },
    ],
    sizeMin: 3,
    sizeVariance: 9,
  },
  metallic: {
    colorTheme: getStyleTheme('metallic'),
    shapes: [
      { shape: 'rect', weight: 0.52 },
      { shape: 'circle', weight: 0.32 },
      { shape: 'triangle', weight: 0.06 },
      { shape: 'ribbon', weight: 0.1 },
    ],
    sizeMin: 3,
    sizeVariance: 8,
  },
  streamers: {
    colorTheme: getStyleTheme('streamers'),
    shapes: [
      { shape: 'ribbon', weight: 0.6 },
      { shape: 'rect', weight: 0.28 },
      { shape: 'triangle', weight: 0.12 },
    ],
    sizeMin: 2.5,
    sizeVariance: 8,
  },
  banana: {
    colorTheme: getStyleTheme('banana'),
    shapes: [
      { shape: 'crescent', weight: 0.7 },
      { shape: 'ribbon', weight: 0.2 },
      { shape: 'rect', weight: 0.1 },
    ],
    sizeMin: 3.5,
    sizeVariance: 10,
  },
}

const PHYSICS_PRESETS: Record<ConfettiPhysics, PhysicsPreset> = {
  balanced: {
    eccentricity: 10,
    deviation: 30,
    dxThetaMin: -0.04,
    dxThetaRange: 0.08,
    dyMin: 40,
    dyRange: 12,
    gravity: 2.8,
    decay: 0.9,
    drift: 0,
    dThetaMin: 0.4,
    dThetaRange: 0.3,
    oscillationPeriodMs: 6400,
    directionalDx: 0,
  },
  floaty: {
    eccentricity: 11.5,
    deviation: 38,
    dxThetaMin: -0.05,
    dxThetaRange: 0.1,
    dyMin: 34,
    dyRange: 10,
    gravity: 1.9,
    decay: 0.92,
    drift: 0.05,
    dThetaMin: 0.3,
    dThetaRange: 0.24,
    oscillationPeriodMs: 7200,
    directionalDx: 0,
  },
  heavy: {
    eccentricity: 8.8,
    deviation: 24,
    dxThetaMin: -0.03,
    dxThetaRange: 0.06,
    dyMin: 46,
    dyRange: 14,
    gravity: 3.4,
    decay: 0.88,
    drift: 0,
    dThetaMin: 0.52,
    dThetaRange: 0.34,
    oscillationPeriodMs: 5600,
    directionalDx: 0,
  },
  gustLeft: {
    eccentricity: 10,
    deviation: 30,
    dxThetaMin: -0.04,
    dxThetaRange: 0.08,
    dyMin: 40,
    dyRange: 12,
    gravity: 2.8,
    decay: 0.9,
    drift: -0.7,
    dThetaMin: 0.4,
    dThetaRange: 0.3,
    oscillationPeriodMs: 7777,
    directionalDx: -0.05,
  },
  gustRight: {
    eccentricity: 10,
    deviation: 30,
    dxThetaMin: -0.04,
    dxThetaRange: 0.08,
    dyMin: 40,
    dyRange: 12,
    gravity: 2.8,
    decay: 0.9,
    drift: 0.7,
    dThetaMin: 0.4,
    dThetaRange: 0.3,
    oscillationPeriodMs: 6400,
    directionalDx: 0.05,

  },
}

const SHOT_PRESETS: Record<ConfettiShot, ShotPreset> = {
  pop: {
    bursts: [
      { delayMs: 0, direction: 'top', spreadDeg: 42, countScale: 1, speedScale: 1 },
    ],
  },
  doubleTap: {
    bursts: [
      { delayMs: 0, direction: 'top-left', spreadDeg: 58, countScale: 0.68, speedScale: 1.02 },
      { delayMs: 82, direction: 'top-right', spreadDeg: 58, countScale: 0.68, speedScale: 1.08 },
    ],
  },
  fanBurst: {
    bursts: [
      { delayMs: 0, direction: 'top-left', spreadDeg: 46, countScale: 0.45, speedScale: 0.98 },
      { delayMs: 40, direction: 'top', spreadDeg: 58, countScale: 0.56, speedScale: 1.08 },
      { delayMs: 80, direction: 'top-right', spreadDeg: 46, countScale: 0.45, speedScale: 0.98 },
    ],
  },
  cannonSweep: {
    bursts: [
      { delayMs: 0, direction: 'left', spreadDeg: 30, countScale: 0.34, speedScale: 0.9 },
      { delayMs: 45, direction: 'top-left', spreadDeg: 40, countScale: 0.46, speedScale: 0.98 },
      { delayMs: 90, direction: 'top', spreadDeg: 52, countScale: 0.58, speedScale: 1.08 },
      { delayMs: 135, direction: 'top-right', spreadDeg: 40, countScale: 0.46, speedScale: 0.98 },
      { delayMs: 180, direction: 'right', spreadDeg: 30, countScale: 0.34, speedScale: 0.9 },
    ],
  },
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function toFinite(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? Number(value) : fallback
}

function toPositive(value: number | undefined, fallback: number): number {
  const next = toFinite(value, fallback)
  return next > 0 ? next : fallback
}

export function getStylePreset(style: ConfettiStyle): StylePreset {
  return STYLE_PRESETS[style]
}

export function getPhysicsPreset(physics: ConfettiPhysics): PhysicsPreset {
  return PHYSICS_PRESETS[physics]
}

export function getShotPreset(shot: ConfettiShot): ShotPreset {
  return SHOT_PRESETS[shot]
}

export function normalizeFireInput(input: FireConfettiInput): NormalizedFireConfettiOptions {
  if (typeof input === 'string') {
    return {
      style: input,
      physics: DEFAULT_FIRE_PHYSICS,
      shot: DEFAULT_FIRE_SHOT,
      scalar: 1,
      distanceScale: 1,
      wind: 0,
      burstCount: DEFAULT_BURST_COUNT,
    }
  }

  return {
    style: input.style ?? DEFAULT_FIRE_STYLE,
    physics: input.physics ?? DEFAULT_FIRE_PHYSICS,
    shot: input.shot ?? DEFAULT_FIRE_SHOT,
    scalar: toPositive(input.scalar, 1),
    distanceScale: clamp(toPositive(input.distanceScale, 1), 0.25, 2.5),
    wind: clamp(toFinite(input.wind, 0), -3, 3),
    burstCount: Math.max(1, Math.round(toPositive(input.burstCount, DEFAULT_BURST_COUNT))),
  }
}

export function normalizeRainOptions(
  input: FireConfettiRainOptions = {},
): NormalizedConfettiRainOptions {
  return {
    style: input.style ?? DEFAULT_RAIN_STYLE,
    physics: input.physics ?? DEFAULT_RAIN_PHYSICS,
    scalar: toPositive(input.scalar, 1),
    wind: clamp(toFinite(input.wind, 0), -3, 3),
    count: Math.max(1, Math.round(toPositive(input.count, DEFAULT_RAIN_COUNT))),
    durationMs: Math.max(160, Math.round(toPositive(input.durationMs, DEFAULT_RAIN_DURATION_MS))),
    widthRatio: clamp(toPositive(input.widthRatio, DEFAULT_RAIN_WIDTH_RATIO), 0.2, 1.8),
    sourceY: toFinite(input.sourceY, DEFAULT_RAIN_SOURCE_Y),
  }
}
