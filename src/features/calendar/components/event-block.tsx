import { useCallback, useEffect, useState } from 'react'
import type { EventLayoutRect } from '../types'
import { makeEventDragData } from '../dnd'
import { useFormatTime } from '../hooks/use-format-time'
import { getConfig } from '../config'
import { useCalendarDragSource } from '../hooks/use-dnd-behaviors'
import { useDragState } from '../calendar-store'

type EventBlockProps = {
  layout: EventLayoutRect
}

function getMeetingProviderLabel(provider: 'google' | 'zoom' | null): string {
  if (provider === 'google') return 'Google Meet'
  if (provider === 'zoom') return 'Zoom'
  return 'Meeting'
}

function getMeetingProviderBadge(provider: 'google' | 'zoom' | null): { shortLabel: string; className: string } {
  if (provider === 'google') {
    return { shortLabel: 'G', className: 'border-emerald-300 bg-emerald-100 text-emerald-700' }
  }
  if (provider === 'zoom') {
    return { shortLabel: 'Z', className: 'border-blue-300 bg-blue-100 text-blue-700' }
  }
  return { shortLabel: 'M', className: 'border-zinc-300 bg-zinc-100 text-zinc-700' }
}

function getParticipantInitials(name: string): string {
  const tokens = name.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return 'NA'
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase()
  return `${tokens[0][0] ?? ''}${tokens[1][0] ?? ''}`.toUpperCase()
}

/**
 * Pure layout shell — positions the event in the grid and handles drag initiation.
 * All visual treatment (borders, icons, colors) comes from the consumer via
 * event.className / event.style / event.icon.
 */
export function EventBlock({ layout }: EventBlockProps) {
  const { event, column, totalColumns, top, height } = layout
  const eventDurationMinutes = Math.max(1, Math.ceil((event.end.getTime() - event.start.getTime()) / 60_000))
  const isFifteenMinuteEvent = eventDurationMinutes <= 15
  const isCompact = height < 40
  const isCompleted = Boolean(event.isCompleted)
  const isPersonalEvent = event.style == null && event.meetingMeta == null
  const meetingMeta = event.meetingMeta
  const providerLabel = meetingMeta ? getMeetingProviderLabel(meetingMeta.provider) : null
  const providerBadge = meetingMeta ? getMeetingProviderBadge(meetingMeta.provider) : null
  const participants = meetingMeta?.participants ?? []
  const visibleParticipants = participants.slice(0, isCompact ? 1 : 2)
  const overflowParticipants = Math.max(0, participants.length - visibleParticipants.length)
  const showMeetingMeta = meetingMeta != null
  const [justCompleted, setJustCompleted] = useState(false)

  // Release GPU compositing layers created by the checkmark fill-mode animations
  useEffect(() => {
    if (!justCompleted) return
    const id = setTimeout(() => setJustCompleted(false), 350)
    return () => clearTimeout(id)
  }, [justCompleted])

  const { formatEventTime } = useFormatTime()
  const Icon = event.icon
  const dragState = useDragState()
  const { ref, isDragging, onPointerDown } = useCalendarDragSource<HTMLButtonElement>({
    createDragData: ({ element, event: pointerEvent }) => ({
      ...makeEventDragData(event),
      grabOffsetY: Math.max(0, pointerEvent.clientY - element.getBoundingClientRect().top),
    }),
  })
  const isSourceDragging = dragState?.source === 'calendar' && dragState.eventId === event.id
  const isCardDragging = isDragging || isSourceDragging

  const onStatusPointerDown = useCallback((e: React.PointerEvent<HTMLSpanElement>) => {
    e.stopPropagation()
  }, [])

  const onStatusClick = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    setJustCompleted(!isCompleted)
    getConfig().eventHandlers.onIconClick?.(event.id, e)
  }, [event.id, isCompleted])

  const widthPercent = 100 / totalColumns
  const leftPercent = column * widthPercent
  const horizontalInsetPx = 2
  const verticalInsetPx = 2
  const renderedHeightPx = Math.max(height - verticalInsetPx * 2, 16)

  return (
    <button
      ref={ref}
      onPointerDown={onPointerDown}
      className={`group/event absolute z-10 flex cursor-grab active:cursor-grabbing flex-row ${isCompact ? 'items-center' : 'items-start'} gap-1.5 overflow-hidden rounded-[7px] border px-2 ${isFifteenMinuteEvent ? 'py-[2px]' : 'py-[5px]'} text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[opacity,color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cal-focus-ring)] ${event.className ?? 'border-zinc-200 bg-white hover:border-zinc-300'} ${isCompleted ? 'opacity-60' : 'opacity-100'} ${isCardDragging ? 'pointer-events-none' : ''}`}
      style={{
        top: `${top + verticalInsetPx}px`,
        height: `${renderedHeightPx}px`,
        width: `calc(${widthPercent}% - ${horizontalInsetPx * 2}px)`,
        left: `calc(${leftPercent}% + ${horizontalInsetPx}px)`,
        ...event.style,
        opacity: isCardDragging ? 0.2 : undefined,
      }}
      aria-label={`${event.title}${providerLabel ? `, ${providerLabel}` : ''}, ${formatEventTime(event.start)} to ${formatEventTime(event.end)}`}
    >
      {Icon && (
        <span
          onPointerDown={onStatusPointerDown}
          onClick={onStatusClick}
          className="relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[4px]"
          aria-label={`${event.title} action`}
        >
          <Icon
            aria-hidden="true"
            className={`${isPersonalEvent ? 'size-[14px]' : 'size-3.5'} shrink-0`}
            animate={justCompleted && isCompleted}
          />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          data-completed={isCompleted}
          className={`completion-title relative block min-w-0 font-semibold leading-tight ${isCompact ? 'text-[9px]' : 'text-[11px]'} ${isCompleted ? 'text-zinc-500' : 'text-zinc-900'}`}
        >
          <span className="completion-title-strike-wrap truncate">
            <span className="relative z-10">{event.title}</span>
            <span aria-hidden="true" className="completion-title-strike" />
          </span>
        </span>
        {!isCompact && (
          <span className={`block text-[9px] leading-tight transition-colors duration-200 ${isCompleted ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {formatEventTime(event.start)} – {formatEventTime(event.end)}
          </span>
        )}
        {showMeetingMeta && (
          <div className={`mt-[2px] flex min-w-0 items-center ${isCompact ? 'gap-[0.3rem]' : 'gap-1'}`}>
            <div className="min-w-0 flex items-center gap-[0.3rem]">
              {participants.length > 0 && (
                <span className="flex shrink-0 items-center">
                  {visibleParticipants.map((participant, index) => (
                    <span
                      key={participant.id}
                      className={`inline-flex ${isCompact ? 'size-2.5 text-[5px]' : 'size-3 text-[6px]'} items-center justify-center overflow-hidden rounded-full bg-zinc-300 font-semibold text-zinc-700 ring-1 ring-white ${index === 0 ? '' : isCompact ? '-ml-[0.2rem]' : '-ml-[0.22rem]'}`}
                      title={participant.name}
                    >
                      {participant.avatarUrl
                        ? <img src={participant.avatarUrl} alt={participant.name} className="size-full object-cover" />
                        : getParticipantInitials(participant.name)}
                    </span>
                  ))}
                  {overflowParticipants > 0 && (
                    <span className={`inline-flex ${isCompact ? 'size-2.5 text-[5px] -ml-[0.2rem]' : 'size-3 text-[6px] -ml-[0.22rem]'} items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 font-semibold text-zinc-700 ring-1 ring-white`}>
                      +{overflowParticipants}
                    </span>
                  )}
                </span>
              )}
              <span className={`truncate font-medium ${isCompact ? 'text-[7px]' : 'text-[8px]'} ${isCompleted ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {providerLabel}
              </span>
            </div>
            {providerBadge && (
              <span className={`ml-auto inline-flex size-3 shrink-0 items-center justify-center rounded-full border text-[6px] font-semibold ${providerBadge.className}`}>
                {providerBadge.shortLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
