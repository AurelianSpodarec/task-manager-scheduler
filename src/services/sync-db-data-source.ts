import { subscribe as dbSubscribe, getSnapshot as dbGetSnapshot } from '@/database/db'
import { toCalendarEvent } from '@/services/task-service'
import type { CalendarEvent, CalendarDataSource } from '@/features/calendar'

/**
 * App-level data source — reads directly from the in-memory sync DB
 * and maps Task → CalendarEvent via the consumer's toCalendarEvent adapter.
 */
export class SyncDbDataSource implements CalendarDataSource {
  loading = false as const
  error: Error | null = null

  private cachedRef: unknown[] = []
  private cached: CalendarEvent[] = []

  subscribe(cb: () => void): () => void {
    return dbSubscribe(cb)
  }

  getSnapshot(): CalendarEvent[] {
    const snap = dbGetSnapshot()
    if (snap !== this.cachedRef) {
      this.cachedRef = snap
      this.cached = snap
        .filter((t) => t.schedule != null)
        .map(toCalendarEvent)
    }
    return this.cached
  }
}
