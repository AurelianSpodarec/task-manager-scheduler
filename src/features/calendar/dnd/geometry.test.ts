import { afterEach, describe, expect, it } from 'vitest'
import { applyConfig, setSlotDuration } from '../config'
import { cacheColumnRects, clearColumnRects, resolveSnapDay, resolveSlotFromPointer } from './geometry'

type RectShape = { left: number; right: number; top: number; bottom: number }

function setRect(el: HTMLElement, rect: RectShape) {
  const width = rect.right - rect.left
  const height = rect.bottom - rect.top
  el.getBoundingClientRect = () => ({
    x: rect.left,
    y: rect.top,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    width,
    height,
    toJSON: () => ({}),
  }) as DOMRect
}

function addDayColumn(isoDay: string, rect: RectShape) {
  const el = document.createElement('div')
  el.dataset.date = isoDay
  setRect(el, rect)
  document.body.appendChild(el)
}

function toMinutes(slot: ReturnType<typeof resolveSlotFromPointer>) {
  if (!slot) return null
  return slot.hour * 60 + slot.minute
}

afterEach(() => {
  clearColumnRects()
  document.body.innerHTML = ''
  setSlotDuration(15)
  applyConfig({ dayStartHour: 0 })
})

describe('geometry slot snapping', () => {
  it('requires deeper downward movement before switching to the next timed slot', () => {
    setSlotDuration(15)
    applyConfig({ dayStartHour: 0 })
    addDayColumn('2026-03-16', { left: 0, right: 120, top: 100, bottom: 1200 })
    cacheColumnRects()

    expect(toMinutes(resolveSlotFromPointer(60, 103))).toBe(0)
    expect(toMinutes(resolveSlotFromPointer(60, 116))).toBe(0)
    expect(toMinutes(resolveSlotFromPointer(60, 121))).toBe(15)
  })

  it('requires deeper upward movement before switching to the previous timed slot', () => {
    setSlotDuration(15)
    applyConfig({ dayStartHour: 0 })
    addDayColumn('2026-03-16', { left: 0, right: 120, top: 100, bottom: 1200 })
    cacheColumnRects()

    expect(toMinutes(resolveSlotFromPointer(60, 124))).toBe(15)
    expect(toMinutes(resolveSlotFromPointer(60, 112))).toBe(15)
    expect(toMinutes(resolveSlotFromPointer(60, 106))).toBe(0)
  })
})

describe('geometry day snapping', () => {
  it('keeps existing horizontal snap behavior for day transitions', () => {
    addDayColumn('2026-03-16', { left: 0, right: 100, top: 100, bottom: 1200 })
    addDayColumn('2026-03-17', { left: 100, right: 200, top: 100, bottom: 1200 })
    addDayColumn('2026-03-18', { left: 200, right: 300, top: 100, bottom: 1200 })
    cacheColumnRects()

    expect(resolveSnapDay(50)).toBe('2026-03-16')
    expect(resolveSnapDay(95)).toBe('2026-03-17')
  })
})
