type ConfettiShape = 'square' | 'line' | 'circle' | 'triangle'

type TwoTone = { front: string; back: string }

type Particle = {
  x: number
  y: number
  velocity: number
  angle: number
  gravity: number
  decay: number
  drift: number
  wobble: number
  wobbleSpeed: number
  tiltAngle: number
  tiltSpeed: number
  random: number
  scalar: number
  tick: number
  totalTicks: number
  shape: ConfettiShape
  color: TwoTone
  heading: number          // actual direction of movement, updated each tick
  lineLength: number       // snake body length in px
  lineThickness: number    // snake stroke width
  waveAmplitude: number    // snake wiggle intensity
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TAU = Math.PI * 2

// ~40% lines, ~25% squares, ~20% triangles, ~15% circles
const SHAPE_WEIGHTS: { shape: ConfettiShape; cumulative: number }[] = [
  { shape: 'line', cumulative: 0.40 },
  { shape: 'square', cumulative: 0.65 },
  { shape: 'triangle', cumulative: 0.85 },
  { shape: 'circle', cumulative: 1.0 },
]

const PALETTE: TwoTone[] = [
  { front: '#10b981', back: '#059669' }, // emerald
  { front: '#f59e0b', back: '#d97706' }, // amber
  { front: '#f43f5e', back: '#e11d48' }, // rose
  { front: '#6366f1', back: '#4f46e5' }, // indigo
  { front: '#14b8a6', back: '#0d9488' }, // teal
  { front: '#8b5cf6', back: '#7c3aed' }, // violet
  { front: '#3b82f6', back: '#2563eb' }, // blue
]

// ---------------------------------------------------------------------------
// Canvas lifecycle
// ---------------------------------------------------------------------------

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let dpr = 1
let rafId: number | null = null
let particles: Particle[] = []

function ensureCanvas() {
  if (canvas && ctx) return
  canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999'
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    canvas = null
    return
  }
  sizeCanvas()
  window.addEventListener('resize', sizeCanvas, { passive: true })
}

function sizeCanvas() {
  if (!canvas || !ctx) return
  dpr = window.devicePixelRatio || 1
  canvas.width = Math.round(window.innerWidth * dpr)
  canvas.height = Math.round(window.innerHeight * dpr)
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function teardown() {
  if (rafId != null) cancelAnimationFrame(rafId)
  rafId = null
  particles = []
  window.removeEventListener('resize', sizeCanvas)
  if (canvas) canvas.remove()
  canvas = null
  ctx = null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function pickShape(): ConfettiShape {
  const r = Math.random()
  for (const entry of SHAPE_WEIGHTS) {
    if (r < entry.cumulative) return entry.shape
  }
  return 'square'
}

function pickColor(): TwoTone {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)]
}

// ---------------------------------------------------------------------------
// Particle factory
// ---------------------------------------------------------------------------

type BurstConfig = {
  count: number
  spread: number       // degrees
  startVelocity: number
  decay: number
  scalar: number
  ticks: number
  gravity: number
}

function spawnParticle(originX: number, originY: number, cfg: BurstConfig): Particle {
  const spreadRad = cfg.spread * (Math.PI / 180)
  const launchAngle = -(Math.PI / 2) + rand(-spreadRad / 2, spreadRad / 2)

  const shape = pickShape()
  return {
    x: originX,
    y: originY,
    velocity: cfg.startVelocity * rand(0.6, 1),
    angle: launchAngle,
    gravity: cfg.gravity * 3,
    decay: cfg.decay,
    drift: rand(-0.4, 0.4),
    wobble: rand(0, TAU),
    wobbleSpeed: rand(0.12, 0.22),
    tiltAngle: rand(0, TAU),
    tiltSpeed: rand(0.08, 0.18),
    random: rand(2, 5) * cfg.scalar,
    scalar: cfg.scalar,
    tick: 0,
    totalTicks: cfg.ticks,
    shape,
    color: pickColor(),
    heading: launchAngle,
    lineLength: shape === 'line' ? rand(8, 16) * cfg.scalar : 0,
    lineThickness: shape === 'line' ? rand(1.2, 2.4) * cfg.scalar : 0,
    waveAmplitude: shape === 'line' ? rand(2, 4.5) * cfg.scalar : 0,
  }
}

// ---------------------------------------------------------------------------
// Shape renderers — wobble + tilt compound rotation for 3D tumble illusion
// ---------------------------------------------------------------------------

function renderSquare(c: CanvasRenderingContext2D, p: Particle, alpha: number) {
  const tiltSin = Math.sin(p.tiltAngle)
  const tiltCos = Math.cos(p.tiltAngle)
  const wobbleX = p.x + 5 * p.scalar * Math.cos(p.wobble)
  const wobbleY = p.y + 5 * p.scalar * Math.sin(p.wobble)

  c.fillStyle = Math.sin(p.tiltAngle) > 0 ? p.color.front : p.color.back
  c.globalAlpha = alpha

  c.beginPath()
  c.moveTo(p.x + p.random * tiltSin, p.y + p.random * tiltCos)
  c.lineTo(wobbleX + p.random * tiltCos, wobbleY + p.random * tiltSin)
  c.lineTo(wobbleX - p.random * tiltSin, wobbleY - p.random * tiltCos)
  c.lineTo(p.x - p.random * tiltCos, p.y - p.random * tiltSin)
  c.closePath()
  c.fill()
}

function renderLine(c: CanvasRenderingContext2D, p: Particle, alpha: number) {
  const segments = 6
  const segLen = p.lineLength / segments

  // Trail extends opposite to the heading
  const tailDirX = -Math.cos(p.heading)
  const tailDirY = -Math.sin(p.heading)
  // Perpendicular axis for the snake wiggle
  const perpX = -Math.sin(p.heading)
  const perpY = Math.cos(p.heading)

  c.strokeStyle = Math.sin(p.tiltAngle) > 0 ? p.color.front : p.color.back
  c.globalAlpha = alpha
  c.lineWidth = p.lineThickness
  c.lineCap = 'round'
  c.lineJoin = 'round'

  c.beginPath()
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const bx = p.x + tailDirX * i * segLen
    const by = p.y + tailDirY * i * segLen
    // Sine wave offset, tapers toward the tail
    const wave = Math.sin(p.wobble + i * 1.3) * p.waveAmplitude * (1 - t * 0.4)
    const px = bx + perpX * wave
    const py = by + perpY * wave
    if (i === 0) c.moveTo(px, py)
    else c.lineTo(px, py)
  }
  c.stroke()
}

function renderCircle(c: CanvasRenderingContext2D, p: Particle, alpha: number) {
  const radiusX = Math.abs(Math.cos(p.wobble)) * p.random * 0.45 + 0.8
  const radiusY = Math.abs(Math.sin(p.wobble)) * p.random * 0.45 + 0.8

  c.fillStyle = Math.sin(p.tiltAngle) > 0 ? p.color.front : p.color.back
  c.globalAlpha = alpha

  c.beginPath()
  c.ellipse(p.x, p.y, radiusX, radiusY, p.tiltAngle, 0, TAU)
  c.fill()
}

function renderTriangle(c: CanvasRenderingContext2D, p: Particle, alpha: number) {
  const tiltSin = Math.sin(p.tiltAngle)
  const tiltCos = Math.cos(p.tiltAngle)
  const wobbleX = p.x + 4 * p.scalar * Math.cos(p.wobble)
  const wobbleY = p.y + 4 * p.scalar * Math.sin(p.wobble)
  const r = p.random * 0.7

  c.fillStyle = Math.sin(p.tiltAngle) > 0 ? p.color.front : p.color.back
  c.globalAlpha = alpha

  c.beginPath()
  c.moveTo(p.x + r * tiltSin, p.y + r * tiltCos)
  c.lineTo(wobbleX - r * 0.5 * tiltCos, wobbleY + r * 0.5 * tiltSin)
  c.lineTo(p.x - r * tiltSin * 0.7, p.y - r * tiltCos * 1.2)
  c.closePath()
  c.fill()
}

const RENDERERS: Record<ConfettiShape, (c: CanvasRenderingContext2D, p: Particle, a: number) => void> = {
  square: renderSquare,
  line: renderLine,
  circle: renderCircle,
  triangle: renderTriangle,
}

// ---------------------------------------------------------------------------
// Tick-based animation loop
// ---------------------------------------------------------------------------

function animationTick() {
  if (!ctx || !canvas) { teardown(); return }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  const alive: Particle[] = []

  for (const p of particles) {
    p.tick++
    if (p.tick >= p.totalTicks) continue

    // Physics
    p.velocity *= p.decay
    const dx = Math.cos(p.angle) * p.velocity + p.drift
    const dy = Math.sin(p.angle) * p.velocity + p.gravity
    p.x += dx
    p.y += dy
    p.heading = Math.atan2(dy, dx)
    p.gravity *= 1.005

    // Oscillators
    p.wobble += p.wobbleSpeed
    p.tiltAngle += p.tiltSpeed

    // Opacity: full for first 35%, fade out over remaining 65%
    const life = p.tick / p.totalTicks
    const alpha = life < 0.35 ? 1 : 1 - (life - 0.35) / 0.65

    ctx.save()
    RENDERERS[p.shape](ctx, p, alpha)
    ctx.restore()

    alive.push(p)
  }

  particles = alive

  if (particles.length === 0) {
    teardown()
    return
  }

  rafId = requestAnimationFrame(animationTick)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const BURSTS: BurstConfig[] = [
  { count: 14, spread: 55, startVelocity: 15, decay: 0.88, scalar: 0.7, ticks: 70, gravity: 0.6 },
  { count: 8,  spread: 80, startVelocity: 12, decay: 0.90, scalar: 0.55, ticks: 70, gravity: 0.6 },
]

export function fireConfetti(x: number, y: number): void {
  if (typeof window === 'undefined') return

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const px = Math.max(0, Math.min(window.innerWidth, x))
  const py = Math.max(0, Math.min(window.innerHeight, y))

  ensureCanvas()
  if (!ctx) return

  for (const burst of BURSTS) {
    for (let i = 0; i < burst.count; i++) {
      particles.push(spawnParticle(px, py, burst))
    }
  }

  if (rafId == null) {
    rafId = requestAnimationFrame(animationTick)
  }
}
