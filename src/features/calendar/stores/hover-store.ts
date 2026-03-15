import { useSyncExternalStore } from 'react'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
export type CellCoord = { isoDay: string; hour: number; minute: number }

type SelectionState = {
  anchor: CellCoord | null
  current: CellCoord | null
  active: boolean  // true while mouse button is held
  dragged: boolean // true once user moves to a different cell
  originX: number
  originY: number
}

let state: SelectionState = {
  anchor: null,
  current: null,
  active: false,
  dragged: false,
  originX: 0,
  originY: 0,
}

const DISMISS_DISTANCE = 250

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function setState(next: SelectionState) {
  state = next
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// ---------------------------------------------------------------------------
// Range helpers
// ---------------------------------------------------------------------------

/** Produces a lexicographically-sortable key representing a point on the continuous timeline. */
function linearKey(isoDay: string, hour: number, minute: number): string {
  return `${isoDay}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function isInRange(isoDay: string, hour: number, minute: number): boolean {
  const { anchor, current } = state
  if (!anchor || !current) return false

  const kA = linearKey(anchor.isoDay, anchor.hour, anchor.minute)
  const kB = linearKey(current.isoDay, current.hour, current.minute)
  const lo = kA < kB ? kA : kB
  const hi = kA < kB ? kB : kA
  const k = linearKey(isoDay, hour, minute)
  return k >= lo && k <= hi
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Called on mousedown — records anchor but doesn't highlight until user drags. */
export function startSelection(coord: CellCoord, e: MouseEvent) {
  e.preventDefault() // prevent native drag (no-drop cursor on borders)
  setState({ anchor: coord, current: coord, active: true, dragged: false, originX: e.clientX, originY: e.clientY })
  document.addEventListener('mouseup', endSelection, { once: true })
}

/** Called on mouseenter while the selection is active — marks as dragged on first move. */
export function updateSelection(coord: CellCoord) {
  if (!state.active) return
  if (
    state.current?.isoDay === coord.isoDay &&
    state.current?.hour === coord.hour &&
    state.current?.minute === coord.minute
  ) return
  setState({ ...state, current: coord, dragged: true })
}

/** Dismiss selection when the cursor drifts far from the origin. */
function onDismissMove(e: MouseEvent) {
  const dx = e.clientX - state.originX
  const dy = e.clientY - state.originY
  if (dx * dx + dy * dy > DISMISS_DISTANCE * DISMISS_DISTANCE) {
    document.removeEventListener('mousemove', onDismissMove)
    clearSelection()
  }
}

/** Called on mouseup — keeps selection visible and starts dismiss tracking from release point. */
export function endSelection(e?: Event) {
  if (!state.active) return
  const me = e as MouseEvent | undefined
  const ox = me?.clientX ?? state.originX
  const oy = me?.clientY ?? state.originY
  setState({ ...state, active: false, originX: ox, originY: oy })
  document.addEventListener('mousemove', onDismissMove)
}

/** Clears the selection entirely. */
export function clearSelection() {
  if (!state.anchor) return
  document.removeEventListener('mousemove', onDismissMove)
  setState({ anchor: null, current: null, active: false, dragged: false, originX: 0, originY: 0 })
}

export function isSelectionActive(): boolean {
  return state.active
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export function useIsCellSelected(isoDay: string, hour: number, minute: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isInRange(isoDay, hour, minute),
    () => false,
  )
}
