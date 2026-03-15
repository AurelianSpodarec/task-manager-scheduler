import { CalendarShell } from '@/features/calendar'
import { getTask } from '@/database/db'
import {
  scheduleTask,
  moveScheduledTask,
  spawnScheduledTask,
  unscheduleTask,
  deleteScheduledTask,
} from '@/services/task-service'
import { renderDragPreview } from './drag-previews/render-drag-preview'

export function PlannerContent() {
  return (
    <CalendarShell config={{
      renderDragPreview,
      eventHandlers: {
        onEventDrop: (id, start, end, allDay) => {
          const task = getTask(id)
          if (!task) return
          task.type === 'personal'
            ? spawnScheduledTask(id, start, end, allDay)
            : scheduleTask(id, start, end, allDay)
        },
        onEventMove: moveScheduledTask,
        onEventRemove: (id) => {
          const task = getTask(id)
          task?.personalActivityType
            ? deleteScheduledTask(id)
            : unscheduleTask(id)
        },
      },
    }} />
  )
}
