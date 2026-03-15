import { subscribe as dbSubscribe, getSnapshot as dbGetSnapshot } from '@/database/db'
import { toCalendarEvent } from '@/services/task-service'
import type { CalendarEvent } from '../types'
import type { CalendarDataSource } from './calendar-data-source'

/**
 * Default data source — reads directly from the in-memory sync DB.
 * Zero runtime change from the previous hardwired setup.
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
