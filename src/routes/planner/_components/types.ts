import type { PersonalActivityType } from '@/lib/personal-activity'

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

export type AppDragMeta = WorkDragMeta | PersonalDragMeta
