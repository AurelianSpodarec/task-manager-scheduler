import { makeSlotData, isCalendarDrag } from '../../dnd'
import { startSelection, updateSelection, isSelectionActive, useIsCellSelected } from '../../calendar-store'
import { useCalendarDropTarget } from '../../hooks/use-dnd-behaviors'

type DroppableSlotProps = {
  isoDay: string
  hour: number
  minute: number
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
  isDragging,
  isOffHours,
  height,
  showHourBorder,
  showHalfBorder,
}: DroppableSlotProps) {
  const { ref, isOver } = useCalendarDropTarget<HTMLDivElement, ReturnType<typeof makeSlotData>>({
    enabled: isDragging,
    canDrop: isCalendarDrag,
    getData: () => makeSlotData(isoDay, hour, minute),
  })

  const selected = useIsCellSelected(isoDay, hour, minute)

  return (
    <div
      ref={ref}
      className={`cal-slot ${isDragging ? 'transition-none' : 'transition-colors'} ${
        showHourBorder ? 'border-b border-cal-grid-line' : showHalfBorder ? 'border-b border-dotted border-cal-grid-line' : ''
      } ${isOver ? 'bg-cal-hover-bg' : selected ? 'bg-cal-cell-selected-bg' : isOffHours ? 'bg-cal-offhours-bg' : ''}`}
      style={{ height: `${height}px` }}
      onMouseDown={(e) => startSelection({ isoDay, hour, minute }, e.nativeEvent)}
      onMouseEnter={() => { if (isSelectionActive()) updateSelection({ isoDay, hour, minute }) }}
    />
  )
}
