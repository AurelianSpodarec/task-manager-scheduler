import { describe, it, expect } from 'vitest'
import { renderAsync, screen } from '@/test-utils'
import { PersonalCardContent } from '../task-cards/variants/personal/content'
import type { PersonalActivityType } from '@/lib/personal-activity'

describe('PersonalCardContent', () => {
  it('renders title and duration label', async () => {
    await renderAsync(<PersonalCardContent title="Lunch" durationLabel="1:00h" activityType="lunch" />)
    expect(screen.getByText('Lunch')).toBeInTheDocument()
    expect(screen.getByText('1:00h')).toBeInTheDocument()
  })

  const cases: { type: PersonalActivityType; title: string }[] = [
    { type: 'schoolRun', title: 'School Run' },
    { type: 'lunch', title: 'Lunch' },
    { type: 'dentist', title: 'Dentist' },
    { type: 'driving', title: 'Driving' },
    { type: 'gym', title: 'Gym' },
  ]

  it.each(cases)('renders the correct icon for activity type "$type"', async ({ type, title }) => {
    const { container } = await renderAsync(
      <PersonalCardContent title={title} durationLabel="1:00h" activityType={type} />,
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg!.outerHTML).toMatchSnapshot()
  })
})
