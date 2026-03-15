import { useRef, useEffect, useState } from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { makeSlotData, isCalendarDrag } from '../../dnd'
import { startSelection, updateSelection, isSelectionActive, useIsCellSelected } from '../../calendar-store'

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
  const ref = useRef<HTMLDivElement>(null)
  const [isOver, setIsOver] = useState(false)

  // Only register the drop target while a drag is active — avoids 672 idle
  // Pragmatic DnD subscriptions when nobody is dragging.
  useEffect(() => {
    if (!isDragging) return
    const el = ref.current
    if (!el) return
    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => isCalendarDrag(source.data),
      getData: () => makeSlotData(isoDay, hour, minute),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    })
  }, [isoDay, hour, minute, isDragging])

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
