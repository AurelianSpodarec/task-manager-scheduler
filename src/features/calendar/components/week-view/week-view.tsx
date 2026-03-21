import { useRef, useEffect } from 'react'
import {
  useActiveDate,
  useMobileFocusDay,
  useTimeGuideVisible,
  useWeekStartsOn,
  useVisibleStartHour,
  useConfigLocale,
  useVisibleDays,
  useWithAllDaySlot,
  useWithCurrentTimeIndicator,
} from '../../calendar-store'
import { getVisibleWeekDays, formatWeekOfYear, dateToPixelOffset } from '../../utils/date'
import { HOUR_HEIGHT_PX } from '../../constants'
import { useCurrentTime } from '../../hooks/use-current-time'
import { TimeGutter } from './time-gutter'
import { DayColumn } from './day-column'
import { AllDayRow } from './all-day-row'
import { DayHeaderRow } from './day-header-row'
import { DayStripNav } from './day-strip-nav'
import { CalendarDragLayer } from './calendar-drag-layer'

export function WeekView() {
  const activeDate = useActiveDate()
  const weekStartsOn = useWeekStartsOn()
  const locale = useConfigLocale()
  const visibleDays = useVisibleDays()
  const weekDays = getVisibleWeekDays(activeDate, weekStartsOn, visibleDays)
  const weekLabel = formatWeekOfYear(activeDate, weekStartsOn, locale)
  const mobileFocus = useMobileFocusDay()
  const visibleStartHour = useVisibleStartHour()
  const withAllDaySlot = useWithAllDaySlot()
  const withCurrentTimeIndicator = useWithCurrentTimeIndicator()
  const dayCount = weekDays.length
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = visibleStartHour * HOUR_HEIGHT_PX - 8
    }
  }, [activeDate, visibleStartHour])

  // Measure the actual scrollbar width and sync with the header spacer column
  useEffect(() => {
    const scroll = scrollRef.current
    const root = rootRef.current
    if (!scroll || !root) return
    const w = scroll.offsetWidth - scroll.clientWidth
    root.style.setProperty('--cal-scrollbar-w', `${w}px`)
  }, [])

  return (
    <div ref={rootRef} className="flex min-h-0 flex-1 flex-col" role="grid" aria-colcount={dayCount} aria-label="Week calendar view" style={{ '--cal-day-count': dayCount } as React.CSSProperties}>
      {/* Mobile: day strip selector */}
      <DayStripNav weekDays={weekDays} />

      {/* Desktop: fixed day header row */}
      <div role="rowgroup" className="hidden md:block">
        <DayHeaderRow weekDays={weekDays} weekLabel={weekLabel} />
      </div>

      {/* Desktop: all-day row */}
      {withAllDaySlot && (
        <div role="rowgroup" className="hidden md:block">
          <AllDayRow weekDays={weekDays} />
        </div>
      )}

      {/* Scrollable time grid */}
      <div ref={scrollRef} role="rowgroup" className="sidebar-scrollbar relative min-h-0 flex-1 overflow-y-auto" style={{ willChange: 'scroll-position' }}>
        {/* Desktop: full 7-day grid */}
        <div role="row" className="cal-week-grid hidden md:grid">
          <TimeGutter />
          {weekDays.map((day) => (
            <DayColumn key={day.toISOString()} day={day} />
          ))}
        </div>

        {withCurrentTimeIndicator && <CurrentTimeHoverGuide />}

        {/* Mobile: gutter + single active day */}
        <div role="row" className="cal-week-grid grid md:hidden">
          <TimeGutter />
          <DayColumn day={weekDays[mobileFocus] ?? weekDays[0]} />
        </div>
      </div>
      <CalendarDragLayer />
    </div>
  )
}

/** Dashed horizontal guide line shown at the current time when the gutter chevron is hovered. */
function CurrentTimeHoverGuide() {
  const visible = useTimeGuideVisible()
  const now = useCurrentTime()

  if (!visible) return null

  const top = dateToPixelOffset(now, HOUR_HEIGHT_PX)

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-30"
      style={{ top: `${top}px` }}
      aria-hidden="true"
    >
      <div className="h-0 w-full border-t border-dashed" style={{ borderColor: 'var(--cal-time-indicator)' }} />
    </div>
  )
}
