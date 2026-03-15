import type { CalendarEvent } from '../types'

/**
 * Pluggable data adapter for the calendar event store.
 *
 * The sync DB implementation is the default — swap to an async API adapter
 * by implementing this interface and calling `setDataSource()`.
 */
export type CalendarDataSource = {
  /** Subscribe to change notifications. Returns an unsubscribe function. */
  subscribe(cb: () => void): () => void
  /** Return the current snapshot of scheduled calendar events. */
  getSnapshot(): CalendarEvent[]
  /** Whether the data source is currently loading (always false for sync). */
  loading: boolean
  /** Last error, if any. */
  error: Error | null
}
