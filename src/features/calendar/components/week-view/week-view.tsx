import { useRef, useEffect } from 'react'
import { useActiveDate } from '../../calendar-store'
import { getWeekDays } from '../../utils/date'
import { VISIBLE_START_HOUR, HOUR_HEIGHT_PX } from '../../constants'
import { TimeGutter } from './time-gutter'
import { DayColumn } from './day-column'
import { AllDayRow } from './all-day-row'

export function WeekView() {
  const activeDate = useActiveDate()
  const weekDays = getWeekDays(activeDate)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to business hours on mount / week change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = VISIBLE_START_HOUR * HOUR_HEIGHT_PX - 8
    }
  }, [activeDate])

  return (
    <div className="flex min-h-0 flex-1 flex-col" role="grid" aria-label="Week calendar view">
      {/* All-day row (fixed, doesn't scroll) — hidden on mobile */}
      <div className="hidden md:block">
        <AllDayRow weekDays={weekDays} />
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-auto">
        {/* Mobile: stack days vertically / Desktop: 7-col horizontal */}
        <div className="flex flex-col md:flex-row md:min-w-0">
          <TimeGutter />
          <div className="flex min-w-0 flex-1 flex-col divide-y divide-cal-grid-line md:flex-row md:divide-x md:divide-y-0">
            {weekDays.map((day) => (
              <DayColumn key={day.toISOString()} day={day} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
