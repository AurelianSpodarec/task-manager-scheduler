import { describe, it, expect } from 'vitest'
import {
  getParticipantInitials,
  getParticipantsLabel,
  isMeetingJoinWindow,
  splitVisibleParticipants,
} from '../meeting-card-utils'

describe('meeting-card-utils', () => {
  it('limits visible attendees and returns overflow count', () => {
    const result = splitVisibleParticipants([
      { id: 'u1', name: 'Alice' },
      { id: 'u2', name: 'Bob' },
      { id: 'u3', name: 'Carol' },
      { id: 'u4', name: 'Dan' },
      { id: 'u5', name: 'Emma' },
    ])

    expect(result.visible.map((p) => p.name)).toEqual(['Alice', 'Bob', 'Carol'])
    expect(result.overflowCount).toBe(2)
  })

  it('builds a compact participant label', () => {
    expect(getParticipantsLabel([
      { id: 'u1', name: 'Alice' },
      { id: 'u2', name: 'Bob' },
      { id: 'u3', name: 'Carol' },
    ])).toBe('Alice, Bob +1')
  })

  it('derives participant initials for avatar fallbacks', () => {
    expect(getParticipantInitials('Alice Baker')).toBe('AB')
    expect(getParticipantInitials('Kai')).toBe('KA')
  })

  it('returns true only within the 15-minute join window around meeting start', () => {
    const startIso = '2026-03-17T10:00:00.000Z'

    expect(isMeetingJoinWindow(startIso, new Date('2026-03-17T09:44:59.000Z'))).toBe(false)
    expect(isMeetingJoinWindow(startIso, new Date('2026-03-17T09:45:00.000Z'))).toBe(true)
    expect(isMeetingJoinWindow(startIso, new Date('2026-03-17T10:15:00.000Z'))).toBe(true)
    expect(isMeetingJoinWindow(startIso, new Date('2026-03-17T10:15:01.000Z'))).toBe(false)
  })
})
