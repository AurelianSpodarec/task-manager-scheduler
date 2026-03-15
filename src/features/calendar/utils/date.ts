import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMinutes,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  getWeek,
  format,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  differenceInMinutes,
  startOfDay,
} from 'date-fns'
import type { SlotDuration, TimeSlot, WeekStartDay } from '../types'

/** Returns 7 days for the week containing `date`, ordered by `weekStartsOn`. */
export function getWeekDays(date: Date, weekStartsOn: WeekStartDay = 1): Date[] {
  const start = startOfWeek(date, { weekStartsOn })
  return eachDayOfInterval({ start, end: endOfWeek(date, { weekStartsOn }) })
}

/** Returns a 6×7 grid of days for the month view. Pads with adjacent month days. */
export function getMonthGrid(date: Date, weekStartsOn: WeekStartDay = 1): Date[][] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn })

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  // Chunk into weeks of 7
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

export function navigateWeek(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1)
}

export function navigateMonth(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'next' ? addMonths(date, 1) : subMonths(date, 1)
}

/**
 * Snaps a time to the next slot boundary.
 * E.g. 10:22 with 15-min slots → 10:30
 */
export function snapToSlot(date: Date, slotDuration: SlotDuration): Date {
  const hourStart = setMinutes(setHours(startOfDay(date), getHours(date)), 0)
  const minutes = getMinutes(date)
  const snapped = Math.ceil(minutes / slotDuration) * slotDuration
  return addMinutes(hourStart, snapped)
}

/** Converts a pixel Y offset within the day grid to a TimeSlot. */
export function pixelToTimeSlot(y: number, day: Date, hourHeightPx: number): TimeSlot {
  const totalMinutes = Math.max(0, (y / hourHeightPx) * 60)
  const hour = Math.floor(totalMinutes / 60)
  const minute = Math.floor(totalMinutes % 60)
  return { day, hour: Math.min(hour, 23), minute }
}

/** Converts a TimeSlot to a pixel Y offset. */
export function timeSlotToPixel(slot: TimeSlot, hourHeightPx: number): number {
  return ((slot.hour * 60 + slot.minute) / 60) * hourHeightPx
}

/** Pixel offset for a Date within its day's grid. */
export function dateToPixelOffset(date: Date, hourHeightPx: number): number {
  const minutes = getHours(date) * 60 + getMinutes(date)
  return (minutes / 60) * hourHeightPx
}

/** Duration of an event in pixels. */
export function durationToPixelHeight(start: Date, end: Date, hourHeightPx: number): number {
  const mins = differenceInMinutes(end, start)
  return Math.max((mins / 60) * hourHeightPx, 0)
}

export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

export function formatEventTime(date: Date): string {
  return format(date, 'h:mm a')
}

export function formatDateRange(start: Date, end: Date): string {
  return `${format(start, 'MMM dd, yyyy')} – ${format(end, 'MMM dd, yyyy')}`
}

export function formatDayHeader(date: Date): string {
  return format(date, 'dd')
}

export function formatWeekOfYear(date: Date, weekStartsOn: WeekStartDay = 1): string {
  const weekNumber = getWeek(date, { weekStartsOn, firstWeekContainsDate: 1 })
  return `W ${weekNumber}`
}

export { isSameDay, isToday, addDays, startOfDay, getHours, getMinutes, format }
