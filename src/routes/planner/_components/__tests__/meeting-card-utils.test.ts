import { describe, it, expect } from 'vitest'
import {
  getMeetingProviderBadge,
  getMeetingProviderLabel,
  getParticipantInitials,
  getParticipantSummary,
  getParticipantsLabel,
  isMeetingJoinWindow,
  splitVisibleParticipants,
} from '../task-cards/variants/meeting/utils'

describe('meeting-card-utils', () => {
  it('uses aligned provider label and badge descriptors', () => {
    expect(getMeetingProviderLabel('google')).toBe('Google Meet')
    expect(getMeetingProviderBadge('google')).toEqual({
      shortLabel: 'G',
      className: 'border-emerald-300 bg-emerald-100 text-emerald-700',
    })

    expect(getMeetingProviderLabel('zoom')).toBe('Zoom Meeting')
    expect(getMeetingProviderBadge('zoom')).toEqual({
      shortLabel: 'Z',
      className: 'border-blue-300 bg-blue-100 text-blue-700',
    })

    expect(getMeetingProviderLabel(null)).toBe('Meeting')
    expect(getMeetingProviderBadge(null)).toEqual({
      shortLabel: 'M',
      className: 'border-zinc-300 bg-zinc-100 text-zinc-700',
    })
  })
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

  it('builds a participant summary in one pass', () => {
    const summary = getParticipantSummary([
      { id: 'u1', name: 'Alice' },
      { id: 'u2', name: 'Bob' },
      { id: 'u3', name: 'Carol' },
    ])

    expect(summary.visible.map((p) => p.name)).toEqual(['Alice', 'Bob', 'Carol'])
    expect(summary.overflowCount).toBe(0)
    expect(summary.label).toBe('Alice, Bob +1')
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
