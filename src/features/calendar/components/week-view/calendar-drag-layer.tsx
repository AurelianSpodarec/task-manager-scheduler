import { useDragRender } from '../../calendar-store'
import { EVENT_COLOR_MAP } from '../../constants'

export function CalendarDragLayer() {
  const dragRender = useDragRender()
  if (!dragRender || dragRender.source !== 'sidebar' || dragRender.slot) return null

  const colors = EVENT_COLOR_MAP[dragRender.color]
  const left = dragRender.pointer.clientX - dragRender.pointerOffset.x
  const top = dragRender.pointer.clientY - dragRender.pointerOffset.y
  const width = Math.max(dragRender.elementSize.width, 120)
  const height = Math.max(dragRender.elementSize.height, 20)
  const title = dragRender.title ?? 'New Event'
  const duration = dragRender.durationMinutes ?? 60

  return (
    <div
      className="pointer-events-none fixed z-[80] flex select-none flex-col overflow-hidden rounded-[var(--cal-radius-event)] border-l-[3px] px-[var(--cal-event-padding-x)] py-[var(--cal-event-padding-y)] shadow-[0_14px_28px_rgba(0,0,0,0.18)] ring-1 ring-white/35"
      style={{
        left,
        top,
        width,
        height,
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
      aria-hidden="true"
    >
      <span className="min-w-0 truncate text-[var(--cal-text-xs)] font-semibold leading-tight">
        {title}
      </span>
      <span className="mt-auto text-[var(--cal-text-2xs)] leading-tight opacity-95">Duration: {formatDuration(duration)}</span>
    </div>
  )
}

function formatDuration(minutes: number): string {
  const safeMinutes = Math.max(1, Math.round(minutes))
  const hours = Math.floor(safeMinutes / 60)
  const mins = safeMinutes % 60
  if (!hours) return `${mins}m`
  if (!mins) return `${hours}h`
  return `${hours}h ${mins}m`
}
