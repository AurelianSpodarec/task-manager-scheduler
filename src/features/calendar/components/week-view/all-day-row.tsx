import { useAllDayEvents } from '../../calendar-store'
import { EVENT_COLOR_MAP } from '../../constants'
import { isSameDay } from '../../utils/date'

type AllDayRowProps = {
  weekDays: Date[]
}

export function AllDayRow({ weekDays }: AllDayRowProps) {
  const allDayEvents = useAllDayEvents(weekDays[0], weekDays[6])
  const hasEvents = allDayEvents.length > 0

  return (
    <div className="cal-week-grid-header hidden min-h-cal-allday shrink-0 border-b border-cal-grid-line md:grid">
      {/* Gutter */}
      <div className="flex items-start justify-end border-r border-cal-grid-line pr-2 pt-1" aria-hidden="true">
        {hasEvents && (
          <span className="text-[var(--cal-text-2xs)] font-medium text-cal-text-muted">
            All Day
          </span>
        )}
      </div>

      {weekDays.map((day) => (
        <div
          key={day.toISOString()}
          className="min-w-0 border-r border-cal-grid-line p-0.5"
        >
          {allDayEvents
            .filter((e) => isSameDay(e.start, day))
            .map((event) => {
              const colors = EVENT_COLOR_MAP[event.color]
              return (
                <div
                  key={event.id}
                  className="mb-0.5 truncate rounded-[var(--cal-radius-pill)] px-1.5 py-0.5 text-[var(--cal-text-2xs)] font-semibold"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {event.title}
                </div>
              )
            })}
        </div>
      ))}

      {/* Scrollbar spacer */}
      <div aria-hidden="true" />
    </div>
  )
}
