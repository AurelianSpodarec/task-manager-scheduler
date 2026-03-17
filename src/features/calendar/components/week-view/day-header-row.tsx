import { isToday, format } from '../../utils/date'
import { useConfigLocale } from '../../calendar-store'
import { useFormatTime } from '../../hooks/use-format-time'

type DayHeaderRowProps = {
  weekDays: Date[]
  weekLabel: string
}

export function DayHeaderRow({ weekDays, weekLabel }: DayHeaderRowProps) {
  const { formatDayHeader } = useFormatTime()
  const locale = useConfigLocale()

  return (
    <div role="row" className="cal-week-grid-header hidden border-b border-cal-week-header-separator bg-cal-week-header-bg md:grid">
      <div className="flex items-center justify-center border-r border-cal-week-header-separator bg-cal-week-header-control-bg px-1.5">
        <span className="text-[9px] font-semibold tracking-[0.04em] text-cal-week-header-text-muted uppercase">
          {weekLabel}
        </span>
      </div>

      {weekDays.map((day) => {
        const today = isToday(day)
        const dayLabel = format(day, 'EEE', { locale }).toUpperCase() + '.'

        return (
          <div
            key={day.toISOString()}
            role="columnheader"
            aria-label={format(day, 'EEEE', { locale })}
            aria-current={today ? 'date' : undefined}
            className={`flex items-center justify-center border-r border-cal-week-header-separator px-2 py-1 ${
              today
                ? 'bg-cal-week-header-active-bg shadow-[inset_0_-2px_0_0_var(--cal-week-header-active-underline)]'
                : 'bg-cal-week-header-bg'
            }`}
          >
            <span aria-hidden="true" className="inline-flex items-baseline gap-1">
              <span
                className={`text-[9px] font-semibold tracking-[0.06em] uppercase ${
                  today ? 'text-cal-week-header-active-text' : 'text-cal-week-header-text-muted'
                }`}
              >
                {dayLabel}
              </span>
              <span
                className={`text-[12px] font-semibold leading-none tabular-nums ${
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
