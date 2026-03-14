import { useMobileFocusDay, setMobileFocusDay } from '../../calendar-store'
import { isToday, formatDayHeader } from '../../utils/date'

const SHORT_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

type DayStripNavProps = {
  weekDays: Date[]
}

export function DayStripNav({ weekDays }: DayStripNavProps) {
  const focusIndex = useMobileFocusDay()

  return (
    <nav
      className="flex items-center justify-around border-b border-cal-grid-line px-2 py-1.5 md:hidden"
      aria-label="Day selector"
    >
      {weekDays.map((day, i) => {
        const today = isToday(day)
        const selected = i === focusIndex
        const dayIndex = day.getDay()

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
            <span className="text-[10px] font-semibold uppercase leading-none">
              {SHORT_DAYS[dayIndex]}
            </span>
            <span className={`text-[13px] font-bold leading-none ${selected ? '' : ''}`}>
              {formatDayHeader(day)}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
