import { describe, it, expect } from 'vitest'
import { toCalendarEvent } from '../task-service'
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
})
