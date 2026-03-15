import { useDragRender, getConfig } from '../../calendar-store'
import type { DragRenderState } from '../../types'

/** Minimal fallback preview when consumer doesn't provide renderDragPreview. */
function DefaultDragPreview({ drag, width, height }: { drag: DragRenderState; width: number; height: number }) {
  const Icon = drag.icon
  const start = drag.originalStart ? new Date(drag.originalStart) : null
  const end = drag.originalEnd ? new Date(drag.originalEnd) : null

  return (
    <div
      className={`relative flex flex-row items-start gap-1.5 overflow-hidden rounded-[7px] border px-2 py-1.5 shadow-[0_14px_28px_rgba(0,0,0,0.18)] ${drag.className ?? 'border-zinc-200 bg-white'}`}
      style={{ width, height, ...drag.style }}
    >
      {Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0" />}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="block truncate text-[12px] font-semibold leading-tight">
          {drag.title}
        </span>
        {start && end && (
          <span className="block text-[10px] leading-tight text-zinc-500">
            {start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – {end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  )
}

export function CalendarDragLayer() {
  const dragRender = useDragRender()
  if (!dragRender || dragRender.slot) return null

  const left = dragRender.pointer.clientX - dragRender.pointerOffset.x
  const top = dragRender.pointer.clientY - dragRender.pointerOffset.y
  const width = Math.max(dragRender.elementSize.width, 120)
  const height = Math.max(dragRender.elementSize.height, 20)

  const { renderDragPreview } = getConfig()
  const content = renderDragPreview
    ? renderDragPreview(dragRender)
    : <DefaultDragPreview drag={dragRender} width={width} height={height} />

  if (!content) return null

  return (
    <div
      className="pointer-events-none fixed z-[80] select-none"
      style={{ left, top, width, height }}
      aria-hidden="true"
    >
      {content}
    </div>
  )
}
