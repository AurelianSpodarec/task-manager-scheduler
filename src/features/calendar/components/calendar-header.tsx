import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWeekStartsOn } from '../calendar-store'
import { getWeekDays } from '../utils/date'
import { useFormatTime } from '../hooks/use-format-time'
import { useCalendarNavigation } from '../hooks/use-calendar-navigation'

export function CalendarHeader() {
  const { view, activeDate, goNext, goPrev, goToday } = useCalendarNavigation()
  const weekStartsOn = useWeekStartsOn()

  const { formatRange, formatMonthYear, formatFullDate } = useFormatTime()
  const weekDays = getWeekDays(activeDate, weekStartsOn)
  const rangeLabel =
    view === 'week'
      ? formatRange(weekDays[0], weekDays[6])
      : formatMonthYear(activeDate)

  const todayLabel = formatFullDate(new Date())

  return (
    <header
      className="flex h-cal-header shrink-0 items-center justify-between border-b border-cal-grid-line px-4"
      role="toolbar"
      aria-label="Calendar navigation"
    >
      <div className="flex items-center gap-2">
        <h1 className="text-[15px] font-semibold text-cal-text">Calendar</h1>
        <span className="hidden text-[13px] text-cal-text-muted sm:inline">
          {todayLabel}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={goToday}
          aria-label="Go to today"
        >
          Today
        </Button>

        <div className="mx-1 flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={goPrev}
            aria-label={`Previous ${view}`}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="hidden min-w-[12rem] text-center text-[13px] font-medium text-cal-text tabular-nums sm:inline">
            {rangeLabel}
          </span>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={goNext}
            aria-label={`Next ${view}`}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

