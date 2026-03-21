import { afterEach, describe, expect, it, vi } from 'vitest'
import { deleteTask, getAllTasks, getTask, upsertTask } from '@/database/db'
import type { Task } from '@/database/schema'
import { toDate } from '@/features/calendar/utils/schedule'
import {
  handlePlannerEventDrop,
  handlePlannerEventIconClick,
  handlePlannerEventRemove,
} from '../page/handlers'
import { firePlannerCompletionConfetti } from '../shared/completion-confetti'

vi.mock('../shared/completion-confetti', () => ({
  firePlannerCompletionConfetti: vi.fn(),
}))

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'planner-handler-test-work',
    title: 'Work Task',
    type: 'work',
    durationMinutes: 60,
    priority: 'medium',
    status: 'pending',
    color: 'teal',
    schedule: null,
    ...overrides,
  }
}

afterEach(() => {
  vi.clearAllMocks()
  for (const task of getAllTasks()) {
    if (task.id.startsWith('planner-handler-test-')) {
      deleteTask(task.id)
    }
  }
})

describe('planner handlers', () => {
  it('moves an already scheduled task when dropping it again', () => {
    const id = 'planner-handler-test-move'
    upsertTask(makeTask({
      id,
      schedule: {
        start: '2026-03-20T09:00:00.000Z',
        end: '2026-03-20T10:00:00.000Z',
        isAllDay: false,
      },
    }))

    handlePlannerEventDrop(
      id,
      '2026-03-21 11:00:00',
      '2026-03-21 12:00:00',
      { id, title: 'Work Task', start: '', end: '', color: 'teal', isAllDay: false },
    )

    const next = getTask(id)
    expect(next?.schedule?.start).toBe(toDate('2026-03-21 11:00:00').toISOString())
    expect(next?.schedule?.end).toBe(toDate('2026-03-21 12:00:00').toISOString())
  })

  it('spawns a new scheduled copy when dropping a personal template task', () => {
    const id = 'planner-handler-test-personal-template'
    upsertTask(makeTask({
      id,
      title: 'Gym',
      type: 'personal',
      color: 'amber',
      priority: 'none',
      personalActivityType: 'gym',
      schedule: null,
    }))

    handlePlannerEventDrop(
      id,
      '2026-03-21 08:00:00',
      '2026-03-21 09:00:00',
      { id, title: 'Gym', start: '', end: '', color: 'amber', isAllDay: false },
    )

    expect(getTask(id)?.schedule).toBeNull()
    const spawned = getAllTasks().find((task) => task.id.startsWith(`${id}-spawn-`))
    expect(spawned).toBeDefined()
    expect(spawned?.schedule?.start).toBe(toDate('2026-03-21 08:00:00').toISOString())
    expect(spawned?.schedule?.end).toBe(toDate('2026-03-21 09:00:00').toISOString())
  })

  it('removes spawned personal events instead of unscheduling them', () => {
    const id = 'planner-handler-test-personal-spawn'
    upsertTask(makeTask({
      id,
      title: 'Lunch',
      type: 'personal',
      color: 'amber',
      priority: 'none',
      personalActivityType: 'lunch',
      schedule: {
        start: '2026-03-21T12:00:00.000Z',
        end: '2026-03-21T13:00:00.000Z',
        isAllDay: false,
      },
    }))

    handlePlannerEventRemove(id)
    expect(getTask(id)).toBeUndefined()
  })

  it('unschedules non-personal tasks on remove', () => {
    const id = 'planner-handler-test-unschedule'
    upsertTask(makeTask({
      id,
      schedule: {
        start: '2026-03-21T12:00:00.000Z',
        end: '2026-03-21T13:00:00.000Z',
        isAllDay: false,
      },
      status: 'completed',
    }))

    handlePlannerEventRemove(id)
    const next = getTask(id)
    expect(next?.schedule).toBeNull()
    expect(next?.status).toBe('pending')
  })

  it('toggles work-task completion and fires completion confetti on complete', () => {
    const id = 'planner-handler-test-toggle'
    const target = document.createElement('button')
    upsertTask(makeTask({ id, status: 'pending' }))

    handlePlannerEventIconClick(id, target)

    expect(getTask(id)?.status).toBe('completed')
    expect(vi.mocked(firePlannerCompletionConfetti)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(firePlannerCompletionConfetti)).toHaveBeenCalledWith(target)
  })

  it('does not toggle meetings or fire completion confetti', () => {
    const id = 'planner-handler-test-meeting-toggle'
    const target = document.createElement('button')
    upsertTask(makeTask({
      id,
      type: 'meeting',
      color: 'blue',
      priority: 'none',
      schedule: {
        start: '2026-03-21T12:00:00.000Z',
        end: '2026-03-21T13:00:00.000Z',
        isAllDay: false,
      },
      status: 'pending',
    }))

    handlePlannerEventIconClick(id, target)

    expect(getTask(id)?.status).toBe('pending')
    expect(vi.mocked(firePlannerCompletionConfetti)).not.toHaveBeenCalled()
  })
})
