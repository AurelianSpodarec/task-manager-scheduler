import { useEffect, useState } from 'react'
import { makeSidebarDragData, useCalendarDragSource, useFormatTime } from '@/features/calendar'
import type { Task } from '@/database/schema'
import { MeetingCardContent } from './meeting-card-content'
import { getMeetingProviderLabel, isMeetingJoinWindow } from './meeting-card-utils'
import { roundUpDurationMinutes, formatDurationLabel } from './utils'

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
      className: 'border-zinc-700/60 bg-zinc-900 hover:border-zinc-600',
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
      className={`relative w-full cursor-grab overflow-hidden rounded-[9px] border border-zinc-700/60 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-[0.62rem] py-[0.62rem] shadow-[0_8px_20px_rgba(0,0,0,0.24)] transition-colors hover:border-zinc-600 ${isDragging ? 'opacity-40' : ''}`}
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
