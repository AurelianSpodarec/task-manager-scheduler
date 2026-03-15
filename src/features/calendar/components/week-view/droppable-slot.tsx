import { useRef, useEffect, useState } from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { makeSlotData, isCalendarDrag } from '../../dnd'

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

  useEffect(() => {
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
  }, [isoDay, hour, minute])

  return (
    <div
      ref={ref}
      className={`${isDragging ? 'transition-none' : 'transition-colors'} ${
        showHourBorder ? 'border-b border-cal-grid-line' : showHalfBorder ? 'border-b border-dotted border-cal-grid-line' : ''
      } ${isOver ? 'bg-cal-hover-bg' : isOffHours ? 'bg-cal-offhours-bg' : ''}`}
      style={{ height: `${height}px` }}
    />
  )
}
