import type { EventColor, EventStatus, EventPriority, Participant } from '@/types/shared'
import type { PersonalActivityType } from '@/lib/personal-activity'

export type TaskType = 'work' | 'personal' | 'meeting'
export type MeetingProvider = 'google' | 'zoom'

export type TaskSchedule = {
  start: string   // ISO datetime
  end: string     // ISO datetime
  isAllDay: boolean
}

/**
 * Unified data record — every sidebar card and calendar event is a Task.
 * `schedule` being null means the task is unscheduled (sidebar only).
 */
export type Task = {
  id: string
  title: string
  type: TaskType
  durationMinutes: number
  priority: EventPriority
  status: EventStatus
  color: EventColor

  // Work-task fields
  clientName?: string
  dueDateLabel?: string | null
  isRecurring?: boolean
  recurringType?: 'standard' | 'retainer'

  // Personal-activity fields
  personalActivityType?: PersonalActivityType

  // Meeting fields
  participants?: Participant[]
  meetingProvider?: MeetingProvider
  meetingJoinUrl?: string | null

  schedule: TaskSchedule | null
}
