import type { ReactNode } from 'react'
import type { Locale } from 'date-fns'
import { enUS } from 'date-fns/locale'
import type { SlotDuration, WorkHoursConfig, WeekStartDay, DragRenderState } from '../types'
import { createStore } from '../stores/create-store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type CalendarEventHandlers = {
  onEventDrop: (eventId: string, start: Date, end: Date, isAllDay: boolean) => void
  onEventMove: (eventId: string, start: Date, end: Date, isAllDay: boolean) => void
  onEventRemove: (eventId: string) => void
  onIconClick?: (eventId: string, e: React.MouseEvent) => void
}

const NOOP_HANDLERS: CalendarEventHandlers = {
  onEventDrop: () => {},
  onEventMove: () => {},
  onEventRemove: () => {},
}

export type CalendarConfig = {
  locale: Locale
  use24HourTime: boolean
  weekStartsOn: WeekStartDay
  visibleDays: number[]
  workHours: WorkHoursConfig
  slotDuration: SlotDuration
  dayStartHour: number
  dayEndHour: number
  visibleStartHour: number
  eventHandlers: CalendarEventHandlers
  /** Consumer-provided floating drag preview. Calendar falls back to a minimal default. */
  renderDragPreview?: (drag: DragRenderState) => ReactNode
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
export const DEFAULT_CONFIG: CalendarConfig = {
  locale: enUS,
  use24HourTime: false,
  weekStartsOn: 1,
  visibleDays: [0, 1, 2, 3, 4, 5, 6],
  workHours: { startHour: 9, endHour: 17, daysOfWeek: [1, 2, 3, 4, 5] },
  slotDuration: 15,
  dayStartHour: 0,
  dayEndHour: 24,
  visibleStartHour: 7,
  eventHandlers: NOOP_HANDLERS,
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
const { getState, setState, useSelector } = createStore<CalendarConfig>({ ...DEFAULT_CONFIG })

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Batch-apply a partial config (e.g. a locale preset). */
export function applyConfig(partial: Partial<CalendarConfig>) {
  setState(partial)
}

export function setWeekStartsOn(day: WeekStartDay) {
  setState({ weekStartsOn: day })
}

export function setSlotDuration(duration: SlotDuration) {
  setState({ slotDuration: duration })
}

export function setWorkHours(config: WorkHoursConfig) {
  setState({ workHours: config })
}

export function setUse24HourTime(enabled: boolean) {
  setState({ use24HourTime: enabled })
}

export function setVisibleDays(days: number[]) {
  setState({ visibleDays: days })
}

// ---------------------------------------------------------------------------
// Non-hook getters (for use outside React — dnd, geometry, etc.)
// ---------------------------------------------------------------------------
export function getSlotDuration(): SlotDuration {
  return getState().slotDuration
}

export function getDayStartHour(): number {
  return getState().dayStartHour
}

export function getDayEndHour(): number {
  return getState().dayEndHour
}

export function getVisibleStartHour(): number {
  return getState().visibleStartHour
}

export function getConfig(): CalendarConfig {
  return getState()
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export function useConfigLocale(): Locale {
  return useSelector((s) => s.locale)
}

export function useUse24HourTime(): boolean {
  return useSelector((s) => s.use24HourTime)
}

export function useWeekStartsOn(): WeekStartDay {
  return useSelector((s) => s.weekStartsOn)
}

export function useVisibleDays(): number[] {
  return useSelector((s) => s.visibleDays)
}

export function useWorkHours(): WorkHoursConfig {
  return useSelector((s) => s.workHours)
}

export function useSlotDuration(): SlotDuration {
  return useSelector((s) => s.slotDuration)
}

export function useDayStartHour(): number {
  return useSelector((s) => s.dayStartHour)
}

export function useDayEndHour(): number {
  return useSelector((s) => s.dayEndHour)
}

export function useVisibleStartHour(): number {
  return useSelector((s) => s.visibleStartHour)
}
