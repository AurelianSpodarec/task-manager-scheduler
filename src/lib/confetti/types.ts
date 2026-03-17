export type NumberRange = {
  min: number
  max: number
}

export type ConfettiStyle = 'colorful' | 'party' | 'metallic' | 'streamers' | 'banana'
export type ConfettiPhysics = 'balanced' | 'floaty' | 'heavy' | 'gustLeft' | 'gustRight'
export type ConfettiShot = 'pop' | 'doubleTap' | 'fanBurst' | 'cannonSweep'
export type ConfettiDirection = 'top' | 'top-left' | 'top-right' | 'left' | 'right' | 'down'
export type ConfettiShape = 'rect' | 'circle' | 'triangle' | 'ribbon' | 'crescent'

export type WeightedShape = {
  shape: ConfettiShape
  weight: number
}

export type ColorTheme = () => string

export type StylePreset = {
  colorTheme: ColorTheme
  shapes: WeightedShape[]
  sizeMin: number
  sizeVariance: number
}

export type PhysicsPreset = {
  eccentricity: number
  deviation: number
  dxThetaMin: number
  dxThetaRange: number
  dyMin: number
  dyRange: number
  gravity: number
  decay: number
  drift: number
  dThetaMin: number
  dThetaRange: number
  oscillationPeriodMs: number
  directionalDx: number
}

export type ShotBurst = {
  delayMs: number
  direction: ConfettiDirection
  spreadDeg: number
  countScale: number
  speedScale: number
}

export type ShotPreset = {
  bursts: ShotBurst[]
}

export type FireConfettiOptions = {
  style?: ConfettiStyle
  physics?: ConfettiPhysics
  shot?: ConfettiShot
  scalar?: number
  distanceScale?: number
  wind?: number
  burstCount?: number
}

export type FireConfettiInput = ConfettiStyle | FireConfettiOptions

export type NormalizedFireConfettiOptions = {
  style: ConfettiStyle
  physics: ConfettiPhysics
  shot: ConfettiShot
  scalar: number
  distanceScale: number
  wind: number
  burstCount: number
}

export type FireConfettiRainOptions = {
  style?: ConfettiStyle
  physics?: ConfettiPhysics
  scalar?: number
  wind?: number
  count?: number
  durationMs?: number
  widthRatio?: number
  sourceY?: number
}

export type NormalizedConfettiRainOptions = {
  style: ConfettiStyle
  physics: ConfettiPhysics
  scalar: number
  wind: number
  count: number
  durationMs: number
  widthRatio: number
  sourceY: number
}

export type ConfettiParticle = {
  x: number
  y: number
  drawX: number
  drawY: number
  dx: number
  dy: number
  velocity: number
  gravity: number
  decay: number
  drift: number
  theta: number
  dTheta: number
  ageMs: number
  lifeMs: number
  fadeCurve: number
  opacity: number
  frame: number
  splineX: number[]
  splineY: number[]
  deviation: number
  oscillationPeriodMs: number
  width: number
  height: number
  axisX: number
  axisY: number
  shape: ConfettiShape
  color: string
}

export interface ConfettiEngineLike {
  spawn(particles: ConfettiParticle[]): void
}
