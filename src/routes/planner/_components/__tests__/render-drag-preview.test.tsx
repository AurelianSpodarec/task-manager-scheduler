import { describe, it, expect } from 'vitest'
import { renderAsync, screen } from '@/test-utils'
import { renderDragPreview } from '../task-cards/render-drag-preview'
import type { DragRenderState } from '@/features/calendar'
import type { WorkDragMeta, PersonalDragMeta, MeetingDragMeta } from '../task-cards/shared/drag-meta'

const baseDrag: DragRenderState = {
  source: 'sidebar',
  eventId: 'test-1',
  title: 'Test Event',
  color: 'teal',
  durationMinutes: 60,
  pointer: { clientX: 0, clientY: 0 },
  pointerOffset: { x: 0, y: 0 },
  elementSize: { width: 300, height: 80 },
  slot: null,
  sidebarDropHovered: false,
}

describe('renderDragPreview', () => {
  it('renders TaskDragPreview content for kind "task"', async () => {
    const meta: WorkDragMeta = {
      kind: 'task',
      clientName: 'Acme Corp',
      dueDateLabel: 'Mar 20',
      isRecurring: false,
      durationLabel: '1:00h',
      priorityBorderColor: '#f59e0b',
    }
    const node = renderDragPreview({ ...baseDrag, dragMeta: meta })
    expect(node).not.toBeNull()

    const { container } = await renderAsync(<>{node}</>)
    const preview = container.firstElementChild as HTMLElement
    expect(preview.className).toContain('via-zinc-50')
    expect(preview.className).toContain('to-zinc-100')
    expect(preview.className).not.toContain('via-zinc-50/45')
    expect(preview.className).not.toContain('to-zinc-100/65')
    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('1:00h')).toBeInTheDocument()
  })

  it('renders MeetingDragPreview content for kind "meeting"', async () => {
    const meta: MeetingDragMeta = {
      kind: 'meeting',
      durationLabel: '1:30h',
      timeLabel: '11:00 AM - 12:30 PM',
      provider: 'zoom',
      providerLabel: 'Zoom Meeting',
      participants: [
        { id: 'u1', name: 'Alice' },
        { id: 'u2', name: 'Bob' },
        { id: 'u3', name: 'Carol' },
      ],
    }
    const node = renderDragPreview({ ...baseDrag, dragMeta: meta })
    expect(node).not.toBeNull()

    const { container } = await renderAsync(<>{node}</>)
    const preview = container.firstElementChild as HTMLElement
    expect(preview.className).toContain('via-zinc-50')
    expect(preview.className).toContain('to-zinc-100')
    expect(preview.className).not.toContain('via-zinc-50/45')
    expect(preview.className).not.toContain('to-zinc-100/65')
    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText('11:00 AM - 12:30 PM')).toBeInTheDocument()
    expect(screen.getByText('Alice, Bob +1')).toBeInTheDocument()
  })

  it('renders PersonalDragPreview content for kind "personal"', async () => {
    const meta: PersonalDragMeta = {
      kind: 'personal',
      activityType: 'gym',
      durationLabel: '1:00h',
    }
    const node = renderDragPreview({ ...baseDrag, dragMeta: meta })
    expect(node).not.toBeNull()

    await renderAsync(<>{node}</>)
    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText('1:00h')).toBeInTheDocument()
  })

  it('returns null when dragMeta is undefined (calendar-origin drag)', () => {
    const node = renderDragPreview({ ...baseDrag, source: 'calendar', dragMeta: undefined })
    expect(node).toBeNull()
  })
})
