import type { ComponentType, CSSProperties } from 'react'
import type { EventColor } from './calendar'

export type DragSource = 'sidebar' | 'calendar'

export type DragPayload = {
  source: DragSource
  eventId?: string
  title?: string
  /** For sidebar drags: duration in minutes to create the new event */
  durationMinutes?: number
  /** Original event data snapshot for reverting on cancel */
  originalEvent?: import('./calendar').CalendarEvent
}

export type DragSlotCandidate = {
  isoDay: string
  hour: number
  minute: number
  isAllDay?: boolean
}

export type DragPointer = {
  clientX: number
  clientY: number
}

/** Render state for the active drag — drives ghost cards and the floating preview. */
export type DragRenderState = {
  source: DragSource
  eventId?: string
  title?: string
  color: EventColor
  durationMinutes?: number
  originalStart?: number
  originalEnd?: number
  pointer: DragPointer
  pointerOffset: { x: number; y: number }
  elementSize: { width: number; height: number }
  slot: DragSlotCandidate | null
  sidebarDropHovered: boolean
  /** Consumer-provided CSS classes for the dragged event */
  className?: string
  /** Consumer-provided inline styles for the dragged event */
  style?: CSSProperties
  /** Consumer-provided icon component for the dragged event */
  icon?: ComponentType<{ className?: string }>
  /** Opaque consumer data — passed through to renderDragPreview */
  dragMeta?: unknown
}
