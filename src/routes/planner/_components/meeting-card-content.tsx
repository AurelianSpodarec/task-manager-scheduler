import type { MeetingProvider } from '@/database/schema'
import type { Participant } from '@/types/shared'
import {
  getMeetingProviderBadge,
  getMeetingProviderLabel,
  getParticipantInitials,
  getParticipantsLabel,
  splitVisibleParticipants,
} from './meeting-card-utils'

type MeetingCardContentProps = {
  title: string
  timeLabel: string
  provider: MeetingProvider | null
  participants: Participant[]
  showJoinAction: boolean
  onJoin?: () => void
}

/**
 * Shared presentational content for meeting cards.
 * Used by both Sidebar MeetingTaskCard and MeetingDragPreview.
 */
export function MeetingCardContent({
  title,
  timeLabel,
  provider,
  participants,
  showJoinAction,
  onJoin,
}: MeetingCardContentProps) {
  const providerLabel = getMeetingProviderLabel(provider)
  const providerBadge = getMeetingProviderBadge(provider)
  const { visible, overflowCount } = splitVisibleParticipants(participants)
  const participantsLabel = getParticipantsLabel(participants)
  const showParticipants = participants.length > 0

  return (
    <>
      <div className="flex items-start justify-between gap-[0.5rem]">
        <div className="min-w-0">
          <p className="text-[9px] font-medium tracking-[0.01em] text-zinc-400">
            {timeLabel}
          </p>
          <h3 className="mt-[0.15rem] line-clamp-2 text-[11.2px] leading-[1rem] font-semibold text-zinc-50">
            {title}
          </h3>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-[0.38rem] py-[0.13rem] text-[8.2px] font-semibold ${providerBadge.className}`}
          title={providerLabel}
        >
          {providerBadge.shortLabel}
        </span>
      </div>
      <div className="mt-[0.5rem] flex items-center justify-between gap-[0.5rem]">
        {showParticipants ? (
          <div className="min-w-0 flex items-center gap-[0.3rem]">
            <span className="flex shrink-0 items-center">
              {visible.map((participant, index) => (
                <span
                  key={participant.id}
                  className={`inline-flex size-[1rem] items-center justify-center overflow-hidden rounded-full bg-zinc-600 text-[7px] font-semibold text-zinc-100 ring-1 ring-zinc-900 ${index === 0 ? '' : '-ml-[0.28rem]'}`}
                  title={participant.name}
                >
                  {participant.avatarUrl
                    ? <img src={participant.avatarUrl} alt={participant.name} className="size-full object-cover" />
                    : getParticipantInitials(participant.name)}
                </span>
              ))}
              {overflowCount > 0 && (
                <span className="-ml-[0.28rem] inline-flex size-[1rem] items-center justify-center rounded-full border border-zinc-500/80 bg-zinc-800 text-[7px] font-semibold text-zinc-200 ring-1 ring-zinc-900">
                  +{overflowCount}
                </span>
              )}
            </span>
            <span className="truncate text-[9px] font-medium text-zinc-300" title={participantsLabel}>
              {participantsLabel}
            </span>
          </div>
        ) : (
          <span className="truncate text-[9px] font-medium text-zinc-300">
            {providerLabel}
          </span>
        )}
        {showJoinAction && (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onJoin?.()
            }}
            className="inline-flex h-[1.2rem] shrink-0 items-center rounded-[0.35rem] border border-blue-400/40 bg-blue-500/20 px-[0.42rem] text-[8.6px] font-semibold text-blue-100 transition-colors hover:bg-blue-500/30"
          >
            Join
          </button>
        )}
      </div>
    </>
  )
}
