import { useEffect } from 'react'
import { type CalendarConfig, useCalendarView, applyConfig } from '../calendar-store'
import { useCalendarDropMonitor } from '../dnd'
import { CalendarHeader } from './calendar-header'
import { WeekView } from './week-view/week-view'
import { MonthView } from './month-view/month-view'

type CalendarShellProps = {
  /** Optional config override — applied once on mount. */
  config?: Partial<CalendarConfig>
}

export function CalendarShell({ config }: CalendarShellProps) {
  const view = useCalendarView()
  useCalendarDropMonitor()

  useEffect(() => {
    if (config) applyConfig(config)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentional mount-only

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-cal-bg">
      <CalendarHeader />
      {view === 'week' && <WeekView />}
      {view === 'month' && <MonthView />}
    </div>
  )
}
