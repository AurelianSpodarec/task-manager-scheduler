import { getSlotDuration, getDayStartHour, getInteractionSettings } from '../config'
import { HOUR_HEIGHT_PX } from '../constants'
import { SLOT_TYPE, type SlotDropData } from './types'
import {
  getAllDayRowElement,
  getDayColumnElement,
  getRegisteredDayColumns,
  getSidebarDropzoneElement,
} from './region-registry'

// ---------------------------------------------------------------------------
// Direction-aware day-column snapping
// ---------------------------------------------------------------------------
type ColumnRect = { isoDay: string; left: number; right: number }

type GeometryState = {
  columnRects: ColumnRect[]
  currentDay: string | null
  lastPointerX: number
  currentTimedMinutes: number | null
  lastPointerY: number
}

const geometryByInstance = new Map<string, GeometryState>()

function getState(instanceId: string): GeometryState {
  const existing = geometryByInstance.get(instanceId)
  if (existing) return existing
  const created: GeometryState = {
    columnRects: [],
    currentDay: null,
    lastPointerX: 0,
    currentTimedMinutes: null,
    lastPointerY: 0,
  }
  geometryByInstance.set(instanceId, created)
  return created
}

export function cacheColumnRects(instanceId: string) {
  const state = getState(instanceId)
  const entries = getRegisteredDayColumns(instanceId)
  state.columnRects = entries
    .map(({ isoDay, element }) => {
      const r = element.getBoundingClientRect()
      return { isoDay, left: r.left, right: r.right }
    })
    .filter((c) => c.right > c.left)
    .sort((a, b) => a.left - b.left)
}

export function clearColumnRects(instanceId: string) {
  const state = getState(instanceId)
  state.columnRects = []
  state.currentDay = null
  state.lastPointerX = 0
  state.currentTimedMinutes = null
  state.lastPointerY = 0
}

/** Simple containment lookup — no hysteresis. Used for all-day row targeting. */
export function resolveSimpleDay(clientX: number, instanceId: string): string | null {
  const state = getState(instanceId)
  for (let i = 0; i < state.columnRects.length; i++) {
    if (clientX >= state.columnRects[i].left && clientX < state.columnRects[i].right) {
      state.currentDay = state.columnRects[i].isoDay
      state.lastPointerX = clientX
      return state.currentDay
    }
  }
  return state.currentDay
}

export function resolveSnapDay(clientX: number, instanceId: string): string | null {
  const state = getState(instanceId)
  if (state.columnRects.length === 0) return null
  const interaction = getInteractionSettings()
  const delta = clientX - state.lastPointerX
  state.lastPointerX = clientX

  let idx = -1
  for (let i = 0; i < state.columnRects.length; i++) {
    if (clientX >= state.columnRects[i].left && clientX < state.columnRects[i].right) {
      idx = i
      break
    }
  }
  if (idx === -1) return state.currentDay
  if (!state.currentDay) {
    state.currentDay = state.columnRects[idx].isoDay
    return state.currentDay
  }
  if (Math.abs(delta) < interaction.dragHorizontalMinDeltaPx) return state.currentDay

  const col = state.columnRects[idx]
  const colWidth = col.right - col.left
  const posInCol = clientX - col.left
  const margin = colWidth * interaction.dragHorizontalAdvanceZone
  const curDayIdx = state.columnRects.findIndex((c) => c.isoDay === state.currentDay)
  if (curDayIdx === -1) {
    state.currentDay = col.isoDay
    return state.currentDay
  }

  if (idx === curDayIdx) {
    if (delta > 0 && posInCol > colWidth - margin && idx < state.columnRects.length - 1) {
      state.currentDay = state.columnRects[idx + 1].isoDay
    } else if (delta < 0 && posInCol < margin && idx > 0) {
      state.currentDay = state.columnRects[idx - 1].isoDay
    }
    return state.currentDay
  }

  const commitPx = colWidth * interaction.dragHorizontalCommitZone
  if (idx === curDayIdx + 1) {
    if (posInCol > commitPx) state.currentDay = col.isoDay
    return state.currentDay
  }
  if (idx === curDayIdx - 1) {
    if (posInCol < colWidth - commitPx) state.currentDay = col.isoDay
    return state.currentDay
  }

  state.currentDay = col.isoDay
  return state.currentDay
}

function resolveSnapMinutes(
  clientY: number,
  columnTop: number,
  slotDuration: number,
  dayStartHour: number,
  instanceId: string,
): number {
  const state = getState(instanceId)
  const interaction = getInteractionSettings()
  const dayStartMinutes = dayStartHour * 60
  const slotHeightPx = (HOUR_HEIGHT_PX / 60) * slotDuration
  const yInColumn = clientY - columnTop
  const rawSlotIndex = yInColumn / slotHeightPx
  const slotIndex = Math.floor(rawSlotIndex)
  const posInSlotPx = (rawSlotIndex - slotIndex) * slotHeightPx
  const snappedMinutes = Math.max(dayStartMinutes, dayStartMinutes + slotIndex * slotDuration)

  if (state.currentTimedMinutes == null) {
    state.currentTimedMinutes = snappedMinutes
    state.lastPointerY = clientY
    return state.currentTimedMinutes
  }

  const delta = clientY - state.lastPointerY
  state.lastPointerY = clientY
  if (Math.abs(delta) < interaction.dragVerticalMinDeltaPx) return state.currentTimedMinutes
  if (snappedMinutes === state.currentTimedMinutes) return state.currentTimedMinutes
  const commitPx = Math.max(slotHeightPx * interaction.dragVerticalCommitZone, interaction.dragVerticalMinCommitPx)

  if (snappedMinutes === state.currentTimedMinutes + slotDuration) {
    if (delta > 0 && posInSlotPx > commitPx) state.currentTimedMinutes = snappedMinutes
    return state.currentTimedMinutes
  }
  if (snappedMinutes === state.currentTimedMinutes - slotDuration) {
    if (delta < 0 && posInSlotPx < slotHeightPx - commitPx) state.currentTimedMinutes = snappedMinutes
    return state.currentTimedMinutes
  }

  state.currentTimedMinutes = snappedMinutes
  return state.currentTimedMinutes
}

// ---------------------------------------------------------------------------
// Sidebar drop zone detection
// ---------------------------------------------------------------------------
export function isOverSidebar(clientX: number, clientY: number, instanceId: string): boolean {
  const el = getSidebarDropzoneElement(instanceId)
  if (!el) return false
  const r = el.getBoundingClientRect()
  return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom
}

// ---------------------------------------------------------------------------
// Slot resolution from pointer coordinates
// ---------------------------------------------------------------------------
export function resolveSlotFromPointer(clientX: number, clientY: number, instanceId: string): SlotDropData | null {
  const state = getState(instanceId)

  // All-day row detection
  const allDayEl = getAllDayRowElement(instanceId)
  if (allDayEl) {
    const r = allDayEl.getBoundingClientRect()
    if (clientY >= r.top && clientY <= r.bottom) {
      state.currentTimedMinutes = null
      state.lastPointerY = clientY
      const day = resolveSimpleDay(clientX, instanceId)
      if (day) return { _type: SLOT_TYPE, isoDay: day, hour: 0, minute: 0, isAllDay: true }
    }
  }

  const day = resolveSnapDay(clientX, instanceId)
  if (!day) return null

  const colEl = getDayColumnElement(instanceId, day)
  if (!colEl) return null

  const rect = colEl.getBoundingClientRect()
  const slotDuration = getSlotDuration()
  const dayStart = getDayStartHour()
  const snappedMinutes = resolveSnapMinutes(clientY, rect.top, slotDuration, dayStart, instanceId)
  const hour = Math.floor(snappedMinutes / 60)
  const minute = snappedMinutes % 60
  return { _type: SLOT_TYPE, isoDay: day, hour, minute }
}
