import { describe, it, expect } from 'vitest'
import { renderAsync, screen } from '@/test-utils'
import { TaskCardContent } from '../task-cards/variants/work/content'

const baseProps = {
  title: 'Brand Refresh Workshop',
  durationLabel: '2:00h',
  clientName: 'Laser Red',
  dueDateLabel: 'Mar 18' as string | null,
  priorityBorderColor: '#f59e0b',
  isRecurring: false,
}

describe('TaskCardContent', () => {
  it('renders title, duration, and client name', async () => {
    await renderAsync(<TaskCardContent {...baseProps} />)
    expect(screen.getByText('Brand Refresh Workshop')).toBeInTheDocument()
    expect(screen.getByText('2:00h')).toBeInTheDocument()
    expect(screen.getByText('Laser Red')).toBeInTheDocument()
  })

  it('renders due date when provided', async () => {
    await renderAsync(<TaskCardContent {...baseProps} dueDateLabel="Mar 18" />)
    expect(screen.getByText('Due on Mar 18')).toBeInTheDocument()
  })

  it('omits due date when null', async () => {
    await renderAsync(<TaskCardContent {...baseProps} dueDateLabel={null} />)
    expect(screen.queryByText(/Due on/)).not.toBeInTheDocument()
  })

  it('shows "Recurring" badge for standard recurring type', async () => {
    await renderAsync(<TaskCardContent {...baseProps} isRecurring recurringType="standard" />)
    expect(screen.getByText('Recurring')).toBeInTheDocument()
  })

  it('shows "Retainer" badge for retainer recurring type', async () => {
    await renderAsync(<TaskCardContent {...baseProps} isRecurring recurringType="retainer" />)
    expect(screen.getByText('Retainer')).toBeInTheDocument()
  })

  it('hides recurring badge when isRecurring is false', async () => {
    await renderAsync(<TaskCardContent {...baseProps} isRecurring={false} />)
    expect(screen.queryByText('Recurring')).not.toBeInTheDocument()
    expect(screen.queryByText('Retainer')).not.toBeInTheDocument()
  })
})
