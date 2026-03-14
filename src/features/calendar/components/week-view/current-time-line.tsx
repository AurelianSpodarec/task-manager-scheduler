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
      className="pointer-events-none absolute right-0 left-0 z-20 -translate-y-1/2"
      style={{ top: `${top}px` }}
      aria-hidden="true"
    >
      {/* Line + dot — dot is vertically centered on the 2px line */}
      <div className="relative h-[2px] w-full bg-cal-time-indicator">
        <div
          className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cal-time-indicator"
          style={{
            width: 'var(--cal-time-indicator-size)',
            height: 'var(--cal-time-indicator-size)',
          }}
        />
      </div>
    </div>
  )
}
