import { ChevronLeft, ChevronRight, Search, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useCalendarView,
  useActiveDate,
  setView,
  setActiveDate,
  navigateToToday,
} from '../calendar-store'
import { getWeekDays, navigateWeek, navigateMonth, formatDateRange, format } from '../utils/date'
import type { ViewMode } from '../types'
import { WorkHoursSetting } from './work-hours-setting'

export function CalendarHeader() {
  const view = useCalendarView()
  const activeDate = useActiveDate()

  const weekDays = getWeekDays(activeDate)
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
        <CalendarDays className="size-5 text-cal-text-muted" aria-hidden="true" />
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

        <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-700">
          <ViewToggle current={view} value="week" label="Week" />
          <ViewToggle current={view} value="month" label="Month" />
        </div>

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

        <WorkHoursSetting />

        <div className="relative ml-1 hidden sm:block">
          <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-cal-text-dimmed" />
          <input
            type="search"
            placeholder="Search Event..."
            className="h-7 w-36 rounded-md border border-zinc-200 bg-transparent pl-7 pr-2 text-[13px] text-cal-text placeholder:text-cal-text-dimmed focus:border-cal-focus-ring focus:outline-none dark:border-zinc-700"
            aria-label="Search events"
          />
        </div>
      </div>
    </header>
  )
}

function ViewToggle({ current, value, label }: { current: ViewMode; value: ViewMode; label: string }) {
  const isActive = current === value
  return (
    <button
      onClick={() => setView(value)}
      className={`px-2.5 py-1 text-[12px] font-medium transition-colors first:rounded-l-[5px] last:rounded-r-[5px] ${
        isActive
          ? 'bg-white text-cal-text shadow-sm dark:bg-zinc-800'
          : 'text-cal-text-muted hover:text-cal-text'
      }`}
      aria-pressed={isActive}
      aria-label={`${label} view`}
    >
      {label}
    </button>
  )
}
