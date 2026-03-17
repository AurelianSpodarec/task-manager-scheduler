import { ChevronLeft, ChevronRight, Settings, UserRound } from 'lucide-react'
import { useCalendarNavigation } from '../hooks/use-calendar-navigation'
import { toggleSettingsPanel, useSettingsPanelOpen } from '../calendar-store'

export function CalendarHeader() {
  const { view, goNext, goPrev, goToday } = useCalendarNavigation()
  const settingsOpen = useSettingsPanelOpen()

  return (
    <header
      className="flex h-cal-header shrink-0 items-center justify-between border-b border-cal-grid-line px-4"
      role="toolbar"
      aria-label="Calendar navigation"
    >
      <div className="mx-1 flex items-center gap-0.5">
          <button
            type="button"
            onClick={goPrev}
            aria-label={`Previous ${view}`}
            className="inline-flex size-7 items-center justify-center rounded-md text-cal-text-muted transition-colors hover:bg-cal-bg-subtle hover:text-cal-text"
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
          type="button"
          onClick={goToday}
          aria-label="Go to today"
          className="inline-flex h-7 items-center rounded-md border border-cal-grid-line bg-cal-bg px-2.5 text-[12px] font-medium text-cal-text transition-colors hover:bg-cal-bg-subtle"
        >
          Today
        </button>

          <button
            type="button"
            onClick={goNext}
            aria-label={`Next ${view}`}
            className="inline-flex size-7 items-center justify-center rounded-md text-cal-text-muted transition-colors hover:bg-cal-bg-subtle hover:text-cal-text"
          >
            <ChevronRight className="size-4" />
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

