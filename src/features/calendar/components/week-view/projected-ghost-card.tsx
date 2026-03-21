import { useFormatTime } from '../../hooks/use-format-time'
import type { ProjectedCard } from './projected-card'

export function ProjectedGhostCard({ projected }: { projected: ProjectedCard }) {
  const { formatEventTime } = useFormatTime()
  const isCompact = projected.height < 40
  const verticalInsetPx = 2
  const renderedHeightPx = Math.max(projected.height - verticalInsetPx * 2, 16)
  const Icon = projected.icon

  return (
    <div
      className={`pointer-events-none absolute z-20 flex min-h-4 ${isCompact ? 'flex-row items-center' : 'flex-row items-start'} gap-1.5 overflow-hidden rounded-[7px] border px-2 py-[3px] shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-zinc-200/50 ${projected.className ?? 'border-zinc-200 bg-white'}`}
      style={{
        top: `${projected.top + verticalInsetPx}px`,
        height: `${renderedHeightPx}px`,
        left: '2px',
        right: '2px',
        ...projected.style,
      }}
      aria-hidden="true"
    >
      {Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0" />}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={`block truncate font-semibold leading-tight ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>
          {projected.title}
        </span>
        {!isCompact && (
          <span className="block text-[9px] leading-tight text-zinc-500">
            {formatEventTime(projected.start)} – {formatEventTime(projected.end)}
          </span>
        )}
      </div>
    </div>
  )
}
