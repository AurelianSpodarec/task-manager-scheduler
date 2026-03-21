import { getSlotDuration } from '@/features/calendar'

/** Round a duration up to the nearest calendar slot boundary. */
export function roundUpDurationMinutes(minutes: number): number {
  const slot = getSlotDuration()
  const safeMinutes = Number.isFinite(minutes) ? Math.max(minutes, slot) : 60
  return Math.ceil(safeMinutes / slot) * slot
}

export function formatDurationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}:${String(remainingMinutes).padStart(2, '0')}h`
}
