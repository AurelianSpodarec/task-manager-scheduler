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
  const durationMinutes = Math.max(1, Math.round((event.end.getTime() - event.start.getTime()) / 60000))
  return {
    _type: DRAG_TYPE,
    source: 'calendar',
    eventId: event.id,
    title: event.title,
    color: event.color,
    durationMinutes: event.isAllDay ? 60 : durationMinutes,
    originalStart: event.start.getTime(),
    originalEnd: event.end.getTime(),
    isAllDay: event.isAllDay,
    priority: event.priority,
    eventMeta: { status: event.status, priority: event.priority },
  }
}

/** Build drag data for a sidebar task. */
export function makeSidebarDragData(
  taskId: string,
  title: string,
  durationMinutes: number,
  priority: EventPriority = 'none',
  meta?: { taskMeta?: TaskDragMeta; personalMeta?: PersonalDragMeta },
): CalendarDragData {
  return {
    _type: DRAG_TYPE,
    source: 'sidebar',
    eventId: taskId,
    title,
    color: 'teal',
    durationMinutes,
    priority,
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

        setDragRender({
          source: d.source,
          eventId: d.eventId,
          title: d.title,
          color: d.color ?? 'teal',
          durationMinutes: d.durationMinutes,
          originalStart: d.originalStart,
          originalEnd: d.originalEnd,
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
        const slot = extractSlotTarget(location.current.dropTargets)
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

        const slot = extractSlotTarget(location.current.dropTargets)
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
          const mins = drag.durationMinutes ?? 60
          const end = isAllDayDrop ? addMinutes(targetStart, 1440) : addMinutes(targetStart, mins)
          const newEvent: CalendarEvent = {
            id: nextId(),
            title: drag.title ?? 'New Event',
            start: targetStart,
            end,
            isAllDay: isAllDayDrop || mins >= 1440,
            color: 'teal',
            status: 'pending',
            priority: drag.priority ?? 'none',
            sourceTaskId: drag.eventId,
          }
          addEvent(newEvent)
        } else if (drag.source === 'calendar' && drag.eventId) {
          const durationMs =
            drag.originalStart != null && drag.originalEnd != null
              ? Math.max(60_000, drag.originalEnd - drag.originalStart)
              : Math.max(1, drag.durationMinutes ?? 60) * 60_000
          const timedDurationMs = drag.isAllDay ? 60 * 60_000 : durationMs
          const end = isAllDayDrop
            ? addMinutes(targetStart, 1440)
            : new Date(targetStart.getTime() + timedDurationMs)
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
