import { enUS, enGB } from 'date-fns/locale'
import type { CalendarConfig } from './calendar-config'

/** US defaults — Sunday start, 12h time, full week */
export const US_CONFIG: Partial<CalendarConfig> = {
  locale: enUS,
  use24HourTime: false,
  weekStartsOn: 0,
  visibleDays: [0, 1, 2, 3, 4, 5, 6],
}

/** UK defaults — Monday start, 24h time, full week */
export const GB_CONFIG: Partial<CalendarConfig> = {
  locale: enGB,
  use24HourTime: true,
  weekStartsOn: 1,
  visibleDays: [0, 1, 2, 3, 4, 5, 6],
}

/** Workweek only — hides weekends */
export const WORKWEEK_CONFIG: Partial<CalendarConfig> = {
  visibleDays: [1, 2, 3, 4, 5],
}
