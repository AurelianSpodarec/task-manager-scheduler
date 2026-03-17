import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fireConfetti, fireConfettiRain } from '@/lib/confetti'

export function ColorfulConfettiBlock() {
  const blockRef = useRef<HTMLDivElement>(null)

  const fireFromBlockCenter = (shot: 'fanBurst' | 'cannonSweep') => {
    const rect = blockRef.current?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const y = rect ? rect.top + rect.height * 0.76 : window.innerHeight * 0.72

    fireConfetti(x, y, {
      style: 'colorful',
      physics: shot === 'cannonSweep' ? 'gustRight' : 'balanced',
      shot,
      burstCount: shot === 'cannonSweep' ? 56 : 44,
      scalar: 1.05,
    })
  }

  return (
    <Card className="border-zinc-200/90">
      <CardHeader>
        <CardTitle>Colorful confetti block</CardTitle>
        <CardDescription>
          Reusable in-house confetti preset with directional bursts, gravity, drag, ribbon bend, and top-fall rain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={blockRef}
          onPointerDown={(event) => {
            if (!(event.target instanceof HTMLButtonElement)) {
              fireConfetti(event.clientX, event.clientY, {
                style: 'colorful',
                physics: 'balanced',
                shot: 'doubleTap',
                burstCount: 24,
              })
            }
          }}
          className="relative overflow-hidden rounded-xl border border-zinc-200 bg-linear-to-br from-rose-50 via-amber-50 to-cyan-50 p-5"
        >
          <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_15%,rgba(244,63,94,0.14),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_50%_80%,rgba(20,184,166,0.14),transparent_38%)]" />
          <div className="relative z-10 space-y-3">
            <p className="text-sm leading-6 text-zinc-700">
              Click inside this block to spawn a localized colorful burst, or use the controls for directional shots and falling confetti.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => fireFromBlockCenter('fanBurst')}
              >
                Fan burst
              </Button>
              <Button
                variant="outline"
                onClick={() => fireFromBlockCenter('cannonSweep')}
              >
                Cannon sweep
              </Button>
              <Button
                variant="outline"
                onClick={() => fireConfettiRain({
                  style: 'colorful',
                  physics: 'floaty',
                  count: 102,
                  durationMs: 1200,
                  widthRatio: 0.9,
                  wind: 0.45,
                })}
              >
                Confetti rain
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
