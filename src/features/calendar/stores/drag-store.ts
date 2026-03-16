import type { DragPayload, DragRenderState, DragPointer, DragSlotCandidate } from '../types'
import { createStore } from './create-store'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
type DragStoreState = {
  dragState: DragPayload | null
  dragRender: DragRenderState | null
}

const { getState, setState, useSelector } = createStore<DragStoreState>({
  dragState: null,
  dragRender: null,
})

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
export function setDragState(drag: DragPayload | null) {
  setState({ dragState: drag })
}

export function setDragRender(dragRender: DragRenderState | null) {
  setState({ dragRender })
}

export function clearDragRender() {
  if (getState().dragRender == null) return
  setState({ dragRender: null })
}

function isSameSlotCandidate(a: DragSlotCandidate | null, b: DragSlotCandidate | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return (
    a.isoDay === b.isoDay &&
    a.hour === b.hour &&
    a.minute === b.minute &&
    Boolean(a.isAllDay) === Boolean(b.isAllDay)
  )
}

function isSamePointer(a: DragPointer, b: DragPointer): boolean {
  return a.clientX === b.clientX && a.clientY === b.clientY
}

export function updateDragRenderFrame(pointer: DragPointer, slot: DragSlotCandidate | null, sidebarDropHovered = false) {
  const current = getState().dragRender
  if (!current) return
  if (
    isSamePointer(current.pointer, pointer) &&
    isSameSlotCandidate(current.slot, slot) &&
    current.sidebarDropHovered === sidebarDropHovered
  ) return
  setState({
    dragRender: {
      ...current,
      pointer,
      slot,
      sidebarDropHovered,
    },
  })
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export function useDragState(): DragPayload | null {
  return useSelector((s) => s.dragState)
}

export function useDragRender(): DragRenderState | null {
  return useSelector((s) => s.dragRender)
}

/** Narrow selector — only re-renders when the targeted day changes (or drag starts/stops). */
export function useDragSlotDay(): string | null {
  return useSelector((s) => s.dragRender?.slot?.isoDay ?? null)
}

/** Narrow boolean — only re-renders on drag start/stop, not every pointer move. */
export function useIsDragging(): boolean {
  return useSelector((s) => s.dragRender != null)
}
