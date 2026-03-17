import { CalendarShell } from '@/features/calendar'
import { getTask } from '@/database/db'
import {
  scheduleTask,
  moveScheduledTask,
  spawnScheduledTask,
  unscheduleTask,
  deleteScheduledTask,
  toggleTaskStatus,
} from '@/services/task-service'
import { fireConfetti } from '@/lib/confetti'
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
        onIconClick: (id, e) => {
          const status = toggleTaskStatus(id)
          if (status === 'completed') {
            const rect = e.currentTarget.getBoundingClientRect()
            fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, {
              style: 'party',
              physics: 'floaty',
              shot: 'pop',
              burstCount: 22,
              scalar: 0.45,
              distanceScale: 0.52,
            })
          }
        },
      },
    }} showSettingsPanel={false} />
  )
}
