import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { isCalendarDrag, type CalendarDragData } from '../dnd'
import { startPointerDrag } from '../dnd'
import { useCalendarInstanceId } from '../core/calendar-instance'

type UseCalendarDragSourceOptions<T extends HTMLElement> = {
  createDragData: (args: { element: T; event: PointerEvent<T> }) => CalendarDragData
  disabled?: boolean
  onDragStart?: () => void
  onDrop?: () => void
}

export function useCalendarDragSource<T extends HTMLElement>({
  createDragData,
  disabled = false,
  onDragStart,
  onDrop,
}: UseCalendarDragSourceOptions<T>) {
  const ref = useRef<T>(null)
  const [isDragging, setIsDragging] = useState(false)
  const instanceId = useCalendarInstanceId()

  const onPointerDown = useCallback((event: PointerEvent<T>) => {
    if (disabled || event.button !== 0) return
    event.preventDefault()
    const element = ref.current
    if (!element) return
    const dragData = createDragData({ element, event })
    startPointerDrag(
      element,
      event.nativeEvent,
      dragData,
      {
        onDragStart: () => {
          setIsDragging(true)
          onDragStart?.()
        },
        onDrop: () => {
          setIsDragging(false)
          onDrop?.()
        },
      },
      { instanceId },
    )
  }, [createDragData, disabled, instanceId, onDragStart, onDrop])

  return { ref, isDragging, onPointerDown }
}

type UseCalendarDropTargetOptions<TData extends Record<string, unknown>> = {
  getData: () => TData
  canDrop?: (sourceData: Record<string, unknown>) => boolean
  enabled?: boolean
}
export function useCalendarDropTarget<T extends HTMLElement, TData extends Record<string, unknown>>({
  getData,
  canDrop = isCalendarDrag,
  enabled = true,
}: UseCalendarDropTargetOptions<TData>) {
  const ref = useRef<T>(null)
  const [isOver, setIsOver] = useState(false)

  const resolvedCanDrop = useMemo(() => canDrop, [canDrop])

  useEffect(() => {
    if (!enabled) return
    const element = ref.current
    if (!element) return
    return dropTargetForElements({
      element,
      canDrop: ({ source }) => resolvedCanDrop(source.data),
      getData,
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    })
  }, [enabled, getData, resolvedCanDrop])

  return { ref, isOver }
}
