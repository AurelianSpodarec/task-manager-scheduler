import type { ComponentType, CSSProperties } from 'react'
import { addMinutes, setHours, setMinutes } from 'date-fns'
import { HOUR_HEIGHT_PX } from '../../constants'
import { startOfDay, addDays, dateToPixelOffset, durationToPixelHeight } from '../../utils/date'
import { computeGrabOffsetMinutes } from '../../dnd/offset'
import type { DragRenderState } from '../../types'

export type ProjectedCard = {
  title: string
  start: Date
  end: Date
  top: number
  height: number
  className?: string
  style?: CSSProperties
  icon?: ComponentType<{ className?: string; animate?: boolean }>
}

export function getProjectedCard(
  dragRender: DragRenderState | null,
  isoDay: string,
  slotDuration: number,
): ProjectedCard | null {
  if (!dragRender?.slot) return null
  if (dragRender.slot.isAllDay) return null

  const slotDay = new Date(dragRender.slot.isoDay)
  const slotStart = setMinutes(setHours(startOfDay(slotDay), dragRender.slot.hour), dragRender.slot.minute)
  const durationMinutes = dragRender.durationMinutes ?? 60

  const grabOffsetMin = computeGrabOffsetMinutes(
    dragRender.source,
    dragRender.pointerOffset.y,
    dragRender.elementSize.height,
    durationMinutes,
    slotDuration,
  )
  const start = addMinutes(slotStart, -grabOffsetMin)
  const end = addMinutes(start, durationMinutes)

  // Clamp to this column's day bounds — applies to both primary and spillover
  const colDay = new Date(isoDay)
  const colStart = startOfDay(colDay)
  const colEnd = addDays(colStart, 1)
  if (start >= colEnd || end <= colStart) return null

  const visStart = start < colStart ? colStart : start
  const visEnd = end > colEnd ? colEnd : end

  return {
    title: dragRender.title ?? 'New Event',
    start: visStart,
    end: visEnd,
    top: dateToPixelOffset(visStart, HOUR_HEIGHT_PX),
    height: durationToPixelHeight(visStart, visEnd, HOUR_HEIGHT_PX),
    className: dragRender.className,
    style: dragRender.style,
    icon: dragRender.icon,
  }
}
