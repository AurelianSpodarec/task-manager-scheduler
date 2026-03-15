import { useEventsForDay } from '../stores/event-store'
import { useVisibleDays, useWorkHours } from '../config'
import { isToday } from '../utils/date'
import { layoutEventsForDay } from '../utils/layout'
import { HOUR_HEIGHT_PX } from '../constants'
import type { CalendarEvent, EventLayoutRect } from '../types'

type DayInfo = {
  isToday: boolean
  isVisible: boolean
  isWorkDay: boolean
  events: CalendarEvent[]
  layouts: EventLayoutRect[]
  isoDate: string
}

/** Composable hook that returns derived day-level data for a given date. */
export function useDay(day: Date): DayInfo {
  const events = useEventsForDay(day)
  const visibleDays = useVisibleDays()
  const workHours = useWorkHours()
  const layouts = layoutEventsForDay(events, day, HOUR_HEIGHT_PX)
  const dayOfWeek = day.getDay()

  return {
    isToday: isToday(day),
    isVisible: visibleDays.includes(dayOfWeek),
    isWorkDay: workHours.daysOfWeek.includes(dayOfWeek),
    events,
    layouts,
    isoDate: day.toISOString().split('T')[0],
  }
}
