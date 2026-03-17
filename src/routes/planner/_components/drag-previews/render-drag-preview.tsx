import type { DragRenderState } from '@/features/calendar'
import type { AppDragMeta } from '../types'
import { TaskDragPreview } from './task-drag-preview'
import { PersonalDragPreview } from './personal-drag-preview'
import { MeetingDragPreview } from './meeting-drag-preview'

/** Dispatches to the correct drag preview based on the drag meta kind. */
export function renderDragPreview(drag: DragRenderState): React.ReactNode {
  const meta = drag.dragMeta as AppDragMeta | undefined
  if (meta?.kind === 'task') return <TaskDragPreview drag={drag} meta={meta} />
  if (meta?.kind === 'personal') return <PersonalDragPreview drag={drag} meta={meta} />
  if (meta?.kind === 'meeting') return <MeetingDragPreview drag={drag} meta={meta} />
  // Calendar-originating event drags — fall through to the calendar's default preview
  return null
}
