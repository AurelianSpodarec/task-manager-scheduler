import { Schedule } from '@/features/calendar'
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
function parseDateTime(value: string): Date {
  return new Date(value.replace(' ', 'T'))
}

export function PlannerContent() {
  return (
    <Schedule
      defaultView="week"
      withEventsDragAndDrop
      renderDragPreview={renderDragPreview}
      onEventDrop={(id, newStart, newEnd, event) => {
        const task = getTask(String(id))
        if (!task) return
        const start = parseDateTime(newStart)
        const end = parseDateTime(newEnd)
        const allDay = Boolean(event.isAllDay)

        if (task.schedule != null) {
          moveScheduledTask(task.id, start, end, allDay)
          return
        }
        if (task.type === 'personal') {
          spawnScheduledTask(task.id, start, end, allDay)
          return
        }
        scheduleTask(task.id, start, end, allDay)
      }}
      onEventRemove={(id) => {
        const task = getTask(String(id))
        if (!task) return
        if (task.personalActivityType) {
          deleteScheduledTask(task.id)
          return
        }
        unscheduleTask(task.id)
      }}
      onEventIconClick={(id, e) => {
        const status = toggleTaskStatus(String(id))
        if (status === 'completed') {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
          fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, {
            style: 'party',
            physics: 'floaty',
            shot: 'pop',
            burstCount: 22,
            scalar: 0.45,
            distanceScale: 0.52,
          })
        }
      }}
      showSettingsPanel={false}
    />
  )
}
