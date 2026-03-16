import { HOUR_HEIGHT_PX } from '../constants'

/**
 * Convert a pixel offset within the day grid to slot-snapped minutes.
 * Shared by drop-handler (from grabOffsetY) and projected-ghost-card (from pointerOffset.y).
 */
export function pixelOffsetToSnappedMinutes(offsetPx: number, slotDuration: number): number {
  return Math.round(((offsetPx / HOUR_HEIGHT_PX) * 60) / slotDuration) * slotDuration
}

/**
 * Compute the grab offset in slot-snapped minutes based on drag source.
 * Calendar drags: offset is a direct pixel measurement in the grid.
 * Sidebar drags: offset is a fraction of the source element mapped to the event duration.
 */
export function computeGrabOffsetMinutes(
  source: 'calendar' | 'sidebar',
  pointerOffsetY: number,
  elementHeight: number,
  durationMinutes: number,
  slotDuration: number,
): number {
  if (source === 'calendar') {
    return pixelOffsetToSnappedMinutes(pointerOffsetY, slotDuration)
  }
  const fraction = elementHeight > 0 ? pointerOffsetY / elementHeight : 0
  return Math.round((fraction * durationMinutes) / slotDuration) * slotDuration
}
