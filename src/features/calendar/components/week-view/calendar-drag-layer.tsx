import { addMinutes, setHours, setMinutes } from 'date-fns'
import { useCalendarEvents, useDragRender } from '../../calendar-store'
import { EVENT_COLOR_MAP } from '../../constants'
import { formatEventTime, startOfDay } from '../../utils/date'

export function CalendarDragLayer() {
  const dragRender = useDragRender()
  const events = useCalendarEvents()

  if (dragRender?.source !== 'calendar' || !dragRender.eventId) return null

  const event = events.find((item) => item.id === dragRender.eventId)
  if (!event) return null

  const colors = EVENT_COLOR_MAP[event.color]
  const left = dragRender.pointer.clientX - dragRender.pointerOffset.x
  const top = dragRender.pointer.clientY - dragRender.pointerOffset.y
  const width = Math.max(dragRender.elementSize.width, 120)
  const height = Math.max(dragRender.elementSize.height, 20)

  const durationMinutes =
    dragRender.durationMinutes ??
    Math.max(1, Math.round((event.end.getTime() - event.start.getTime()) / 60000))

  const slotStart = dragRender.slot
    ? setMinutes(
        setHours(startOfDay(new Date(dragRender.slot.isoDay)), dragRender.slot.hour),
        dragRender.slot.minute,
      )
    : null

  const previewStart = slotStart ?? event.start
  const previewEnd = slotStart ? addMinutes(slotStart, durationMinutes) : event.end

  return (
    <div
      className="pointer-events-none fixed z-[80] flex select-none flex-col overflow-hidden rounded-[var(--cal-radius-event)] border-l-[3px] px-[var(--cal-event-padding-x)] py-[var(--cal-event-padding-y)] shadow-[0_14px_28px_rgba(0,0,0,0.18)] ring-1 ring-white/35"
      style={{
        left,
        top,
        width,
        height,
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
      aria-hidden="true"
    >
      <span className="min-w-0 truncate text-[var(--cal-text-xs)] font-semibold leading-tight">
        {event.title}
      </span>
      <span className="mt-auto text-[var(--cal-text-2xs)] leading-tight opacity-95">
        {formatEventTime(previewStart)} - {formatEventTime(previewEnd)}
      </span>
    </div>
  )
}
