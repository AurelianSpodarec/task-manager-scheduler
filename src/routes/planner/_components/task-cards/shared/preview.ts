import type { DragRenderState } from '@/features/calendar'

export const MIN_DRAG_PREVIEW_WIDTH = 224

export function getDragPreviewWidth(drag: DragRenderState): number {
  return Math.max(drag.elementSize.width, MIN_DRAG_PREVIEW_WIDTH)
}
