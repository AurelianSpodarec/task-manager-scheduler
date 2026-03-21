import type { MeetingProvider } from '@/database/schema'
import type { Participant } from '@/types/shared'

const MAX_VISIBLE_PARTICIPANTS = 3
const JOIN_WINDOW_MINUTES = 15
type MeetingProviderDescriptor = {
  label: string
  shortLabel: string
  className: string
}

const FALLBACK_PROVIDER_DESCRIPTOR: MeetingProviderDescriptor = {
  label: 'Meeting',
  shortLabel: 'M',
  className: 'border-zinc-300 bg-zinc-100 text-zinc-700',
}

const PROVIDER_DESCRIPTORS: Record<MeetingProvider, MeetingProviderDescriptor> = {
  google: {
    label: 'Google Meet',
    shortLabel: 'G',
    className: 'border-emerald-300 bg-emerald-100 text-emerald-700',
  },
  zoom: {
    label: 'Zoom Meeting',
    shortLabel: 'Z',
    className: 'border-blue-300 bg-blue-100 text-blue-700',
  },
}

function getMeetingProviderDescriptor(provider: MeetingProvider | null | undefined): MeetingProviderDescriptor {
  if (!provider) return FALLBACK_PROVIDER_DESCRIPTOR
  return PROVIDER_DESCRIPTORS[provider] ?? FALLBACK_PROVIDER_DESCRIPTOR
}

export function getMeetingProviderLabel(provider: MeetingProvider | null | undefined): string {
  return getMeetingProviderDescriptor(provider).label
}

export function getMeetingProviderBadge(provider: MeetingProvider | null | undefined): {
  shortLabel: string
  className: string
} {
  const descriptor = getMeetingProviderDescriptor(provider)
  return {
    shortLabel: descriptor.shortLabel,
    className: descriptor.className,
  }
}
type ParticipantSummary = {
  all: Participant[]
  visible: Participant[]
  overflowCount: number
  label: string
}

function buildParticipantsLabel(participants: Participant[]): string {
  if (participants.length === 0) return ''
  const visibleNames = participants.slice(0, 2).map((participant) => participant.name)
  const remaining = participants.length - visibleNames.length
  return remaining > 0 ? `${visibleNames.join(', ')} +${remaining}` : visibleNames.join(', ')
}

export function getParticipantSummary(
  participants: Participant[] | undefined,
  maxVisible: number = MAX_VISIBLE_PARTICIPANTS,
): ParticipantSummary {
  const all = participants ?? []
  const visible = all.slice(0, maxVisible)
  return {
    all,
    visible,
    overflowCount: Math.max(0, all.length - visible.length),
    label: buildParticipantsLabel(all),
  }
}

export function splitVisibleParticipants(
  participants: Participant[] | undefined,
  maxVisible: number = MAX_VISIBLE_PARTICIPANTS,
): { visible: Participant[]; overflowCount: number } {
  const summary = getParticipantSummary(participants, maxVisible)
  return {
    visible: summary.visible,
    overflowCount: summary.overflowCount,
  }
}

export function getParticipantInitials(name: string): string {
  const tokens = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (tokens.length === 0) return 'NA'
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase()
  return `${tokens[0][0] ?? ''}${tokens[1][0] ?? ''}`.toUpperCase()
}

export function getParticipantsLabel(participants: Participant[] | undefined): string {
  return getParticipantSummary(participants).label
}

export function isMeetingJoinWindow(
  scheduleStartIso: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!scheduleStartIso) return false
  const startMillis = Date.parse(scheduleStartIso)
  if (!Number.isFinite(startMillis)) return false
  const deltaMinutes = (now.getTime() - startMillis) / 60_000
  return deltaMinutes >= -JOIN_WINDOW_MINUTES && deltaMinutes <= JOIN_WINDOW_MINUTES
}
