import { useRef, useEffect } from 'react'
import { useActiveDate, useMobileFocusDay } from '../../calendar-store'
import { getWeekDays } from '../../utils/date'
import { VISIBLE_START_HOUR, HOUR_HEIGHT_PX } from '../../constants'
import { TimeGutter } from './time-gutter'
import { DayColumn } from './day-column'
import { AllDayRow } from './all-day-row'
import { DayHeaderRow } from './day-header-row'
import { DayStripNav } from './day-strip-nav'

export function WeekView() {
  const activeDate = useActiveDate()
  const weekDays = getWeekDays(activeDate)
  const mobileFocus = useMobileFocusDay()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = VISIBLE_START_HOUR * HOUR_HEIGHT_PX - 8
    }
  }, [activeDate])

  return (
    <div className="flex min-h-0 flex-1 flex-col" role="grid" aria-colcount={7} aria-label="Week calendar view">
      {/* Mobile: day strip selector */}
      <DayStripNav weekDays={weekDays} />

      {/* Desktop: all-day row (shares grid template) */}
      <div className="hidden md:block">
        <AllDayRow weekDays={weekDays} />
      </div>

      {/* Desktop: fixed day header row */}
      <div role="rowgroup" className="hidden md:block">
        <DayHeaderRow weekDays={weekDays} />
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} role="rowgroup" className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto">
        {/* Desktop: full 7-day grid */}
        <div className="cal-week-grid hidden md:grid">
          <TimeGutter />
          {weekDays.map((day) => (
            <DayColumn key={day.toISOString()} day={day} />
          ))}
        </div>

        {/* Mobile: gutter + single active day */}
        <div className="cal-week-grid grid md:hidden">
          <TimeGutter />
          <DayColumn day={weekDays[mobileFocus] ?? weekDays[0]} />
        </div>
      </div>
    </div>
  )
}
