import { useEventsForDay } from '../../calendar-store'
import { isToday, format } from '../../utils/date'
import { EVENT_COLOR_MAP } from '../../constants'
import { isSameMonth } from 'date-fns'

const MAX_VISIBLE_PILLS = 3

type MonthDayCellProps = {
  day: Date
  activeMonth: Date
}

export function MonthDayCell({ day, activeMonth }: MonthDayCellProps) {
  const events = useEventsForDay(day)
  const today = isToday(day)
  const inMonth = isSameMonth(day, activeMonth)
  const overflow = events.length - MAX_VISIBLE_PILLS

  return (
    <div
      className={`flex min-h-cal-month-cell flex-col border-b border-r border-cal-grid-line p-1 ${
        today ? 'bg-cal-today-bg' : ''
      } ${!inMonth ? 'opacity-40' : ''}`}
      role="gridcell"
      aria-label={format(day, 'EEEE, MMMM d')}
    >
      <span
        className={`mb-0.5 self-end text-[var(--cal-text-xs)] font-semibold ${
          today
            ? 'flex size-5 items-center justify-center rounded-full bg-cal-today-text text-white'
            : 'text-cal-text'
        }`}
      >
        {format(day, 'd')}
      </span>

      <div className="flex flex-1 flex-col gap-0.5">
        {events.slice(0, MAX_VISIBLE_PILLS).map((event) => {
          const colors = EVENT_COLOR_MAP[event.color]
          return (
            <button
              key={event.id}
              className="truncate rounded-[var(--cal-radius-pill)] px-1 py-[1px] text-left text-[var(--cal-text-2xs)] font-semibold leading-tight transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cal-focus-ring)]"
              style={{ backgroundColor: colors.bg, color: colors.text }}
              aria-label={event.title}
            >
              {event.title}
            </button>
          )
        })}

        {overflow > 0 && (
          <button className="px-1 text-left text-[var(--cal-text-2xs)] font-medium text-cal-text-muted hover:text-cal-text">
            +{overflow} more
          </button>
        )}
      </div>
    </div>
  )
}
