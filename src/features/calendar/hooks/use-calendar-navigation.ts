import {
  useCalendarView, useActiveDate,
  setActiveDate, setView, navigateToToday,
} from '../calendar-store'
import { navigateWeek, navigateMonth } from '../utils/date'
import type { ViewMode } from '../types'

type CalendarNavigation = {
  view: ViewMode
  activeDate: Date
  goNext: () => void
  goPrev: () => void
  goToday: () => void
  goToDate: (date: Date) => void
  setView: (view: ViewMode) => void
}

/** Encapsulates calendar navigation — view switching, prev/next, go-to-today. */
export function useCalendarNavigation(): CalendarNavigation {
  const view = useCalendarView()
  const activeDate = useActiveDate()

  function navigate(direction: 'prev' | 'next') {
    const next = view === 'week'
      ? navigateWeek(activeDate, direction)
      : navigateMonth(activeDate, direction)
    setActiveDate(next)
  }

  return {
    view,
    activeDate,
    goNext: () => navigate('next'),
    goPrev: () => navigate('prev'),
    goToday: navigateToToday,
    goToDate: setActiveDate,
    setView,
  }
}
