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
  }
}
