import type { MeetingProvider } from '@/database/schema'
import type { Participant } from '@/types/shared'

const MAX_VISIBLE_PARTICIPANTS = 3
const JOIN_WINDOW_MINUTES = 15

export function getMeetingProviderLabel(provider: MeetingProvider | null | undefined): string {
  if (provider === 'google') return 'Google Meet'
  if (provider === 'zoom') return 'Zoom Meeting'
  return 'Meeting'
}

export function getMeetingProviderBadge(provider: MeetingProvider | null | undefined): {
  shortLabel: string
  className: string
} {
  if (provider === 'google') {
    return {
      shortLabel: 'G',
      className: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-100',
    }
  }
  if (provider === 'zoom') {
    return {
      shortLabel: 'Z',
      className: 'border-blue-400/40 bg-blue-400/15 text-blue-100',
    }
  }
  return {
    shortLabel: 'M',
    className: 'border-zinc-500/50 bg-zinc-500/20 text-zinc-100',
  }
}

export function splitVisibleParticipants(
  participants: Participant[] | undefined,
  maxVisible: number = MAX_VISIBLE_PARTICIPANTS,
): { visible: Participant[]; overflowCount: number } {
  const safe = participants ?? []
  const visible = safe.slice(0, maxVisible)
  return {
    visible,
    overflowCount: Math.max(0, safe.length - visible.length),
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
  const safe = participants ?? []
  if (safe.length === 0) return ''
  const names = safe.map((p) => p.name)
  const visibleNames = names.slice(0, 2)
  const remaining = names.length - visibleNames.length
  return remaining > 0 ? `${visibleNames.join(', ')} +${remaining}` : visibleNames.join(', ')
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
