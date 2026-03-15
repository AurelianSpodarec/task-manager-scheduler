import { useWorkHours } from '../config'
import { isWithinWorkHours } from '../utils/work-hours'
import { useCurrentTime } from './use-current-time'
import { getHours } from '../utils/date'

type TimeSlotInfo = {
  isWorkHours: boolean
  isOffHours: boolean
  isCurrentHour: boolean
}

/** Returns work-hour and current-hour flags for a given day + hour. */
export function useTimeSlot(day: Date, hour: number): TimeSlotInfo {
  const workHours = useWorkHours()
  const now = useCurrentTime()
  const dayOfWeek = day.getDay()
  const isWork = isWithinWorkHours(dayOfWeek, hour, workHours)
  const nowDay = now.getDay()
  const nowHour = getHours(now)

  return {
    isWorkHours: isWork,
    isOffHours: !isWork,
    isCurrentHour: dayOfWeek === nowDay && hour === nowHour,
  }
}
