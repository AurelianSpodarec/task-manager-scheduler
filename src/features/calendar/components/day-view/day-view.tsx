import { useEffect, useRef } from 'react'
import {
  useActiveDate,
  useVisibleStartHour,
  useWithAllDaySlot,
  useConfigLocale,
} from '../../calendar-store'
import { format } from '../../utils/date'
import { HOUR_HEIGHT_PX } from '../../constants'
import { TimeGutter } from '../week-view/time-gutter'
import { DayColumn } from '../week-view/day-column'
import { AllDayRow } from '../week-view/all-day-row'
import { DayHeaderRow } from '../week-view/day-header-row'
import { CalendarDragLayer } from '../week-view/calendar-drag-layer'

export function DayView() {
  const activeDate = useActiveDate()
  const visibleStartHour = useVisibleStartHour()
  const locale = useConfigLocale()
  const withAllDaySlot = useWithAllDaySlot()
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const dayLabel = format(activeDate, 'MMM yyyy', { locale })
  const day = [activeDate]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = visibleStartHour * HOUR_HEIGHT_PX - 8
    }
  }, [activeDate, visibleStartHour])

  useEffect(() => {
    const scroll = scrollRef.current
    const root = rootRef.current
    if (!scroll || !root) return
    const w = scroll.offsetWidth - scroll.clientWidth
    root.style.setProperty('--cal-scrollbar-w', `${w}px`)
  }, [])

  return (
    <div
      ref={rootRef}
      className="flex min-h-0 flex-1 flex-col"
      role="grid"
      aria-colcount={1}
      aria-label="Day calendar view"
      style={{ '--cal-day-count': 1 } as React.CSSProperties}
    >
      <div role="rowgroup">
        <DayHeaderRow weekDays={day} weekLabel={dayLabel} />
      </div>

      {withAllDaySlot && (
        <div role="rowgroup">
          <AllDayRow weekDays={day} />
        </div>
      )}

      <div
        ref={scrollRef}
        role="rowgroup"
        className="sidebar-scrollbar relative min-h-0 flex-1 overflow-y-auto"
        style={{ willChange: 'scroll-position' }}
      >
        <div role="row" className="cal-week-grid grid">
          <TimeGutter />
          <DayColumn day={activeDate} />
        </div>
      </div>
      <CalendarDragLayer />
    </div>
  )
}
