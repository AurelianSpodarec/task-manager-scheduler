import type { MeetingProvider } from '@/database/schema'
import type { PersonalActivityType } from '@/lib/personal-activity'
import type { Participant } from '@/types/shared'

export type WorkDragMeta = {
  kind: 'task'
  clientName: string
  dueDateLabel: string | null
  isCompleted?: boolean
  isRecurring: boolean
  recurringType?: 'standard' | 'retainer'
  durationLabel: string
  priorityBorderColor: string
}

export type PersonalDragMeta = {
  kind: 'personal'
  activityType: PersonalActivityType
  durationLabel: string
}
export type MeetingDragMeta = {
  kind: 'meeting'
  durationLabel: string
  timeLabel: string
  provider: MeetingProvider | null
  providerLabel: string
  participants: Participant[]
}

export type AppDragMeta = WorkDragMeta | PersonalDragMeta | MeetingDragMeta
