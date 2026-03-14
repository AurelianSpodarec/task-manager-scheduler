import { DAY_START_HOUR, DAY_END_HOUR, HOUR_HEIGHT_PX } from '../../constants'
import { formatHour } from '../../utils/date'

export function TimeGutter() {
  const hours: number[] = []
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
    hours.push(h)
  }

  return (
    <div
      className="relative w-cal-gutter shrink-0 select-none border-r border-cal-grid-line"
      aria-hidden="true"
    >
      {hours.map((hour) => (
        <div
          key={hour}
          className="relative border-b border-cal-grid-line text-right"
          style={{ height: `${HOUR_HEIGHT_PX}px` }}
        >
          {hour > 0 && (
            <span className="absolute -top-2 right-2 text-[var(--cal-text-2xs)] font-medium text-cal-text-muted">
              {formatHour(hour)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
