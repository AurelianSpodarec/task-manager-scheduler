import { useRef, useEffect } from 'react'
import { useActiveDate, useMobileFocusDay } from '../../calendar-store'
import { getWeekDays, formatWeekOfYear } from '../../utils/date'
import { VISIBLE_START_HOUR, HOUR_HEIGHT_PX } from '../../constants'
import { TimeGutter } from './time-gutter'
import { DayColumn } from './day-column'
import { AllDayRow } from './all-day-row'
import { DayHeaderRow } from './day-header-row'
import { DayStripNav } from './day-strip-nav'
import { CalendarDragLayer } from './calendar-drag-layer'

export function WeekView() {
  const activeDate = useActiveDate()
  const weekDays = getWeekDays(activeDate)
  const weekLabel = formatWeekOfYear(activeDate)
  const mobileFocus = useMobileFocusDay()
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = VISIBLE_START_HOUR * HOUR_HEIGHT_PX - 8
    }
  }, [activeDate])

  // Measure the actual scrollbar width and sync with the header spacer column
  useEffect(() => {
    const scroll = scrollRef.current
    const root = rootRef.current
    if (!scroll || !root) return
    const w = scroll.offsetWidth - scroll.clientWidth
    root.style.setProperty('--cal-scrollbar-w', `${w}px`)
  }, [])

  return (
    <div ref={rootRef} className="flex min-h-0 flex-1 flex-col" role="grid" aria-colcount={7} aria-label="Week calendar view">
      {/* Mobile: day strip selector */}
      <DayStripNav weekDays={weekDays} />

      {/* Desktop: fixed day header row */}
      <div role="rowgroup" className="hidden md:block">
        <DayHeaderRow weekDays={weekDays} weekLabel={weekLabel} />
      </div>

      {/* Desktop: all-day row */}
      <div role="rowgroup" className="hidden md:block">
        <AllDayRow weekDays={weekDays} />
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} role="rowgroup" className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto">
        {/* Desktop: full 7-day grid */}
        <div role="row" className="cal-week-grid hidden md:grid">
          <TimeGutter />
          {weekDays.map((day) => (
            <DayColumn key={day.toISOString()} day={day} />
          ))}
        </div>

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
