import { useSyncExternalStore } from 'react'
import type { DragPayload, DragRenderState, DragPointer, DragSlotCandidate } from '../types'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
type DragStoreState = {
  dragState: DragPayload | null
  dragRender: DragRenderState | null
}

let state: DragStoreState = {
  dragState: null,
  dragRender: null,
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function setState(partial: Partial<DragStoreState>) {
  state = { ...state, ...partial }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function useSelector<T>(selector: (s: DragStoreState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

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
  if (state.dragRender == null) return
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
  const current = state.dragRender
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
