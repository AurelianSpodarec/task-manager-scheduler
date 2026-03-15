import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useCalendarView,
  useActiveDate,
  setActiveDate,
  navigateToToday,
  useWeekStartsOn,
} from '../calendar-store'
import { getWeekDays, navigateWeek, navigateMonth, formatDateRange, format } from '../utils/date'

export function CalendarHeader() {
  const view = useCalendarView()
  const activeDate = useActiveDate()
  const weekStartsOn = useWeekStartsOn()

  const weekDays = getWeekDays(activeDate, weekStartsOn)
  const rangeLabel =
    view === 'week'
      ? formatDateRange(weekDays[0], weekDays[6])
      : format(activeDate, 'MMMM yyyy')

  function handleNavigate(direction: 'prev' | 'next') {
    const next =
      view === 'week'
        ? navigateWeek(activeDate, direction)
        : navigateMonth(activeDate, direction)
    setActiveDate(next)
  }

  // Count events for today (simplified — shell-level summary)
  const todayLabel = format(new Date(), 'MMMM dd, yyyy')

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
          onClick={() => navigateToToday()}
          aria-label="Go to today"
        >
          Today
        </Button>

        <div className="mx-1 flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleNavigate('prev')}
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
            onClick={() => handleNavigate('next')}
            aria-label={`Next ${view}`}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

