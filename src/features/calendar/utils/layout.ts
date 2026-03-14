import type { CalendarEvent, EventLayoutRect } from '../types'
import { HOUR_HEIGHT_PX } from '../constants'
import { dateToPixelOffset, durationToPixelHeight } from './date'

/**
 * Column-packing layout: assigns each overlapping event a column index and
 * total column count so they can share the day-column width without hiding
 * each other. Similar to how Google Calendar handles overlap.
 *
 * Algorithm:
 * 1. Sort events by start time (then by duration descending for ties).
 * 2. Walk through events, tracking "active" columns whose last event hasn't ended yet.
 * 3. Place each event in the first available column.
 * 4. After grouping, normalize totalColumns per connected overlap group.
 */
export function layoutEventsForDay(
  events: CalendarEvent[],
  hourHeightPx = HOUR_HEIGHT_PX,
): EventLayoutRect[] {
  if (events.length === 0) return []

  // Only layout timed events (all-day events are handled separately)
  const timed = events
    .filter((e) => !e.isAllDay)
    .sort((a, b) => {
      const diff = a.start.getTime() - b.start.getTime()
      if (diff !== 0) return diff
      // Longer events first when starting at same time
      return b.end.getTime() - b.start.getTime() - (a.end.getTime() - a.start.getTime())
    })

  if (timed.length === 0) return []

  // Build overlap groups: events that transitively overlap share a group
  const groups: CalendarEvent[][] = []
  let currentGroup: CalendarEvent[] = [timed[0]]
  let groupEnd = timed[0].end.getTime()

  for (let i = 1; i < timed.length; i++) {
    const event = timed[i]
    if (event.start.getTime() < groupEnd) {
      currentGroup.push(event)
      groupEnd = Math.max(groupEnd, event.end.getTime())
    } else {
      groups.push(currentGroup)
      currentGroup = [event]
      groupEnd = event.end.getTime()
    }
  }
  groups.push(currentGroup)

  // Assign columns within each group
  const rects: EventLayoutRect[] = []

  for (const group of groups) {
    // columns[i] = end time of the last event placed in column i
    const columns: number[] = []

    const assignments: { event: CalendarEvent; column: number }[] = []

    for (const event of group) {
      let placed = false
      for (let col = 0; col < columns.length; col++) {
        if (event.start.getTime() >= columns[col]) {
          columns[col] = event.end.getTime()
          assignments.push({ event, column: col })
          placed = true
          break
        }
      }
      if (!placed) {
        columns.push(event.end.getTime())
        assignments.push({ event, column: columns.length - 1 })
      }
    }

    const totalColumns = columns.length

    for (const { event, column } of assignments) {
      rects.push({
        event,
        column,
        totalColumns,
        top: dateToPixelOffset(event.start, hourHeightPx),
        height: durationToPixelHeight(event.start, event.end, hourHeightPx),
      })
    }
  }

  return rects
}
