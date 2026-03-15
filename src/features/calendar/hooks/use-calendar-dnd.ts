/**
 * Pointer-event-based drag system for the calendar.
 * Replaces HTML5 DnD (which forces an OS-level cursor on Windows)
 * with pointer events so CSS `cursor: grabbing` works everywhere.
 */
import {
  addEvent,
  updateEvent,
  removeEvent,
  setDragState,
  setDragRender,
  clearDragRender,
  updateDragRenderFrame,
  getSlotDuration,
} from '../calendar-store'
import { addMinutes, setHours, setMinutes } from 'date-fns'
import { startOfDay } from '../utils/date'
import { DAY_START_HOUR, HOUR_HEIGHT_PX } from '../constants'
import type { CalendarEvent, EventColor, EventPriority, TaskDragMeta, PersonalDragMeta, EventDragMeta } from '../types'

let idCounter = Date.now()
function nextId() {
  return `evt-${idCounter++}`
}

function roundUpToIncrement(minutes: number, incrementMinutes: number): number {
  const safeMinutes = Number.isFinite(minutes) ? Math.max(minutes, incrementMinutes) : incrementMinutes
  return Math.ceil(safeMinutes / incrementMinutes) * incrementMinutes
}

// -- Drag data discriminators --
const DRAG_TYPE = 'calendar-drag' as const
const SLOT_TYPE = 'calendar-slot' as const

export type CalendarDragData = {
  _type: typeof DRAG_TYPE
  source: 'sidebar' | 'calendar'
  eventId?: string
  title?: string
  color?: EventColor
  durationMinutes?: number
  originalStart?: number
  originalEnd?: number
  isAllDay?: boolean
  priority?: EventPriority
  personalActivityType?: string
  taskMeta?: TaskDragMeta
  personalMeta?: PersonalDragMeta
  eventMeta?: EventDragMeta
  grabOffsetY?: number
}

export type SlotDropData = {
  _type: typeof SLOT_TYPE
  isoDay: string
  hour: number
  minute: number
  isAllDay?: boolean
}

export function isCalendarDrag(data: Record<string, unknown>): data is CalendarDragData {
  return data._type === DRAG_TYPE
}

/** Build drag data for an existing calendar event. */
export function makeEventDragData(event: CalendarEvent): CalendarDragData {
  const slotDuration = getSlotDuration()
  const durationMinutes = Math.max(1, Math.ceil((event.end.getTime() - event.start.getTime()) / 60000))
  const snappedDurationMinutes = roundUpToIncrement(durationMinutes, slotDuration)
  return {
    _type: DRAG_TYPE,
    source: 'calendar',
    eventId: event.id,
    title: event.title,
    color: event.color,
    durationMinutes: event.isAllDay ? 60 : snappedDurationMinutes,
    originalStart: event.start.getTime(),
    originalEnd: event.end.getTime(),
    isAllDay: event.isAllDay,
    priority: event.priority,
    personalActivityType: event.personalActivityType,
    eventMeta: { status: event.status, priority: event.priority },
  }
}

/** Build drag data for a sidebar task. */
export function makeSidebarDragData(
  taskId: string,
  title: string,
  durationMinutes: number,
  priority: EventPriority = 'none',
  meta?: {
    taskMeta?: TaskDragMeta
    personalMeta?: PersonalDragMeta
    color?: EventColor
    personalActivityType?: string
  },
): CalendarDragData {
  const slotDuration = getSlotDuration()
  const snappedDurationMinutes = roundUpToIncrement(durationMinutes, slotDuration)
  return {
    _type: DRAG_TYPE,
    source: 'sidebar',
    eventId: taskId,
    title,
    color: meta?.color ?? 'teal',
    durationMinutes: snappedDurationMinutes,
    priority,
    personalActivityType: meta?.personalActivityType,
    taskMeta: meta?.taskMeta,
    personalMeta: meta?.personalMeta,
  }
}

/** Build drop-target data for a time slot. */
export function makeSlotData(isoDay: string, hour: number, minute: number): SlotDropData {
  return { _type: SLOT_TYPE, isoDay, hour, minute }
}

/** Build drop-target data for an all-day cell. */
export function makeAllDaySlotData(isoDay: string): SlotDropData {
  return { _type: SLOT_TYPE, isoDay, hour: 0, minute: 0, isAllDay: true }
}

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

function cacheColumnRects() {
  const els = document.querySelectorAll<HTMLElement>('[data-date]')
  columnRects = Array.from(els)
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { isoDay: el.dataset.date!, left: r.left, right: r.right }
    })
    .filter((c) => c.right > c.left)
    .sort((a, b) => a.left - b.left)
}

function clearColumnRects() {
  columnRects = []
  currentDay = null
  lastPointerX = 0
}

function resolveSnapDay(clientX: number): string | null {
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
function isOverSidebar(clientX: number, clientY: number): boolean {
  const el = document.querySelector<HTMLElement>('[data-sidebar-dropzone]')
  if (!el) return false
  const r = el.getBoundingClientRect()
  return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom
}

// ---------------------------------------------------------------------------
// Slot resolution from pointer coordinates
// ---------------------------------------------------------------------------
function resolveSlotFromPointer(clientX: number, clientY: number): SlotDropData | null {
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
  const rawMinutes = DAY_START_HOUR * 60 + (yInColumn / HOUR_HEIGHT_PX) * 60
  const snappedMinutes = Math.floor(rawMinutes / slotDuration) * slotDuration
  const clamped = Math.max(DAY_START_HOUR * 60, snappedMinutes)
  const hour = Math.floor(clamped / 60)
  const minute = clamped % 60

  return { _type: SLOT_TYPE, isoDay: day, hour, minute }
}

// ---------------------------------------------------------------------------
// Drop execution (extracted from the old monitor onDrop)
// ---------------------------------------------------------------------------
function executeDrop(drag: CalendarDragData, slot: SlotDropData | null): void {
  if (!slot) return

  const day = new Date(slot.isoDay)
  const isAllDayDrop = Boolean(slot.isAllDay)
  const slotStart = setMinutes(setHours(startOfDay(day), slot.hour), slot.minute)

  const slotDur = getSlotDuration()
  const grabOffsetMin = drag.grabOffsetY != null
    ? Math.round(((drag.grabOffsetY / HOUR_HEIGHT_PX) * 60) / slotDur) * slotDur
    : 0
  const targetStart = addMinutes(slotStart, -grabOffsetMin)

  if (drag.source === 'sidebar') {
    const mins = roundUpToIncrement(drag.durationMinutes ?? 60, slotDur)
    const end = isAllDayDrop ? addMinutes(targetStart, 1440) : addMinutes(targetStart, mins)
    const newEvent: CalendarEvent = {
      id: nextId(),
      title: drag.title ?? 'New Event',
      start: targetStart,
      end,
      isAllDay: isAllDayDrop || mins >= 1440,
      color: drag.color ?? 'teal',
      status: 'pending',
      priority: drag.priority ?? 'none',
      sourceTaskId: drag.eventId,
      personalActivityType: drag.personalActivityType,
    }
    addEvent(newEvent)
  } else if (drag.source === 'calendar' && drag.eventId) {
    const durationMinutes =
      drag.originalStart != null && drag.originalEnd != null
        ? Math.max(1, Math.ceil((drag.originalEnd - drag.originalStart) / 60_000))
        : Math.max(1, drag.durationMinutes ?? 60)
    const snappedDurationMinutes = roundUpToIncrement(durationMinutes, slotDur)
    const timedDurationMinutes = drag.isAllDay ? 60 : snappedDurationMinutes
    const end = isAllDayDrop
      ? addMinutes(targetStart, 1440)
      : addMinutes(targetStart, timedDurationMinutes)
    updateEvent(drag.eventId, {
      start: targetStart,
      end,
      isAllDay: isAllDayDrop,
    })
  }
}

// ---------------------------------------------------------------------------
// Pointer-event drag lifecycle
// ---------------------------------------------------------------------------
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
    const slot = resolveSlotFromPointer(ev.clientX, ev.clientY)

    // Calendar → sidebar: remove the event from the calendar
    if (!slot && dragData.source === 'calendar' && dragData.eventId && isOverSidebar(ev.clientX, ev.clientY)) {
      removeEvent(dragData.eventId)
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
