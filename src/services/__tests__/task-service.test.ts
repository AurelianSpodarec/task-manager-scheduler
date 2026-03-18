import { afterEach, describe, it, expect, vi } from 'vitest'
import {
  toCalendarEvent,
  moveScheduledTask,
  scheduleTask,
  unscheduleTask,
  getSidebarTasksTabTasksSnapshot,
  toggleTaskStatus,
} from '../task-service'
import { getTask, upsertTask, deleteTask } from '@/database/db'
import type { Task } from '@/database/schema'
import type { EventPriority } from '@/types/shared'

type PersonalActivityType = 'schoolRun' | 'lunch' | 'dentist' | 'driving' | 'gym'

function makeWorkTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'w-1',
    title: 'Test Task',
    type: 'work',
    durationMinutes: 60,
    priority: 'medium',
    status: 'pending',
    color: 'teal',
    clientName: 'Acme',
    schedule: { start: '2026-03-16T10:00:00.000Z', end: '2026-03-16T11:00:00.000Z', isAllDay: false },
    ...overrides,
  }
}

function makePersonalTask(activityType: PersonalActivityType): Task {
  return {
    id: `p-${activityType}`,
    title: activityType,
    type: 'personal',
    durationMinutes: 60,
    priority: 'none',
    status: 'pending',
    color: 'amber',
    personalActivityType: activityType,
    schedule: { start: '2026-03-16T08:00:00.000Z', end: '2026-03-16T09:00:00.000Z', isAllDay: false },
  }
}

function makeMeetingTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'm-1',
    title: 'Design Jam',
    type: 'meeting',
    durationMinutes: 90,
    priority: 'none',
    status: 'pending',
    color: 'blue',
    meetingProvider: 'zoom',
    participants: [
      { id: 'u1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/32?u=alice' },
      { id: 'u2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/32?u=bob' },
      { id: 'u3', name: 'Carol' },
    ],
    schedule: { start: '2026-03-16T11:00:00.000Z', end: '2026-03-16T12:30:00.000Z', isAllDay: false },
    ...overrides,
  }
}

describe('toCalendarEvent', () => {
  describe('work tasks', () => {
    it('maps core fields correctly', () => {
      const ev = toCalendarEvent(makeWorkTask())
      expect(ev.id).toBe('w-1')
      expect(ev.title).toBe('Test Task')
      expect(ev.start).toEqual(new Date('2026-03-16T10:00:00.000Z'))
      expect(ev.end).toEqual(new Date('2026-03-16T11:00:00.000Z'))
      expect(ev.isAllDay).toBe(false)
      expect(ev.color).toBe('teal')
    })

    it('provides an icon and an inline style object', () => {
      const ev = toCalendarEvent(makeWorkTask())
      expect(ev.icon).toBeDefined()
      expect(ev.style).toBeDefined()
    })

    it('uses a different icon for pending vs completed', () => {
      const pending = toCalendarEvent(makeWorkTask({ status: 'pending' }))
      const completed = toCalendarEvent(makeWorkTask({ status: 'completed' }))
      expect(pending.icon).not.toBe(completed.icon)
    })

    it('maps completed visual state contract for calendar events', () => {
      const pending = toCalendarEvent(makeWorkTask({ status: 'pending' }))
      const completed = toCalendarEvent(makeWorkTask({ status: 'completed' }))
      expect(pending.isCompleted).toBe(false)
      expect(completed.isCompleted).toBe(true)
      expect(pending.className).toContain('border-zinc-200')
      expect(completed.className).toContain('border-zinc-200')
    })

    it('produces a distinct style per priority level', () => {
      const priorities: EventPriority[] = ['none', 'low', 'medium', 'high', 'critical']
      const styles = priorities.map((p) => {
        const ev = toCalendarEvent(makeWorkTask({ priority: p }))
        return JSON.stringify(ev.style)
      })
      expect(new Set(styles).size).toBe(priorities.length)
    })
  })

  describe('personal tasks', () => {
    const activityTypes: PersonalActivityType[] = ['schoolRun', 'lunch', 'dentist', 'driving', 'gym']

    it('has no inline style for personal tasks', () => {
      const ev = toCalendarEvent(makePersonalTask('lunch'))
      expect(ev.style).toBeUndefined()
    })

    it('provides an icon for personal tasks', () => {
      const ev = toCalendarEvent(makePersonalTask('gym'))
      expect(ev.icon).toBeDefined()
    })

    it('produces a distinct className per activity type', () => {
      const classNames = activityTypes.map((t) => toCalendarEvent(makePersonalTask(t)).className)
      classNames.forEach((c) => expect(c).toBeTruthy())
      expect(new Set(classNames).size).toBe(activityTypes.length)
    })

    it('produces a distinct icon per activity type', () => {
      const icons = activityTypes.map((t) => toCalendarEvent(makePersonalTask(t)).icon)
      expect(new Set(icons).size).toBe(activityTypes.length)
    })
  })

  describe('meeting tasks', () => {
    it('maps meeting metadata for provider and participants', () => {
      const ev = toCalendarEvent(makeMeetingTask())
      expect(ev.meetingMeta).toEqual({
        provider: 'zoom',
        participants: [
          { id: 'u1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/32?u=alice' },
          { id: 'u2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/32?u=bob' },
          { id: 'u3', name: 'Carol' },
        ],
      })
    })

    it('falls back to empty participants and null provider when meeting fields are absent', () => {
      const ev = toCalendarEvent(makeMeetingTask({ meetingProvider: undefined, participants: undefined }))
      expect(ev.meetingMeta).toEqual({
        provider: null,
        participants: [],
      })
    })

    it('marks meeting events completed when scheduled end is elapsed', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-16T13:00:00.000Z'))
      const ev = toCalendarEvent(makeMeetingTask({
        status: 'pending',
        schedule: { start: '2026-03-16T11:00:00.000Z', end: '2026-03-16T12:30:00.000Z', isAllDay: false },
      }))
      expect(ev.isCompleted).toBe(true)
      vi.useRealTimers()
    })

    it('keeps meeting events pending when scheduled end is in the future', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-16T12:00:00.000Z'))
      const ev = toCalendarEvent(makeMeetingTask({
        status: 'completed',
        schedule: { start: '2026-03-16T12:15:00.000Z', end: '2026-03-16T13:00:00.000Z', isAllDay: false },
      }))
      expect(ev.isCompleted).toBe(false)
      vi.useRealTimers()
    })
  })
})

describe('getSidebarTasksTabTasksSnapshot', () => {
  it('returns only unscheduled work and meeting tasks', () => {
    const tasks = getSidebarTasksTabTasksSnapshot()

    expect(tasks.length).toBeGreaterThan(0)
    expect(tasks.every((task) => task.schedule == null)).toBe(true)
    expect(tasks.every((task) => task.type === 'work' || task.type === 'meeting')).toBe(true)
    expect(tasks.some((task) => task.type === 'meeting')).toBe(true)
    expect(tasks.some((task) => task.id === 'live-design-jam-scheduled')).toBe(false)
  })

  it('removes a meeting template from Tasks-tab list when scheduled, then restores on unschedule', () => {
    const meetingId = 'live-design-jam-template'
    const start = new Date('2026-03-18T10:00:00.000Z')
    const end = new Date('2026-03-18T11:30:00.000Z')

    expect(getSidebarTasksTabTasksSnapshot().some((task) => task.id === meetingId)).toBe(true)

    scheduleTask(meetingId, start, end, false)
    expect(getSidebarTasksTabTasksSnapshot().some((task) => task.id === meetingId)).toBe(false)

    unscheduleTask(meetingId)
    expect(getSidebarTasksTabTasksSnapshot().some((task) => task.id === meetingId)).toBe(true)
  })
})

describe('moveScheduledTask', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('marks a pending personal task completed when moved into elapsed time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-17T12:00:00.000Z'))
    const id = 'personal-retro-completion-test'
    upsertTask({
      ...makePersonalTask('gym'),
      id,
      schedule: { start: '2026-03-17T14:00:00.000Z', end: '2026-03-17T15:00:00.000Z', isAllDay: false },
    })

    moveScheduledTask(
      id,
      new Date('2026-03-17T09:00:00.000Z'),
      new Date('2026-03-17T10:00:00.000Z'),
      false,
    )

    expect(getTask(id)?.status).toBe('completed')
    deleteTask(id)
  })

  it('keeps work tasks pending when moved into elapsed time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-17T12:00:00.000Z'))
    const id = 'work-retro-completion-test'
    upsertTask({
      ...makeWorkTask(),
      id,
      schedule: { start: '2026-03-17T14:00:00.000Z', end: '2026-03-17T15:00:00.000Z', isAllDay: false },
    })

    moveScheduledTask(
      id,
      new Date('2026-03-17T09:00:00.000Z'),
      new Date('2026-03-17T10:00:00.000Z'),
      false,
    )

    expect(getTask(id)?.status).toBe('pending')
    deleteTask(id)
  })

  it('sets meeting status from elapsed schedule position only', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-17T12:00:00.000Z'))
    const id = 'meeting-retro-completion-test'
    upsertTask({
      ...makeMeetingTask(),
      id,
      status: 'completed',
      schedule: { start: '2026-03-17T09:00:00.000Z', end: '2026-03-17T10:00:00.000Z', isAllDay: false },
    })

    moveScheduledTask(
      id,
      new Date('2026-03-17T14:00:00.000Z'),
      new Date('2026-03-17T15:00:00.000Z'),
      false,
    )
    expect(getTask(id)?.status).toBe('pending')

    moveScheduledTask(
      id,
      new Date('2026-03-17T10:00:00.000Z'),
      new Date('2026-03-17T11:00:00.000Z'),
      false,
    )
    expect(getTask(id)?.status).toBe('completed')

    deleteTask(id)
  })
})

describe('toggleTaskStatus', () => {
  it('does not allow manual toggles for meeting tasks', () => {
    const id = 'meeting-toggle-disabled-test'
    upsertTask({
      ...makeMeetingTask(),
      id,
      status: 'pending',
    })

    const next = toggleTaskStatus(id)
    expect(next).toBeNull()
    expect(getTask(id)?.status).toBe('pending')

    deleteTask(id)
  })
})
