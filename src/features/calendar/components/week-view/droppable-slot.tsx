import { makeSlotData, isCalendarDrag } from '../../dnd'
import { getConfig } from '../../config'
import {
  startSelection,
  updateSelection,
  isSelectionActive,
  useIsCellSelected,
  useMode,
  useExternalEventDrop,
} from '../../calendar-store'
import { useCalendarDropTarget } from '../../hooks/use-dnd-behaviors'
import { formatDateTimeValue } from '../../utils/schedule'

type DroppableSlotProps = {
  isoDay: string
  hour: number
  minute: number
  slotDuration: number
  isDragging: boolean
  isOffHours: boolean
  height: number
  showHourBorder: boolean
  showHalfBorder: boolean
}

export function DroppableSlot({
  isoDay,
  hour,
  minute,
  slotDuration,
  isDragging,
  isOffHours,
  height,
  showHourBorder,
  showHalfBorder,
}: DroppableSlotProps) {
  const mode = useMode()
  const onExternalEventDrop = useExternalEventDrop()
  const { ref, isOver } = useCalendarDropTarget<HTMLDivElement, ReturnType<typeof makeSlotData>>({
    enabled: isDragging && mode !== 'static',
    canDrop: isCalendarDrag,
    getData: () => makeSlotData(isoDay, hour, minute),
  })

  const selected = useIsCellSelected(isoDay, hour, minute)
  const externalDropEnabled = mode !== 'static' && typeof onExternalEventDrop === 'function'
  const dropDate = new Date(`${isoDay}T00:00:00`)
  dropDate.setHours(hour, minute, 0, 0)
  const slotEndDate = new Date(dropDate)
  slotEndDate.setMinutes(slotEndDate.getMinutes() + slotDuration)

  return (
    <div
      ref={ref}
      className={`cal-slot ${isDragging ? 'transition-none' : 'transition-colors'} ${
        showHourBorder ? 'border-b border-cal-grid-line' : showHalfBorder ? 'border-b border-dotted border-cal-grid-line' : ''
      } ${isOver ? 'bg-cal-hover-bg' : selected ? 'bg-cal-cell-selected-bg' : isOffHours ? 'bg-cal-offhours-bg' : ''}`}
      style={{ height: `${height}px` }}
      onMouseDown={(e) => {
        if (mode === 'static') return
        startSelection({ isoDay, hour, minute }, e.nativeEvent)
      }}
      onMouseEnter={() => {
        if (mode === 'static') return
        if (isSelectionActive()) updateSelection({ isoDay, hour, minute })
      }}
      onClick={(e) => {
        if (mode === 'static') return
        getConfig().onTimeSlotClick?.(
          formatDateTimeValue(dropDate),
          formatDateTimeValue(slotEndDate),
          e,
        )
      }}
      onDragOver={(e) => {
        if (!externalDropEnabled) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
      }}
      onDrop={(e) => {
        if (!externalDropEnabled || !onExternalEventDrop) return
        e.preventDefault()
        onExternalEventDrop(e.dataTransfer, formatDateTimeValue(dropDate))
      }}
    />
  )
}
