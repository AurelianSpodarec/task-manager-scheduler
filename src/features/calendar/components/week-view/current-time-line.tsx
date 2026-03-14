import { useCurrentTime } from '../../hooks/use-current-time'
import { dateToPixelOffset, isToday } from '../../utils/date'
import { HOUR_HEIGHT_PX } from '../../constants'

type CurrentTimeLineProps = {
  day: Date
}

export function CurrentTimeLine({ day }: CurrentTimeLineProps) {
  const now = useCurrentTime()

  if (!isToday(day)) return null

  const top = dateToPixelOffset(now, HOUR_HEIGHT_PX)

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-20"
      style={{ top: `${top}px` }}
      aria-hidden="true"
    >
      {/* Dot on the left edge */}
      <div
        className="absolute -top-[var(--cal-time-indicator-size)] left-0 rounded-full bg-cal-time-indicator"
        style={{
          width: 'var(--cal-time-indicator-size)',
          height: 'var(--cal-time-indicator-size)',
          transform: 'translate(-50%, 50%)',
        }}
      />
      {/* Horizontal line */}
      <div className="h-[2px] w-full bg-cal-time-indicator" />
    </div>
  )
}
