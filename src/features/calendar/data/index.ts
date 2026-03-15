export type { CalendarDataSource } from './calendar-data-source'

import type { CalendarDataSource } from './calendar-data-source'

// Active data source — consumer must call setDataSource() before mounting CalendarShell
let activeSource: CalendarDataSource | null = null

/** Set the active data source. Must be called before mounting CalendarShell. */
export function setDataSource(source: CalendarDataSource) {
  activeSource = source
}

/** Current data source — used by the event store internals. */
export function getDataSource(): CalendarDataSource {
  if (!activeSource) throw new Error('Calendar: setDataSource() must be called before mounting CalendarShell')
  return activeSource
}
