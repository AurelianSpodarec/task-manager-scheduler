export type EventColor =
  | 'teal'
  | 'purple'
  | 'rose'
  | 'amber'
  | 'emerald'
  | 'indigo'
  | 'blue'

export type EventStatus = 'pending' | 'completed'

export type EventPriority = 'none' | 'low' | 'medium' | 'high' | 'critical'

export type Participant = {
  id: string
  name: string
  avatarUrl?: string
}
