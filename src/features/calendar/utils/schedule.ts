import { format as formatDateFns } from 'date-fns'
import type { CalendarEvent, EventColor, SlotDuration } from '../types'
import type { DateStringValue, DateTimeStringValue, ScheduleEventData } from '../types'

const KNOWN_EVENT_COLORS: EventColor[] = ['teal', 'purple', 'rose', 'amber', 'emerald', 'indigo', 'blue']

function hasKnownEventColor(value: string): value is EventColor {
  return KNOWN_EVENT_COLORS.includes(value as EventColor)
}

export function normalizeEventColor(color: string): EventColor {
  return hasKnownEventColor(color) ? color : 'teal'
}

export function toDate(value: Date | string): Date {
  if (value instanceof Date) return value
  // Supports `YYYY-MM-DD` and `YYYY-MM-DD HH:mm:ss`.
  const normalized = value.includes(' ') ? value.replace(' ', 'T') : `${value}T00:00:00`
  return new Date(normalized)
}

export function formatDateValue(date: Date): DateStringValue {
  return formatDateFns(date, 'yyyy-MM-dd')
}

export function formatDateTimeValue(date: Date): DateTimeStringValue {
  return formatDateFns(date, 'yyyy-MM-dd HH:mm:ss')
}

export function inferIsAllDay(start: Date, end: Date): boolean {
  const startMidnight = start.getHours() === 0 && start.getMinutes() === 0 && start.getSeconds() === 0
  const endMidnight = end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0
  const fullDayMs = 24 * 60 * 60 * 1000
  const durationMs = end.getTime() - start.getTime()
  return startMidnight && endMidnight && durationMs >= fullDayMs
}

export function toCalendarEvent(event: ScheduleEventData): CalendarEvent {
  const start = toDate(event.start)
  const end = toDate(event.end)
  return {
    id: String(event.id),
    sourceId: event.id,
    title: event.title,
    start,
    end,
    isAllDay: event.isAllDay ?? inferIsAllDay(start, end),
    color: normalizeEventColor(String(event.color)),
    className: event.className,
    style: event.style,
    icon: event.icon,
    display: event.display,
    variant: event.variant,
    payload: event.payload,
  }
}

export function toScheduleEvent(event: CalendarEvent): ScheduleEventData {
  return {
    id: event.sourceId ?? event.id,
    title: event.title,
    start: formatDateTimeValue(event.start),
    end: formatDateTimeValue(event.end),
    color: event.color,
    display: event.display,
    variant: event.variant,
    isAllDay: event.isAllDay,
    payload: event.payload,
    className: event.className,
    style: event.style,
    icon: event.icon,
  }
}

export function toNearestSlotDuration(value: number | undefined): SlotDuration | undefined {
  if (value == null || Number.isNaN(value)) return undefined
  if (value <= 22) return 15
  if (value <= 45) return 30
  return 60
}

type ParsedTime = { hours: number; minutes: number; seconds: number }

function parseTime(value: string | undefined): ParsedTime | null {
  if (!value) return null
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim())
  if (!match) return null
  const hours = Math.max(0, Math.min(23, Number(match[1])))
  const minutes = Math.max(0, Math.min(59, Number(match[2])))
  const seconds = Math.max(0, Math.min(59, Number(match[3] ?? '0')))
  return { hours, minutes, seconds }
}

export function timeStringToHour(value: string | undefined, fallback: number): number {
  const parsed = parseTime(value)
  if (!parsed) return fallback
  if (parsed.hours === 23 && parsed.minutes === 59 && parsed.seconds === 59) return 24
  return parsed.hours
}

export function resolveVisibleDays(
  withWeekendDays: boolean | undefined,
  weekendDays: number[] | undefined,
): number[] | undefined {
  if (withWeekendDays == null && weekendDays == null) return undefined
  if (withWeekendDays !== false) return [0, 1, 2, 3, 4, 5, 6]
  const hidden = new Set<number>(weekendDays ?? [0, 6])
  return [0, 1, 2, 3, 4, 5, 6].filter((d) => !hidden.has(d))
}
