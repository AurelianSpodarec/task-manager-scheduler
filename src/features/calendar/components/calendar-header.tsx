import { ChevronLeft, ChevronRight, Settings, UserRound } from 'lucide-react'
import { useCalendarNavigation } from '../hooks/use-calendar-navigation'
import { useFormatTime } from '../hooks/use-format-time'
import { toggleSettingsPanel, useSettingsPanelOpen, useWeekStartsOn, useVisibleDays } from '../calendar-store'
import { getVisibleWeekDays } from '../utils/date'

export function CalendarHeader() {
  const { view, activeDate, goNext, goPrev, goToday } = useCalendarNavigation()
  const settingsOpen = useSettingsPanelOpen()
  const weekStartsOn = useWeekStartsOn()
  const visibleDays = useVisibleDays()
  const { formatWeekRange, formatMonthLabel } = useFormatTime()
  const dateLabel = view === 'day'
    ? formatMonthLabel(activeDate) + ' ' + activeDate.getDate().toString()
    : view === 'week'
      ? formatWeekRange(getVisibleWeekDays(activeDate, weekStartsOn, visibleDays))
    : formatMonthLabel(activeDate)

  return (
    <header
      className="flex h-cal-header shrink-0 items-center justify-between border-b border-cal-grid-line px-4"
      role="toolbar"
      aria-label="Calendar navigation"
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={goPrev}
          aria-label={`Previous ${view}`}
          className="inline-flex size-6 items-center justify-center rounded-md text-cal-text-muted transition-colors hover:bg-cal-bg-subtle hover:text-cal-text"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        <span className="select-none px-1 text-center text-[12px] font-semibold tabular-nums text-cal-text">
          {dateLabel}
        </span>

        <button
          type="button"
          onClick={goNext}
          aria-label={`Next ${view}`}
          className="inline-flex size-6 items-center justify-center rounded-md text-cal-text-muted transition-colors hover:bg-cal-bg-subtle hover:text-cal-text"
        >
          <ChevronRight className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={goToday}
          aria-label="Go to today"
          className="ml-1.5 inline-flex h-6 items-center rounded-lg bg-cal-bg-subtle px-2.5 text-[10.5px] font-semibold text-cal-text-muted transition-colors hover:bg-cal-bg hover:text-cal-text hover:shadow-sm"
        >
          Today
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="View colleague"
          title="View colleague"
          className="inline-flex size-7 items-center justify-center rounded-md text-cal-text-muted transition-colors hover:bg-cal-bg-subtle hover:text-cal-text"
        >
          <UserRound aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          onClick={toggleSettingsPanel}
          aria-label="Calendar settings"
          title="Calendar settings"
          aria-pressed={settingsOpen}
          className={`inline-flex size-7 items-center justify-center rounded-md transition-colors ${
            settingsOpen
              ? 'bg-cal-bg-subtle text-cal-text'
              : 'text-cal-text-muted hover:bg-cal-bg-subtle hover:text-cal-text'
          }`}
        >
          <Settings aria-hidden="true" className="size-4" />
        </button>
      </div>
    </header>
  )
}

