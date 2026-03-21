import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import type { Locale } from 'date-fns'
import { enUS } from 'date-fns/locale'
import type {
  CalendarEvent,
  ScheduleMode,
  SlotDuration,
  WorkHoursConfig,
  WeekStartDay,
  DragRenderState,
} from '../types'
import type { DragPointer } from '../types'
import type { CalendarDragData, SlotDropData } from '../dnd/types'
import { createStore } from '../stores/create-store'
import { loadSettings, saveSettings, type SidebarPosition } from './persistence'
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

export type CalendarDragMonitors = {
  onDragStart?: (drag: DragRenderState) => void
  onDragMove?: (payload: { pointer: DragPointer; slot: SlotDropData | null; overSidebar: boolean }) => void
  onDragDrop?: (payload: { dragData: CalendarDragData; slot: SlotDropData | null; overSidebar: boolean }) => void
  onDragEnd?: () => void
}

export type CalendarRenderEventBody = (event: CalendarEvent) => ReactNode

export type CalendarRenderEvent = (
  event: CalendarEvent,
  props: ComponentPropsWithoutRef<'button'> & { children: ReactNode },
) => ReactNode

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
  mode: ScheduleMode
  weekStartsOn: WeekStartDay
  visibleDays: number[]
  workHours: WorkHoursConfig
  slotDuration: SlotDuration
  dayStartHour: number
  dayEndHour: number
  visibleStartHour: number
  sidebarPosition: SidebarPosition
  withEventsDragAndDrop: boolean
  withHeader: boolean
  withAllDaySlot: boolean
  withCurrentTimeIndicator: boolean
  interaction: CalendarInteractionConfig
  dragMonitors: CalendarDragMonitors
  eventHandlers: CalendarEventHandlers
  /** Optional event array override used by the public Schedule facade. */
  events?: CalendarEvent[]
  /** HTML5 external drop hook (e.g. sidebar/native draggables). */
  onExternalEventDrop?: (dataTransfer: DataTransfer, dropDateTime: string) => void
  /** Called when an event card is clicked. */
  onEventClick?: (event: CalendarEvent, e: React.MouseEvent<HTMLButtonElement>) => void
  /** Called when a timed slot is clicked. */
  onTimeSlotClick?: (
    slotStart: string,
    slotEnd: string,
    event: React.MouseEvent<HTMLDivElement>,
  ) => void
  /** Called when an all-day cell is clicked. */
  onAllDaySlotClick?: (date: string, event: React.MouseEvent<HTMLDivElement>) => void
  /** Consumer-provided event-body renderer. */
  renderEventBody?: CalendarRenderEventBody
  /** Consumer-provided full event renderer. */
  renderEvent?: CalendarRenderEvent
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
  mode: 'default',
  weekStartsOn: 1,
  visibleDays: [0, 1, 2, 3, 4, 5, 6],
  workHours: { startHour: 9, endHour: 17, daysOfWeek: [1, 2, 3, 4, 5] },
  slotDuration: 15,
  dayStartHour: 0,
  dayEndHour: 24,
  visibleStartHour: 7,
  sidebarPosition: 'left',
  withEventsDragAndDrop: true,
  withHeader: true,
  withAllDaySlot: true,
  withCurrentTimeIndicator: true,
  interaction: DEFAULT_INTERACTION,
  dragMonitors: {},
  eventHandlers: NOOP_HANDLERS,
}

// ---------------------------------------------------------------------------
// Store (hydrate persisted prefs over defaults)
// ---------------------------------------------------------------------------
function buildInitialConfig(): CalendarConfig {
  const saved = loadSettings()
  if (!saved) return { ...DEFAULT_CONFIG }
  return {
    ...DEFAULT_CONFIG,
    ...(saved.use24HourTime != null && { use24HourTime: saved.use24HourTime }),
    ...(saved.weekStartsOn != null && { weekStartsOn: saved.weekStartsOn }),
    ...(saved.visibleDays != null && { visibleDays: saved.visibleDays }),
    ...(saved.workHours != null && { workHours: saved.workHours }),
    ...(saved.slotDuration != null && { slotDuration: saved.slotDuration }),
    ...(saved.dayStartHour != null && { dayStartHour: saved.dayStartHour }),
    ...(saved.dayEndHour != null && { dayEndHour: saved.dayEndHour }),
    ...(saved.visibleStartHour != null && { visibleStartHour: saved.visibleStartHour }),
    ...(saved.sidebarPosition != null && { sidebarPosition: saved.sidebarPosition }),
  }
}

const { getState, setState, subscribe: _subscribe, useSelector } = createStore<CalendarConfig>(buildInitialConfig())

// Persist user-facing prefs whenever store changes
_subscribe(() => {
  const s = getState()
  saveSettings({
    use24HourTime: s.use24HourTime,
    weekStartsOn: s.weekStartsOn,
    visibleDays: s.visibleDays,
    workHours: s.workHours,
    slotDuration: s.slotDuration,
    dayStartHour: s.dayStartHour,
    dayEndHour: s.dayEndHour,
    visibleStartHour: s.visibleStartHour,
    sidebarPosition: s.sidebarPosition,
  })
})

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
    const mergedMonitors = partial.dragMonitors
      ? { ...getState().dragMonitors, ...partial.dragMonitors }
      : getState().dragMonitors
    const rest = { ...partial }
    delete rest.interaction
    setState({ ...(rest as Partial<CalendarConfig>), interaction: mergedInteraction, dragMonitors: mergedMonitors })
    return
  }
  if (partial.dragMonitors) {
    const rest = { ...partial }
    delete rest.dragMonitors
    setState({ ...(rest as Partial<CalendarConfig>), dragMonitors: { ...getState().dragMonitors, ...partial.dragMonitors } })
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

export function setSidebarPosition(position: SidebarPosition) {
  setState({ sidebarPosition: position })
}

export function setInteractionSettings(partial: Partial<CalendarInteractionConfig>) {
  const current = getState().interaction
  const next = sanitizeInteractionConfig({ ...current, ...partial })
  setState({ interaction: next })
}

export function setDragMonitors(partial: Partial<CalendarDragMonitors>) {
  setState({ dragMonitors: { ...getState().dragMonitors, ...partial } })
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

/** Subscribe to any config change. Intended for cross-store integrations. */
export function subscribeConfig(listener: () => void) {
  return _subscribe(listener)
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

export function useMode(): ScheduleMode {
  return useSelector((s) => s.mode)
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

export function useSidebarPosition(): SidebarPosition {
  return useSelector((s) => s.sidebarPosition)
}

export function useWithEventsDragAndDrop(): boolean {
  return useSelector((s) => s.withEventsDragAndDrop)
}

export function useWithHeader(): boolean {
  return useSelector((s) => s.withHeader)
}

export function useWithAllDaySlot(): boolean {
  return useSelector((s) => s.withAllDaySlot)
}

export function useWithCurrentTimeIndicator(): boolean {
  return useSelector((s) => s.withCurrentTimeIndicator)
}

export function useConfigEvents(): CalendarEvent[] | undefined {
  return useSelector((s) => s.events)
}

export function useExternalEventDrop() {
  return useSelector((s) => s.onExternalEventDrop)
}

export function useRenderEventBody() {
  return useSelector((s) => s.renderEventBody)
}

export function useRenderEvent() {
  return useSelector((s) => s.renderEvent)
}
