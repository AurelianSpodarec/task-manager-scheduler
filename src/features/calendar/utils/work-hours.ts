import type { WorkHoursConfig } from '../types'

/** Pure check — slot falls within configured work hours for the given day */
export function isWithinWorkHours(
  dayOfWeek: number,
  hour: number,
  config: WorkHoursConfig,
): boolean {
  if (!config.daysOfWeek.includes(dayOfWeek)) return false
  return hour >= config.startHour && hour < config.endHour
}
