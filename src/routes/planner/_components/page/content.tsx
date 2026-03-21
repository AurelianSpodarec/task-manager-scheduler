import { Schedule } from '@/features/calendar'
import { renderDragPreview } from '../task-cards/render-drag-preview'
import {
  handlePlannerEventDrop,
  handlePlannerEventIconClick,
  handlePlannerEventRemove,
} from './handlers'

export function PlannerContent() {
  return (
    <Schedule
      defaultView="week"
      withEventsDragAndDrop
      renderDragPreview={renderDragPreview}
      onEventDrop={handlePlannerEventDrop}
      onEventRemove={(eventId) => handlePlannerEventRemove(eventId)}
      onEventIconClick={(eventId, event) => {
        handlePlannerEventIconClick(eventId, event.currentTarget as HTMLElement)
      }}
      showSettingsPanel={false}
    />
  )
}
