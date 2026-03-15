import { getSlotDuration, getDayStartHour } from '../config'
import { HOUR_HEIGHT_PX } from '../constants'
import { SLOT_TYPE, type SlotDropData } from './types'

// ---------------------------------------------------------------------------
// Direction-aware day-column snapping
// ---------------------------------------------------------------------------
type ColumnRect = { isoDay: string; left: number; right: number }
let columnRects: ColumnRect[] = []
let currentDay: string | null = null
let lastPointerX = 0

const ADVANCE_ZONE = 0.115
const COMMIT_ZONE = 0.35
const MIN_DELTA = 2

export function cacheColumnRects() {
  const els = document.querySelectorAll<HTMLElement>('[data-date]')
  columnRects = Array.from(els)
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { isoDay: el.dataset.date!, left: r.left, right: r.right }
    })
    .filter((c) => c.right > c.left)
    .sort((a, b) => a.left - b.left)
}

export function clearColumnRects() {
  columnRects = []
  currentDay = null
  lastPointerX = 0
}

export function resolveSnapDay(clientX: number): string | null {
  if (columnRects.length === 0) return null

  const delta = clientX - lastPointerX
  lastPointerX = clientX

  let idx = -1
  for (let i = 0; i < columnRects.length; i++) {
    if (clientX >= columnRects[i].left && clientX < columnRects[i].right) {
      idx = i
      break
    }
  }
  if (idx === -1) return currentDay

  if (!currentDay) {
    currentDay = columnRects[idx].isoDay
    return currentDay
  }

  if (Math.abs(delta) < MIN_DELTA) return currentDay

  const col = columnRects[idx]
  const colWidth = col.right - col.left
  const posInCol = clientX - col.left
  const margin = colWidth * ADVANCE_ZONE

  const curDayIdx = columnRects.findIndex((c) => c.isoDay === currentDay)
  if (curDayIdx === -1) {
    currentDay = col.isoDay
    return currentDay
  }

  if (idx === curDayIdx) {
    if (delta > 0 && posInCol > colWidth - margin && idx < columnRects.length - 1) {
      currentDay = columnRects[idx + 1].isoDay
    } else if (delta < 0 && posInCol < margin && idx > 0) {
      currentDay = columnRects[idx - 1].isoDay
    }
    return currentDay
  }

  const commitPx = colWidth * COMMIT_ZONE
  if (idx === curDayIdx + 1) {
    if (posInCol > commitPx) currentDay = col.isoDay
    return currentDay
  }
  if (idx === curDayIdx - 1) {
    if (posInCol < colWidth - commitPx) currentDay = col.isoDay
    return currentDay
  }

  currentDay = col.isoDay
  return currentDay
}

// ---------------------------------------------------------------------------
// Sidebar drop zone detection
// ---------------------------------------------------------------------------
export function isOverSidebar(clientX: number, clientY: number): boolean {
  const el = document.querySelector<HTMLElement>('[data-sidebar-dropzone]')
  if (!el) return false
  const r = el.getBoundingClientRect()
  return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom
}

// ---------------------------------------------------------------------------
// Slot resolution from pointer coordinates
// ---------------------------------------------------------------------------
export function resolveSlotFromPointer(clientX: number, clientY: number): SlotDropData | null {
  // All-day row detection
  const allDayEl = document.querySelector<HTMLElement>('[data-allday-row]')
  if (allDayEl) {
    const r = allDayEl.getBoundingClientRect()
    if (clientY >= r.top && clientY <= r.bottom) {
      const day = resolveSnapDay(clientX)
      if (day) return { _type: SLOT_TYPE, isoDay: day, hour: 0, minute: 0, isAllDay: true }
    }
  }

  const day = resolveSnapDay(clientX)
  if (!day) return null

  const colEl = document.querySelector<HTMLElement>(`[data-date="${day}"]`)
  if (!colEl) return null

  const rect = colEl.getBoundingClientRect()
  const slotDuration = getSlotDuration()
  const yInColumn = clientY - rect.top
  const dayStart = getDayStartHour()
  const rawMinutes = dayStart * 60 + (yInColumn / HOUR_HEIGHT_PX) * 60
  const snappedMinutes = Math.floor(rawMinutes / slotDuration) * slotDuration
  const clamped = Math.max(dayStart * 60, snappedMinutes)
  const hour = Math.floor(clamped / 60)
  const minute = clamped % 60

  return { _type: SLOT_TYPE, isoDay: day, hour, minute }
}
