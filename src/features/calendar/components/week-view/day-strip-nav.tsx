import { useMobileFocusDay, setMobileFocusDay, useConfigLocale } from '../../calendar-store'
import { isToday, format } from '../../utils/date'
import { useFormatTime } from '../../hooks/use-format-time'

type DayStripNavProps = {
  weekDays: Date[]
}

export function DayStripNav({ weekDays }: DayStripNavProps) {
  const focusIndex = useMobileFocusDay()
  const { formatDayHeader } = useFormatTime()
  const locale = useConfigLocale()

  return (
    <nav
      className="flex items-center justify-around border-b border-cal-grid-line px-2 py-1.5 md:hidden"
      aria-label="Day selector"
    >
      {weekDays.map((day, i) => {
        const today = isToday(day)
        const selected = i === focusIndex

        return (
          <button
            key={day.toISOString()}
            onClick={() => setMobileFocusDay(i)}
            aria-current={today ? 'date' : undefined}
            aria-pressed={selected}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-center transition-colors ${
              selected
                ? 'bg-cal-today-text text-white'
                : today
                  ? 'text-cal-today-text'
                  : 'text-cal-text-muted'
            }`}
          >
            <span className="text-[9px] font-semibold uppercase leading-none">
              {format(day, 'EEEEE', { locale })}
            </span>
            <span className={`text-[12px] font-bold leading-none ${selected ? '' : ''}`}>
              {formatDayHeader(day)}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
