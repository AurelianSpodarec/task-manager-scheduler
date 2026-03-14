/**
 * Pragmatic drag-and-drop integration for the calendar.
 * Uses @atlaskit/pragmatic-drag-and-drop — React 19 + Compiler safe.
 */
import { useEffect } from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { addEvent, updateEvent, setDragState } from '../calendar-store'
import { addMinutes, setHours, setMinutes } from 'date-fns'
import { startOfDay } from '../utils/date'
import type { CalendarEvent } from '../types'

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
  durationMinutes?: number
  originalStart?: number
  originalEnd?: number
}

export type SlotDropData = {
  _type: typeof SLOT_TYPE
  isoDay: string
  hour: number
  minute: number
}

export function isCalendarDrag(data: Record<string, unknown>): data is CalendarDragData {
  return data._type === DRAG_TYPE
}

function isSlotTarget(data: Record<string, unknown>): data is SlotDropData {
  return data._type === SLOT_TYPE
}

/** Build drag data for an existing calendar event. */
export function makeEventDragData(event: CalendarEvent): CalendarDragData {
  return {
    _type: DRAG_TYPE,
    source: 'calendar',
    eventId: event.id,
    title: event.title,
    originalStart: event.start.getTime(),
    originalEnd: event.end.getTime(),
  }
}

/** Build drag data for a sidebar task. */
export function makeSidebarDragData(
  taskId: string,
  title: string,
  durationMinutes: number,
): CalendarDragData {
  return { _type: DRAG_TYPE, source: 'sidebar', eventId: taskId, title, durationMinutes }
}

/** Build drop-target data for a time slot. */
export function makeSlotData(isoDay: string, hour: number, minute: number): SlotDropData {
  return { _type: SLOT_TYPE, isoDay, hour, minute }
}

/**
 * Global drop monitor — wire up once in a component wrapping the calendar + sidebar.
 * Handles sidebar→calendar creation and calendar→calendar moves.
 */
export function useCalendarDropMonitor() {
  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => isCalendarDrag(source.data),

      onDragStart: ({ source }) => {
        const d = source.data as CalendarDragData
        setDragState({ source: d.source, eventId: d.eventId, title: d.title })
      },

      onDrop: ({ source, location }) => {
        setDragState(null)

        const target = location.current.dropTargets[0]
        if (!target || !isSlotTarget(target.data)) return

        const drag = source.data as CalendarDragData
        const slot = target.data
        const day = new Date(slot.isoDay)
        const targetStart = setMinutes(setHours(startOfDay(day), slot.hour), slot.minute)

        if (drag.source === 'sidebar') {
          const mins = drag.durationMinutes ?? 60
          const newEvent: CalendarEvent = {
            id: nextId(),
            title: drag.title ?? 'New Event',
            start: targetStart,
            end: addMinutes(targetStart, mins),
            isAllDay: mins >= 1440,
            color: 'teal',
            status: 'pending',
            sourceTaskId: drag.eventId,
          }
          addEvent(newEvent)
        } else if (drag.source === 'calendar' && drag.eventId && drag.originalStart && drag.originalEnd) {
          const durationMs = drag.originalEnd - drag.originalStart
          updateEvent(drag.eventId, {
            start: targetStart,
            end: new Date(targetStart.getTime() + durationMs),
          })
        }
      },
    })
  }, [])
}
