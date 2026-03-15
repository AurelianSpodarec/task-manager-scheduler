export type { CalendarDataSource } from './calendar-data-source'
export { SyncDbDataSource } from './sync-db-data-source'

import type { CalendarDataSource } from './calendar-data-source'
import { SyncDbDataSource } from './sync-db-data-source'

// Active data source — default is the in-memory sync DB adapter
let activeSource: CalendarDataSource = new SyncDbDataSource()

/** Replace the active data source (e.g. swap in an API-backed adapter). */
export function setDataSource(source: CalendarDataSource) {
  activeSource = source
}

/** Current data source — used by the event store internals. */
export function getDataSource(): CalendarDataSource {
  return activeSource
}
