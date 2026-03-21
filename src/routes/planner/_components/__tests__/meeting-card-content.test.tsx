import { describe, it, expect } from 'vitest'
import { renderAsync, screen } from '@/test-utils'
import { MeetingCardContent } from '../task-cards/variants/meeting/content'

const attendees = [
  { id: 'u1', name: 'Alice' },
  { id: 'u2', name: 'Bob' },
  { id: 'u3', name: 'Carol' },
  { id: 'u4', name: 'Dan' },
  { id: 'u5', name: 'Emma' },
]

describe('MeetingCardContent', () => {
  it('renders title, time label, and compact attendee text', async () => {
    await renderAsync(
      <MeetingCardContent
        title="Design Jam"
        timeLabel="11:00 AM - 12:30 PM"
        provider="zoom"
        participants={attendees.slice(0, 3)}
        showJoinAction={false}
      />,
    )

    expect(screen.getByText('Design Jam')).toBeInTheDocument()
    expect(screen.getByText('11:00 AM - 12:30 PM')).toBeInTheDocument()
    expect(screen.getByText('Alice, Bob +1')).toBeInTheDocument()
  })

  it('shows attendee overflow chip when more than 3 people exist', async () => {
    await renderAsync(
      <MeetingCardContent
        title="Roadmap Review"
        timeLabel="1:00 PM - 2:15 PM"
        provider="zoom"
        participants={attendees}
        showJoinAction={false}
      />,
    )

    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('falls back to provider label when there are no attendees', async () => {
    await renderAsync(
      <MeetingCardContent
        title="Office Hours"
        timeLabel="45m"
        provider="google"
        participants={[]}
        showJoinAction={false}
      />,
    )

    expect(screen.getByText('Google Meet')).toBeInTheDocument()
  })

  it('hides Join action when disabled', async () => {
    await renderAsync(
      <MeetingCardContent
        title="Live Sync"
        timeLabel="9:00 AM - 9:30 AM"
        provider="zoom"
        participants={attendees.slice(0, 2)}
        showJoinAction={false}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Join' })).not.toBeInTheDocument()
  })

  it('shows Join action when enabled', async () => {
    await renderAsync(
      <MeetingCardContent
        title="Live Sync"
        timeLabel="9:00 AM - 9:30 AM"
        provider="zoom"
        participants={attendees.slice(0, 2)}
        showJoinAction
      />,
    )

    expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument()
  })
})
