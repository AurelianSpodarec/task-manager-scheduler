import type { PointerEvent, ReactNode, RefObject } from 'react'
import type { CalendarDragData } from '../../dnd'
import { useCalendarDragSource, useCalendarDropTarget } from '../../hooks/use-dnd-behaviors'

type DragSourceChildArgs<T extends HTMLElement> = {
  ref: RefObject<T | null>
  isDragging: boolean
  onPointerDown: (event: PointerEvent<T>) => void
}

type CalendarDragSourcePrimitiveProps<T extends HTMLElement> = {
  createDragData: (args: { element: T; event: PointerEvent<T> }) => CalendarDragData
  children: (args: DragSourceChildArgs<T>) => ReactNode
  disabled?: boolean
  onDragStart?: () => void
  onDrop?: () => void
}

export function CalendarDragSourcePrimitive<T extends HTMLElement>({
  createDragData,
  children,
  disabled,
  onDragStart,
  onDrop,
}: CalendarDragSourcePrimitiveProps<T>) {
  const behavior = useCalendarDragSource<T>({
    createDragData,
    disabled,
    onDragStart,
    onDrop,
  })
  return <>{children(behavior)}</>
}

type DropTargetChildArgs<T extends HTMLElement> = {
  ref: RefObject<T | null>
  isOver: boolean
}

type CalendarDropTargetPrimitiveProps<T extends HTMLElement, TData extends Record<string, unknown>> = {
  getData: () => TData
  children: (args: DropTargetChildArgs<T>) => ReactNode
  canDrop?: (sourceData: Record<string, unknown>) => boolean
  enabled?: boolean
}

export function CalendarDropTargetPrimitive<T extends HTMLElement, TData extends Record<string, unknown>>({
  getData,
  children,
  canDrop,
  enabled,
}: CalendarDropTargetPrimitiveProps<T, TData>) {
  const behavior = useCalendarDropTarget<T, TData>({
    getData,
    canDrop,
    enabled,
  })
  return <>{children(behavior)}</>
}
