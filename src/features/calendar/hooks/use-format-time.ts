import { useUse24HourTime, useConfigLocale } from '../config'
import {
  formatHour as _formatHour,
  formatEventTime as _formatEventTime,
  formatDateRange as _formatDateRange,
  formatDayHeader as _formatDayHeader,
  format,
} from '../utils/date'

/** Locale-bound formatters — reads `use24HourTime` and `locale` from the config store. */
export function useFormatTime() {
  const use24h = useUse24HourTime()
  const locale = useConfigLocale()

  return {
    formatHour: (hour: number) => _formatHour(hour, use24h),
    formatEventTime: (date: Date) => _formatEventTime(date, use24h, locale),
    formatRange: (start: Date, end: Date) => _formatDateRange(start, end, locale),
    formatDayHeader: (date: Date) => _formatDayHeader(date, locale),
    formatMonthYear: (date: Date) => format(date, 'MMMM yyyy', { locale }),
    formatFullDate: (date: Date) => format(date, 'MMMM dd, yyyy', { locale }),

    /** Compact week range: "March 1 – 7", "Mar 31 – Apr 6", or with year when needed. */
    formatWeekRange: (weekDays: Date[]) => {
      if (weekDays.length === 0) return ''
      const first = weekDays[0]
      const last = weekDays[weekDays.length - 1]
      const now = new Date()
      const firstYear = first.getFullYear()
      const lastYear = last.getFullYear()
      const currentYear = now.getFullYear()
      const crossYear = firstYear !== lastYear
      const nonCurrentYear = firstYear !== currentYear || lastYear !== currentYear

      if (crossYear) {
        return `${format(first, 'MMM d, yyyy', { locale })} – ${format(last, 'MMM d, yyyy', { locale })}`
      }
      if (nonCurrentYear) {
        const sameMonth = first.getMonth() === last.getMonth()
        if (sameMonth) return `${format(first, 'MMMM d', { locale })} – ${format(last, 'd, yyyy', { locale })}`
        return `${format(first, 'MMM d', { locale })} – ${format(last, 'MMM d, yyyy', { locale })}`
      }
      const sameMonth = first.getMonth() === last.getMonth()
      if (sameMonth) return `${format(first, 'MMMM d', { locale })} – ${format(last, 'd', { locale })}`
      return `${format(first, 'MMM d', { locale })} – ${format(last, 'MMM d', { locale })}`
    },

    /** Month label: "March" (current year) or "March 2026" (different year). */
    formatMonthLabel: (date: Date) => {
      const currentYear = new Date().getFullYear()
      return date.getFullYear() === currentYear
        ? format(date, 'MMMM', { locale })
        : format(date, 'MMMM yyyy', { locale })
    },
  }
}
