import type { ReactNode } from 'react'
import type { Locale } from 'date-fns'
import { enUS } from 'date-fns/locale'
import type { SlotDuration, WorkHoursConfig, WeekStartDay, DragRenderState } from '../types'
import { createStore } from '../stores/create-store'
import {
  MOUSE_AWAY_RADIUS_PX,
  DRAG_HORIZONTAL_ADVANCE_ZONE,
  DRAG_HORIZONTAL_COMMIT_ZONE,
  DRAG_HORIZONTAL_MIN_DELTA_PX,
  DRAG_VERTICAL_COMMIT_ZONE,
  DRAG_VERTICAL_MIN_DELTA_PX,
  DRAG_VERTICAL_MIN_COMMIT_PX,
} from './interaction-settings'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type CalendarEventHandlers = {
  onEventDrop: (eventId: string, start: Date, end: Date, isAllDay: boolean) => void
  onEventMove: (eventId: string, start: Date, end: Date, isAllDay: boolean) => void
  onEventRemove: (eventId: string) => void
  onIconClick?: (eventId: string, e: React.MouseEvent) => void
}

export type CalendarInteractionConfig = {
  mouseAwayRadiusPx: number
  dragHorizontalAdvanceZone: number
  dragHorizontalCommitZone: number
  dragHorizontalMinDeltaPx: number
  dragVerticalCommitZone: number
  dragVerticalMinDeltaPx: number
  dragVerticalMinCommitPx: number
}

export type CalendarConfigUpdate = Omit<Partial<CalendarConfig>, 'interaction'> & {
  interaction?: Partial<CalendarInteractionConfig>
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
  interaction: CalendarInteractionConfig
  eventHandlers: CalendarEventHandlers
  /** Consumer-provided floating drag preview. Calendar falls back to a minimal default. */
  renderDragPreview?: (drag: DragRenderState) => ReactNode
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
const DEFAULT_INTERACTION: CalendarInteractionConfig = {
  mouseAwayRadiusPx: MOUSE_AWAY_RADIUS_PX,
  dragHorizontalAdvanceZone: DRAG_HORIZONTAL_ADVANCE_ZONE,
  dragHorizontalCommitZone: DRAG_HORIZONTAL_COMMIT_ZONE,
  dragHorizontalMinDeltaPx: DRAG_HORIZONTAL_MIN_DELTA_PX,
  dragVerticalCommitZone: DRAG_VERTICAL_COMMIT_ZONE,
  dragVerticalMinDeltaPx: DRAG_VERTICAL_MIN_DELTA_PX,
  dragVerticalMinCommitPx: DRAG_VERTICAL_MIN_COMMIT_PX,
}
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
  interaction: DEFAULT_INTERACTION,
  eventHandlers: NOOP_HANDLERS,
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
const { getState, setState, useSelector } = createStore<CalendarConfig>({ ...DEFAULT_CONFIG })

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function sanitizeInteractionConfig(interaction: CalendarInteractionConfig): CalendarInteractionConfig {
  const advance = clamp(interaction.dragHorizontalAdvanceZone, 0.01, 0.49)
  return {
    mouseAwayRadiusPx: clamp(Math.round(interaction.mouseAwayRadiusPx), 25, 2000),
    dragHorizontalAdvanceZone: advance,
    dragHorizontalCommitZone: clamp(interaction.dragHorizontalCommitZone, advance, 0.49),
    dragHorizontalMinDeltaPx: clamp(Math.round(interaction.dragHorizontalMinDeltaPx), 0, 64),
    dragVerticalCommitZone: clamp(interaction.dragVerticalCommitZone, 0.01, 0.49),
    dragVerticalMinDeltaPx: clamp(Math.round(interaction.dragVerticalMinDeltaPx), 0, 64),
    dragVerticalMinCommitPx: clamp(Math.round(interaction.dragVerticalMinCommitPx), 0, 64),
  }
}

/** Batch-apply a partial config (e.g. a locale preset). */
export function applyConfig(partial: CalendarConfigUpdate) {
  if (partial.interaction) {
    const mergedInteraction = sanitizeInteractionConfig({
      ...getState().interaction,
      ...partial.interaction,
    })
    const rest = { ...partial }
    delete rest.interaction
    setState({ ...(rest as Partial<CalendarConfig>), interaction: mergedInteraction })
    return
  }
  setState(partial as Partial<CalendarConfig>)
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

export function setInteractionSettings(partial: Partial<CalendarInteractionConfig>) {
  const current = getState().interaction
  const next = sanitizeInteractionConfig({ ...current, ...partial })
  setState({ interaction: next })
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

export function getInteractionSettings(): CalendarInteractionConfig {
  return getState().interaction
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

export function useInteractionSettings(): CalendarInteractionConfig {
  return useSelector((s) => s.interaction)
}
