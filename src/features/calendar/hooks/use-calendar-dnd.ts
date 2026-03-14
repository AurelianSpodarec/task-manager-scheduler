/**
 * Pragmatic drag-and-drop integration for the calendar.
 * Uses @atlaskit/pragmatic-drag-and-drop — React 19 + Compiler safe.
 */
import { useEffect } from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { preventUnhandled } from '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled'
import {
  addEvent,
  updateEvent,
  setDragState,
  setDragRender,
  clearDragRender,
  updateDragRenderFrame,
  getSlotDuration,
} from '../calendar-store'
import { addMinutes, setHours, setMinutes } from 'date-fns'
import { startOfDay } from '../utils/date'
import { HOUR_HEIGHT_PX } from '../constants'
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

function isSlotTarget(data: Record<string, unknown>): data is SlotDropData {
  return data._type === SLOT_TYPE
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

function extractSlotTarget(dropTargets: Array<{ data: unknown }>): SlotDropData | null {
  for (const target of dropTargets) {
    const data = target.data
    if (data && typeof data === 'object' && isSlotTarget(data as Record<string, unknown>)) {
      return data as SlotDropData
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Direction-aware day-column snapping
// Snaps to adjacent column ~20% before the pointer crosses the boundary,
// with hysteresis to prevent flicker on direction reversal.
// ---------------------------------------------------------------------------
type ColumnRect = { isoDay: string; left: number; right: number }
let columnRects: ColumnRect[] = []
let currentDay: string | null = null
let lastPointerX = 0

const ADVANCE_ZONE = 0.13  // snap ahead when within 13% of the leading edge
const COMMIT_ZONE = 0.35   // commit to new column once 35% past the entry side
const MIN_DELTA = 2         // ignore sub-pixel jitter

function cacheColumnRects() {
  const els = document.querySelectorAll<HTMLElement>('[data-date]')
  columnRects = Array.from(els)
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { isoDay: el.dataset.date!, left: r.left, right: r.right }
    })
    .filter((c) => c.right > c.left)   // drop hidden (zero-width) columns
    .sort((a, b) => a.left - b.left)   // guarantee visual left-to-right order
}

function clearColumnRects() {
  columnRects = []
  currentDay = null
  lastPointerX = 0
}

/**
 * Resolve target day column using direction-aware advance zones.
 *
 * Same column:    snap ahead when near the leading edge in the movement direction.
 * Adjacent column: only commit once the pointer is past COMMIT_ZONE from the
 *                  entry side — prevents immediate snap-back after crossing.
 * Non-adjacent:   fast mouse movement skipped columns — commit immediately.
 */
function resolveSnapDay(clientX: number): string | null {
  if (columnRects.length === 0) return null

  const delta = clientX - lastPointerX
  lastPointerX = clientX

  // Find the column the pointer is physically inside
  let idx = -1
  for (let i = 0; i < columnRects.length; i++) {
    if (clientX >= columnRects[i].left && clientX < columnRects[i].right) {
      idx = i
      break
    }
  }
  if (idx === -1) return currentDay

  // First contact — initialise without advance logic
  if (!currentDay) {
    currentDay = columnRects[idx].isoDay
    return currentDay
  }

  // Suppress micro-jitter
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

  // --- Same column as current snap ---
  if (idx === curDayIdx) {
    if (delta > 0 && posInCol > colWidth - margin && idx < columnRects.length - 1) {
      currentDay = columnRects[idx + 1].isoDay
    } else if (delta < 0 && posInCol < margin && idx > 0) {
      currentDay = columnRects[idx - 1].isoDay
    }
    return currentDay
  }

  // --- Adjacent column (crossed boundary) ---
  const commitPx = colWidth * COMMIT_ZONE
  if (idx === curDayIdx + 1) {
    // Entered from left — commit once past 40% from left edge
    if (posInCol > commitPx) currentDay = col.isoDay
    return currentDay
  }
  if (idx === curDayIdx - 1) {
    // Entered from right — commit once past 40% from right edge
    if (posInCol < colWidth - commitPx) currentDay = col.isoDay
    return currentDay
  }

  // --- Non-adjacent (fast movement) — commit immediately ---
  currentDay = col.isoDay
  return currentDay
}

function applyDayOverride(slot: SlotDropData | null, clientX: number): SlotDropData | null {
  if (!slot) return null
  const resolved = resolveSnapDay(clientX)
  if (!resolved || resolved === slot.isoDay) return slot
  return { ...slot, isoDay: resolved }
}

/**
 * Global drop monitor — wire up once in a component wrapping the calendar + sidebar.
 * Handles sidebar→calendar creation and calendar→calendar moves.
 */
export function useCalendarDropMonitor() {
  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => isCalendarDrag(source.data),


      onDragStart: ({ source, location }) => {
        const d = source.data as CalendarDragData
        setDragState({ source: d.source, eventId: d.eventId, title: d.title })
        document.body.classList.add('cal-dragging')
        preventUnhandled.start()

        const rect = source.element.getBoundingClientRect()
        const input = location.initial.input
        const slot = extractSlotTarget(location.current.dropTargets)

        cacheColumnRects()

        setDragRender({
          source: d.source,
          eventId: d.eventId,
          title: d.title,
          color: d.color ?? 'teal',
          durationMinutes: d.durationMinutes,
          originalStart: d.originalStart,
          originalEnd: d.originalEnd,
          personalActivityType: d.personalActivityType,
          pointer: {
            clientX: input.clientX,
            clientY: input.clientY,
          },
          pointerOffset: {
            x: Math.max(0, Math.min(rect.width, input.clientX - rect.left)),
            y: Math.max(0, Math.min(rect.height, input.clientY - rect.top)),
          },
          elementSize: {
            width: rect.width,
            height: rect.height,
          },
          slot,
          taskMeta: d.taskMeta,
          personalMeta: d.personalMeta,
          eventMeta: d.eventMeta,
        })
      },

      onDrag: ({ location }) => {
        const input = location.current.input
        const rawSlot = extractSlotTarget(location.current.dropTargets)
        const slot = applyDayOverride(rawSlot, input.clientX)
        updateDragRenderFrame(
          {
            clientX: input.clientX,
            clientY: input.clientY,
          },
          slot,
        )
      },

      onDrop: ({ source, location }) => {
        setDragState(null)
        clearDragRender()
        document.body.classList.remove('cal-dragging')
        preventUnhandled.stop()

        const rawSlot = extractSlotTarget(location.current.dropTargets)
        const slot = applyDayOverride(rawSlot, location.current.input.clientX)
        clearColumnRects()
        if (!slot) return

        const drag = source.data as CalendarDragData
        const day = new Date(slot.isoDay)
        const isAllDayDrop = Boolean(slot.isAllDay)
        const slotStart = setMinutes(setHours(startOfDay(day), slot.hour), slot.minute)

        // Snap grab offset so the event lands on a slot boundary
        const slotDur = getSlotDuration()
        const grabOffsetMin = drag.source === 'calendar' && drag.grabOffsetY != null
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
      },
    })
  }, [])
}
