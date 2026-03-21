import { describe, it, expect, vi } from 'vitest'
import { formatDurationLabel, roundUpDurationMinutes } from '../task-cards/shared/duration'

vi.mock('@/features/calendar', () => ({
  getSlotDuration: () => 15,
}))

describe('formatDurationLabel', () => {
  it.each([
    [60, '1:00h'],
    [90, '1:30h'],
    [125, '2:05h'],
    [15, '0:15h'],
    [0, '0:00h'],
    [150, '2:30h'],
  ])('formats %i minutes as "%s"', (input, expected) => {
    expect(formatDurationLabel(input)).toBe(expected)
  })
})

describe('roundUpDurationMinutes', () => {
  it('rounds up to the nearest slot boundary (15 min)', () => {
    expect(roundUpDurationMinutes(10)).toBe(15)
    expect(roundUpDurationMinutes(16)).toBe(30)
    expect(roundUpDurationMinutes(30)).toBe(30)
    expect(roundUpDurationMinutes(31)).toBe(45)
  })

  it('clamps to at least one slot for zero/negative input', () => {
    expect(roundUpDurationMinutes(0)).toBe(15)
    expect(roundUpDurationMinutes(-5)).toBe(15)
  })

  it('falls back to 60 for NaN/Infinity', () => {
    expect(roundUpDurationMinutes(NaN)).toBe(60)
    expect(roundUpDurationMinutes(Infinity)).toBe(60)
  })
})
