import { WEEK_DAY_LABELS } from '../../constants'
import { isToday, formatDayHeader } from '../../utils/date'

const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

type DayHeaderRowProps = {
  weekDays: Date[]
}

export function DayHeaderRow({ weekDays }: DayHeaderRowProps) {
  return (
    <div role="row" className="cal-week-grid-header hidden border-b border-cal-grid-line md:grid">
      {/* Gutter spacer */}
      <div className="border-r border-cal-grid-line" aria-hidden="true" />

      {weekDays.map((day) => {
        const dayIndex = day.getDay()
        const today = isToday(day)

        return (
          <div
            key={day.toISOString()}
            role="columnheader"
            aria-label={FULL_DAY_NAMES[dayIndex]}
            aria-current={today ? 'date' : undefined}
            className={`flex flex-col items-center justify-center border-r border-cal-grid-line py-1.5 ${
              today ? 'bg-cal-today-bg' : ''
            }`}
          >
            <span
              aria-hidden="true"
              className={`text-[var(--cal-text-2xs)] font-semibold uppercase tracking-wider ${
                today ? 'text-cal-today-text' : 'text-cal-text-muted'
              }`}
            >
              {WEEK_DAY_LABELS[dayIndex]}
            </span>
            <span
              aria-hidden="true"
              className={`text-[var(--cal-text-base)] font-bold leading-none ${
                today ? 'text-cal-today-text' : 'text-cal-text'
              }`}
            >
              {formatDayHeader(day)}
            </span>
          </div>
        )
      })}

      {/* Scrollbar spacer */}
      <div aria-hidden="true" />
    </div>
  )
}
