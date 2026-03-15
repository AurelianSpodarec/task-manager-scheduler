import { setDragState, setDragRender, clearDragRender, updateDragRenderFrame } from '../stores/drag-store'
import { unscheduleTask, deleteScheduledTask } from '@/services/task-service'
import { HOUR_HEIGHT_PX } from '../constants'
import { cacheColumnRects, clearColumnRects, resolveSlotFromPointer, isOverSidebar } from './geometry'
import { executeDrop } from './drop-handler'
import type { CalendarDragData } from './types'

const DRAG_THRESHOLD = 4

/**
 * Start a pointer-based drag from a pointerdown event.
 * Attaches move/up listeners on window and manages the full lifecycle.
 */
export function startPointerDrag(
  element: HTMLElement,
  e: PointerEvent,
  dragData: CalendarDragData,
  callbacks: { onDragStart?: () => void; onDrop?: () => void },
) {
  const startX = e.clientX
  const startY = e.clientY
  const pointerId = e.pointerId
  let active = false

  // RAF batching — store latest coords, flush once per frame
  let pendingX = startX
  let pendingY = startY
  let rafId: number | null = null

  element.setPointerCapture(pointerId)

  function activate() {
    active = true
    setDragState({ source: dragData.source, eventId: dragData.eventId, title: dragData.title })
    document.body.classList.add('cal-dragging')
    cacheColumnRects()

    const rect = element.getBoundingClientRect()
    const pointerOffsetY = Math.max(0, Math.min(rect.height, startY - rect.top))
    if (dragData.source === 'calendar') {
      dragData.grabOffsetY = pointerOffsetY
    } else {
      const fraction = rect.height > 0 ? pointerOffsetY / rect.height : 0
      dragData.grabOffsetY = fraction * ((dragData.durationMinutes ?? 60) / 60) * HOUR_HEIGHT_PX
    }
    setDragRender({
      source: dragData.source,
      eventId: dragData.eventId,
      title: dragData.title,
      color: dragData.color ?? 'teal',
      durationMinutes: dragData.durationMinutes,
      originalStart: dragData.originalStart,
      originalEnd: dragData.originalEnd,
      personalActivityType: dragData.personalActivityType,
      pointer: { clientX: startX, clientY: startY },
      pointerOffset: {
        x: Math.max(0, Math.min(rect.width, startX - rect.left)),
        y: Math.max(0, Math.min(rect.height, startY - rect.top)),
      },
      elementSize: { width: rect.width, height: rect.height },
      slot: resolveSlotFromPointer(startX, startY),
      sidebarDropHovered: false,
      taskMeta: dragData.taskMeta,
      personalMeta: dragData.personalMeta,
      eventMeta: dragData.eventMeta,
    })
    callbacks.onDragStart?.()
  }

  function flushMove() {
    rafId = null
    const overSidebar = isOverSidebar(pendingX, pendingY)
    const slot = overSidebar ? null : resolveSlotFromPointer(pendingX, pendingY)
    const showSidebarHighlight = overSidebar && dragData.source === 'calendar'
    updateDragRenderFrame({ clientX: pendingX, clientY: pendingY }, slot, showSidebarHighlight)
  }

  function onMove(ev: PointerEvent) {
    if (!active) {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return
      activate()
    }
    pendingX = ev.clientX
    pendingY = ev.clientY
    if (rafId == null) rafId = requestAnimationFrame(flushMove)
  }

  function onUp(ev: PointerEvent) {
    cleanup()
    if (!active) return

    // Flush any pending RAF so drop uses the latest position
    if (rafId != null) { cancelAnimationFrame(rafId); rafId = null }
    const overSidebar = isOverSidebar(ev.clientX, ev.clientY)
    const slot = overSidebar ? null : resolveSlotFromPointer(ev.clientX, ev.clientY)

    // Calendar → sidebar: personal clones get deleted, work tasks get unscheduled
    if (overSidebar && dragData.source === 'calendar' && dragData.eventId) {
      if (dragData.personalActivityType != null) {
        deleteScheduledTask(dragData.eventId)
      } else {
        unscheduleTask(dragData.eventId)
      }
    } else {
      executeDrop(dragData, slot)
    }

    setDragState(null)
    clearDragRender()
    document.body.classList.remove('cal-dragging')
    clearColumnRects()
    callbacks.onDrop?.()
  }

  function cleanup() {
    if (rafId != null) { cancelAnimationFrame(rafId); rafId = null }
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
}

/** No-op — kept for CalendarShell compatibility. */
export function useCalendarDropMonitor() {}
