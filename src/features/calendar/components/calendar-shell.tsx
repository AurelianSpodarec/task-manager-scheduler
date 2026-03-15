import { useCalendarView } from '../calendar-store'
import { useCalendarDropMonitor } from '../dnd'
import { CalendarHeader } from './calendar-header'
import { WeekView } from './week-view/week-view'
import { MonthView } from './month-view/month-view'

export function CalendarShell() {
  const view = useCalendarView()
  useCalendarDropMonitor()

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-cal-bg">
      <CalendarHeader />
      {view === 'week' && <WeekView />}
      {view === 'month' && <MonthView />}
    </div>
  )
}
