import type { DragRenderState } from '@/features/calendar'
import type {
  AppDragMeta,
  MeetingDragMeta,
  PersonalDragMeta,
  WorkDragMeta,
} from './shared/drag-meta'
import { TaskDragPreview } from './variants/work/drag-preview'
import { PersonalDragPreview } from './variants/personal/drag-preview'
import { MeetingDragPreview } from './variants/meeting/drag-preview'
const DRAG_PREVIEW_RENDERERS: Record<
  AppDragMeta['kind'],
  (drag: DragRenderState, meta: AppDragMeta) => React.ReactNode
> = {
  task: (drag, meta) => <TaskDragPreview drag={drag} meta={meta as WorkDragMeta} />,
  personal: (drag, meta) => <PersonalDragPreview drag={drag} meta={meta as PersonalDragMeta} />,
  meeting: (drag, meta) => <MeetingDragPreview drag={drag} meta={meta as MeetingDragMeta} />,
}

/** Dispatches to the correct drag preview based on the drag meta kind. */
export function renderDragPreview(drag: DragRenderState): React.ReactNode {
  const meta = drag.dragMeta as AppDragMeta | undefined
  if (!meta) return null
  const renderer = DRAG_PREVIEW_RENDERERS[meta.kind]
  if (renderer) return renderer(drag, meta)
  // Calendar-originating event drags — fall through to the calendar's default preview
  return null
}
