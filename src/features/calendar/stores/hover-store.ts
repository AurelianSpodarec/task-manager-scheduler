import { useSyncExternalStore } from 'react'
import { createStore } from './create-store'
import { getInteractionSettings } from '../config'

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


const store = createStore<SelectionState>({
  anchor: null,
  current: null,
  active: false,
  dragged: false,
  originX: 0,
  originY: 0,
})

// ---------------------------------------------------------------------------
// Range helpers
// ---------------------------------------------------------------------------

/** Produces a lexicographically-sortable key representing a point on the continuous timeline. */
function linearKey(isoDay: string, hour: number, minute: number): string {
  return `${isoDay}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function isInRange(isoDay: string, hour: number, minute: number): boolean {
  const { anchor, current } = store.getState()
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
  e.preventDefault()
  store.setState({ anchor: coord, current: coord, active: true, dragged: false, originX: e.clientX, originY: e.clientY })
  document.addEventListener('mouseup', endSelection, { once: true })
}

export function updateSelection(coord: CellCoord) {
  const s = store.getState()
  if (!s.active) return
  if (
    s.current?.isoDay === coord.isoDay &&
    s.current?.hour === coord.hour &&
    s.current?.minute === coord.minute
  ) return
  store.setState({ current: coord, dragged: true })
}

function onDismissMove(e: MouseEvent) {
  const s = store.getState()
  const dismissDistance = getInteractionSettings().mouseAwayRadiusPx
  const dx = e.clientX - s.originX
  const dy = e.clientY - s.originY
  if (dx * dx + dy * dy > dismissDistance * dismissDistance) {
    document.removeEventListener('mousemove', onDismissMove)
    clearSelection()
  }
}

export function endSelection(e?: Event) {
  const s = store.getState()
  if (!s.active) return
  const me = e as MouseEvent | undefined
  const ox = me?.clientX ?? s.originX
  const oy = me?.clientY ?? s.originY
  store.setState({ active: false, originX: ox, originY: oy })
  document.addEventListener('mousemove', onDismissMove)
}

export function clearSelection() {
  if (!store.getState().anchor) return
  document.removeEventListener('mousemove', onDismissMove)
  store.setState({ anchor: null, current: null, active: false, dragged: false, originX: 0, originY: 0 })
}

export function isSelectionActive(): boolean {
  return store.getState().active
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export function useIsCellSelected(isoDay: string, hour: number, minute: number): boolean {
  return useSyncExternalStore(
    store.subscribe,
    () => isInRange(isoDay, hour, minute),
    () => false,
  )
}
