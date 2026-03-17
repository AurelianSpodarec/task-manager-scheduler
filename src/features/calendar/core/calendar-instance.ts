import { createContext, useContext } from 'react'

export const DEFAULT_CALENDAR_INSTANCE_ID = 'calendar-default'

export const CalendarInstanceContext = createContext<string>(DEFAULT_CALENDAR_INSTANCE_ID)

export function useCalendarInstanceId(): string {
  return useContext(CalendarInstanceContext)
}
