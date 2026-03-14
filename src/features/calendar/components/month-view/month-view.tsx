import { useActiveDate } from '../../calendar-store'
import { getMonthGrid } from '../../utils/date'
import { WEEK_DAY_LABELS } from '../../constants'
import { MonthDayCell } from './month-day-cell'

export function MonthView() {
  const activeDate = useActiveDate()
  const weeks = getMonthGrid(activeDate)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" role="grid" aria-label="Month calendar view">
      {/* Day-of-week header */}
      <div className="grid shrink-0 grid-cols-7 border-b border-cal-grid-line" role="row">
        {WEEK_DAY_LABELS.map((label) => (
          <div
            key={label}
            className="border-r border-cal-grid-line px-1 py-1.5 text-center text-[var(--cal-text-2xs)] font-semibold uppercase tracking-wider text-cal-text-muted last:border-r-0"
            role="columnheader"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, i) => (
        <div key={i} className="grid grid-cols-7" role="row">
          {week.map((day) => (
            <MonthDayCell key={day.toISOString()} day={day} activeMonth={activeDate} />
          ))}
        </div>
      ))}
    </div>
  )
}
