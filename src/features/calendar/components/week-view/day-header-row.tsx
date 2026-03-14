import { WEEK_DAY_LABELS } from '../../constants'
import { isToday, formatDayHeader } from '../../utils/date'

const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

type DayHeaderRowProps = {
  weekDays: Date[]
  weekLabel: string
}

export function DayHeaderRow({ weekDays, weekLabel }: DayHeaderRowProps) {
  return (
    <div role="row" className="cal-week-grid-header hidden border-b border-cal-week-header-separator bg-cal-week-header-bg md:grid">
      <div className="flex items-center justify-center border-r border-cal-week-header-separator bg-cal-week-header-control-bg px-1.5">
        <span className="text-[10px] font-semibold tracking-[0.04em] text-cal-week-header-text-muted uppercase">
          {weekLabel}
        </span>
      </div>

      {weekDays.map((day) => {
        const dayIndex = day.getDay()
        const today = isToday(day)
        const dayLabel = `${WEEK_DAY_LABELS[dayIndex]}.`

        return (
          <div
            key={day.toISOString()}
            role="columnheader"
            aria-label={FULL_DAY_NAMES[dayIndex]}
            aria-current={today ? 'date' : undefined}
            className={`flex items-center justify-center border-r border-cal-week-header-separator px-2 py-2 ${
              today
                ? 'bg-cal-week-header-active-bg shadow-[inset_0_-2px_0_0_var(--cal-week-header-active-underline)]'
                : 'bg-cal-week-header-bg'
            }`}
          >
            <span aria-hidden="true" className="inline-flex items-baseline gap-1">
              <span
                className={`text-[10px] font-semibold tracking-[0.06em] uppercase ${
                  today ? 'text-cal-week-header-active-text' : 'text-cal-week-header-text-muted'
                }`}
              >
                {dayLabel}
              </span>
              <span
                className={`text-[13px] font-semibold leading-none tabular-nums ${
                  today ? 'text-cal-week-header-active-text' : 'text-cal-week-header-text'
                }`}
              >
                {formatDayHeader(day)}
              </span>
            </span>
          </div>
        )
      })}

      {/* Scrollbar spacer */}
      <div aria-hidden="true" />
    </div>
  )
}
