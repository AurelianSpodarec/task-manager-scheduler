import { useEffect } from 'react'
import { type CalendarConfigUpdate, useCalendarView, useSettingsPanelOpen, applyConfig } from '../calendar-store'
import { CalendarHeader } from './calendar-header'
import { WeekView } from './week-view/week-view'
import { MonthView } from './month-view/month-view'
import { CalendarSettingsPanel } from '@/components/calendar-settings/calendar-settings-panel'

type CalendarShellProps = {
  /** Optional config override — applied once on mount. */
  config?: CalendarConfigUpdate
  /** Render the built-in right settings panel (can be disabled when hosted externally). */
  showSettingsPanel?: boolean
}

export function CalendarShell({ config, showSettingsPanel = true }: CalendarShellProps) {
  const view = useCalendarView()
  const settingsOpen = useSettingsPanelOpen()

  useEffect(() => {
    if (config) applyConfig(config)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentional mount-only

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-cal-bg">
      {/* Calendar area — header + grid */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <CalendarHeader />
        {view === 'week' && <WeekView />}
        {view === 'month' && <MonthView />}
      </div>

      {showSettingsPanel && (
        <div
          className="shrink-0 overflow-hidden transition-[width] duration-200 ease-out"
          style={{ width: settingsOpen ? '17rem' : '0' }}
        >
          {settingsOpen && <div className="h-full w-[17rem]"><CalendarSettingsPanel /></div>}
        </div>
      )}
    </div>
  )
}
