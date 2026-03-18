import { useEffect, useState } from 'react'
import { makeSidebarDragData, useCalendarDragSource, useFormatTime } from '@/features/calendar'
import type { Task } from '@/database/schema'
import { MeetingCardContent } from './meeting-card-content'
import { getMeetingProviderLabel, isMeetingJoinWindow } from './meeting-card-utils'
import { roundUpDurationMinutes, formatDurationLabel } from './utils'
import { sidebarCardShellClass } from './card-shell'

export function MeetingTaskCard({ task }: { task: Task }) {
  const { formatEventTime } = useFormatTime()
  const roundedDurationMinutes = roundUpDurationMinutes(task.durationMinutes)
  const roundedDurationLabel = formatDurationLabel(roundedDurationMinutes)
  const provider = task.meetingProvider ?? null
  const providerLabel = getMeetingProviderLabel(provider)
  const participants = task.participants ?? []
  const [now, setNow] = useState(() => new Date())
  const showJoinAction = isMeetingJoinWindow(task.schedule?.start, now)
  const scheduleStart = task.schedule?.start ? new Date(task.schedule.start) : null
  const scheduleEnd = task.schedule?.end ? new Date(task.schedule.end) : null
  const timeLabel = scheduleStart && scheduleEnd
    ? `${formatEventTime(scheduleStart)} - ${formatEventTime(scheduleEnd)}`
    : roundedDurationLabel
  const joinUrl = task.meetingJoinUrl?.trim() || ''

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])
  const { ref, isDragging, onPointerDown } = useCalendarDragSource<HTMLElement>({
    createDragData: () => makeSidebarDragData(task.id, task.title, roundedDurationMinutes, {
      color: task.color,
      className: 'border-zinc-200 bg-gradient-to-br from-white via-zinc-50/45 to-zinc-100/65 hover:border-zinc-300',
      dragMeta: {
        kind: 'meeting' as const,
        durationLabel: roundedDurationLabel,
        timeLabel,
        provider,
        providerLabel,
        participants,
      },
    }),
  })

  return (
    <article
      ref={ref}
      onPointerDown={onPointerDown}
      className={sidebarCardShellClass('light', isDragging)}
    >
      <MeetingCardContent
        title={task.title}
        timeLabel={timeLabel}
        provider={provider}
        participants={participants}
        showJoinAction={showJoinAction}
        onJoin={joinUrl
          ? () => {
              if (typeof window !== 'undefined') {
                window.open(joinUrl, '_blank', 'noopener,noreferrer')
              }
            }
          : undefined}
      />
    </article>
  )
}
