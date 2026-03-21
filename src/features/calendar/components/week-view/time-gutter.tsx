import { HOUR_HEIGHT_PX } from '../../constants'
import { dateToPixelOffset } from '../../utils/date'
import { useCurrentTime } from '../../hooks/use-current-time'
import { useFormatTime } from '../../hooks/use-format-time'
import {
  setTimeChevronHovered,
  toggleTimeGuidePinned,
  useDayStartHour,
  useDayEndHour,
  useWithCurrentTimeIndicator,
} from '../../calendar-store'

export function TimeGutter() {
  const now = useCurrentTime()
  const chevronTop = dateToPixelOffset(now, HOUR_HEIGHT_PX)
  const { formatHour } = useFormatTime()
  const dayStartHour = useDayStartHour()
  const dayEndHour = useDayEndHour()
  const withCurrentTimeIndicator = useWithCurrentTimeIndicator()

  const hours: number[] = []
  for (let h = dayStartHour; h < dayEndHour; h++) {
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
            <span className="text-[10px] leading-none text-cal-text-muted">
              {formatHour(hour)}
            </span>
          </div>
        </div>
      ))}

      {withCurrentTimeIndicator && (
        <button
          type="button"
          className="absolute left-0 z-20 flex size-6 cursor-pointer items-center justify-start"
          style={{ top: `${chevronTop}px`, transform: 'translateY(calc(-50% + 1px))' }}
          onClick={() => toggleTimeGuidePinned()}
          onMouseEnter={() => setTimeChevronHovered(true)}
          onMouseLeave={() => setTimeChevronHovered(false)}
        >
          <svg width="10" height="12" viewBox="0 0 10 12" style={{ fill: 'var(--cal-time-indicator)' }}>
            <path d="M0 0 L10 6 L0 12Z" />
          </svg>
        </button>
      )}
    </div>
  )
}
