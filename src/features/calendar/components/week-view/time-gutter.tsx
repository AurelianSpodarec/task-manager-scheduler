import { DAY_START_HOUR, DAY_END_HOUR, HOUR_HEIGHT_PX } from '../../constants'
import { formatHour } from '../../utils/date'

export function TimeGutter() {
  const hours: number[] = []
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
    hours.push(h)
  }

  return (
    <div
      className="relative select-none border-r border-cal-grid-line"
      aria-hidden="true"
    >
      {hours.map((hour) => (
        <div
          key={hour}
          className="relative border-b border-cal-grid-line"
          style={{ height: `${HOUR_HEIGHT_PX}px` }}
        >
          {/* Half-hour dotted divider */}
          <div className="absolute inset-x-0 top-1/2 border-b border-dotted border-cal-grid-line" />

          {/* Hour label — centered between top border and half-hour line */}
          <div className="absolute inset-x-0 top-0 flex h-1/2 items-center justify-end pr-1 md:pr-2">
            <span className="text-[11px] leading-none text-cal-text-muted">
              {formatHour(hour)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
