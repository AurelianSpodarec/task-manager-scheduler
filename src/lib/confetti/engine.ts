import { stepParticle } from './physics'
import type { ConfettiEngineLike, ConfettiParticle } from './types'

function hasDom(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

class CanvasConfettiEngine implements ConfettiEngineLike {
  private canvas: HTMLCanvasElement | null = null
  private context: CanvasRenderingContext2D | null = null
  private particles: ConfettiParticle[] = []
  private rafId: number | null = null
  private lastFrameTs: number | null = null
  private width = 0
  private height = 0
  private dpr = 1

  private readonly onResize = () => {
    this.resize()
  }

  spawn(particles: ConfettiParticle[]): void {
    if (!hasDom() || particles.length === 0) return

    this.ensureCanvas()
    if (!this.context) return

    this.particles.push(...particles)
    if (this.rafId == null) {
      this.lastFrameTs = null
      this.rafId = window.requestAnimationFrame(this.tick)
    }
  }

  private ensureCanvas(): void {
    if (this.canvas && this.context) return
    if (!hasDom()) return

    const canvas = document.createElement('canvas')
    canvas.id = 'task-confetti-overlay'
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '9999'

    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return

    this.canvas = canvas
    this.context = context
    document.body.appendChild(canvas)
    window.addEventListener('resize', this.onResize, { passive: true })
    this.resize()
  }

  private resize(): void {
    if (!this.canvas || !this.context || !hasDom()) return

    this.width = Math.max(1, window.innerWidth)
    this.height = Math.max(1, window.innerHeight)
    this.dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1))

    this.canvas.width = Math.floor(this.width * this.dpr)
    this.canvas.height = Math.floor(this.height * this.dpr)
    this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  private readonly tick = (timestamp: number) => {
    const context = this.context
    if (!context) {
      this.stop()
      return
    }

    const deltaMs = this.lastFrameTs == null ? 16.67 : timestamp - this.lastFrameTs
    this.lastFrameTs = timestamp
    context.clearRect(0, 0, this.width, this.height)

    const aliveParticles: ConfettiParticle[] = []
    for (const particle of this.particles) {
      if (!stepParticle(particle, deltaMs, this.height)) continue
      aliveParticles.push(particle)
      this.drawParticle(context, particle)
    }

    this.particles = aliveParticles
    if (this.particles.length === 0) {
      this.stop()
      return
    }

    this.rafId = window.requestAnimationFrame(this.tick)
  }

  private stop(): void {
    if (this.rafId != null && hasDom()) {
      window.cancelAnimationFrame(this.rafId)
    }

    this.rafId = null
    this.lastFrameTs = null
    this.particles = []

    if (this.context) {
      this.context.clearRect(0, 0, this.width, this.height)
    }

    this.teardownCanvas()
  }

  private teardownCanvas(): void {
    if (!this.canvas) return
    window.removeEventListener('resize', this.onResize)
    this.canvas.remove()
    this.canvas = null
    this.context = null
  }

  private drawParticle(context: CanvasRenderingContext2D, particle: ConfettiParticle): void {
    const thetaRad = (particle.theta * Math.PI) / 180
    const flipSignal = Math.cos(thetaRad * (0.6 + Math.abs(particle.axisX)))
    const depthScale = 0.35 + 0.65 * Math.abs(flipSignal)

    context.save()
    context.globalAlpha = particle.opacity
    context.translate(particle.drawX, particle.drawY)
    context.rotate(thetaRad * 0.16 * particle.axisY)
    context.scale(depthScale, 1)
    context.fillStyle = particle.color

    switch (particle.shape) {
      case 'circle':
        this.drawCircle(context, particle)
        break
      case 'triangle':
        this.drawTriangle(context, particle)
        break
      case 'ribbon':
        this.drawRibbon(context, particle, thetaRad)
        break
      case 'crescent':
        this.drawCrescent(context, particle)
        break
      case 'rect':
      default:
        this.drawRect(context, particle)
        break
    }

    context.restore()
  }

  private drawRect(context: CanvasRenderingContext2D, particle: ConfettiParticle): void {
    context.fillRect(
      -particle.width / 2,
      -particle.height / 2,
      particle.width,
      particle.height,
    )
  }

  private drawCircle(context: CanvasRenderingContext2D, particle: ConfettiParticle): void {
    context.beginPath()
    context.arc(0, 0, Math.max(1, particle.width) * 0.5, 0, Math.PI * 2)
    context.fill()
  }

  private drawTriangle(context: CanvasRenderingContext2D, particle: ConfettiParticle): void {
    context.beginPath()
    context.moveTo(0, -particle.height / 2)
    context.lineTo(particle.width / 2, particle.height / 2)
    context.lineTo(-particle.width / 2, particle.height / 2)
    context.closePath()
    context.fill()
  }

  private drawRibbon(context: CanvasRenderingContext2D, particle: ConfettiParticle, theta: number): void {
    const wave = Math.sin(theta * 1.8) * particle.height * 0.2
    const halfW = particle.width / 2
    const halfH = particle.height / 2

    context.beginPath()
    context.moveTo(-halfW, -halfH)
    context.quadraticCurveTo(0, -halfH + wave, halfW, -halfH)
    context.lineTo(halfW, halfH)
    context.quadraticCurveTo(0, halfH + wave, -halfW, halfH)
    context.closePath()
    context.fill()
  }

  private drawCrescent(context: CanvasRenderingContext2D, particle: ConfettiParticle): void {
    const radius = particle.width * 0.56
    const innerRadius = radius * 0.74

    context.beginPath()
    context.arc(0, 0, radius, -1.05, 1.05)
    context.arc(radius * 0.36, 0, innerRadius, 1.05, -1.05, true)
    context.closePath()
    context.fill()
  }
}

let engineSingleton: CanvasConfettiEngine | null = null

export function getConfettiEngine(): ConfettiEngineLike {
  if (!engineSingleton) {
    engineSingleton = new CanvasConfettiEngine()
  }

  return engineSingleton
}
