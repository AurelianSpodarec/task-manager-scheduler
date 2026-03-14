import { addDays, startOfWeek, setHours, setMinutes, startOfDay } from 'date-fns'
import type { CalendarEvent } from './types'

/** Builds a Date at a specific hour:minute on a given day. */
function at(day: Date, hour: number, minute = 0): Date {
  return setMinutes(setHours(startOfDay(day), hour), minute)
}

/**
 * Returns a set of demo events anchored to the current week.
 * This keeps the calendar populated no matter when the app is loaded.
 */
export function seedEvents(): CalendarEvent[] {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
  const sun = weekStart
  const mon = addDays(weekStart, 1)
  const tue = addDays(weekStart, 2)
  const wed = addDays(weekStart, 3)
  const thu = addDays(weekStart, 4)
  const fri = addDays(weekStart, 5)
  const sat = addDays(weekStart, 6)

  const teamAvatars = [
    { id: 'u1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/32?u=alice' },
    { id: 'u2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/32?u=bob' },
    { id: 'u3', name: 'Carol', avatarUrl: 'https://i.pravatar.cc/32?u=carol' },
  ]

  return [
    // Daily Check-in: Mon–Fri 10:00–11:00
    ...[mon, tue, wed, thu, fri].map((day, i) => ({
      id: `daily-checkin-${i}`,
      title: 'Daily Check-in',
      start: at(day, 10),
      end: at(day, 11),
      isAllDay: false,
      color: 'blue' as const,
      status: i < 3 ? 'completed' as const : 'pending' as const,
      participants: teamAvatars,
    })),

    // Netflix Binge — Sunday 2:00–6:00 PM
    {
      id: 'netflix-binge',
      title: 'Netflix Binge',
      description: 'Stranger Things S5 - Vol 1',
      start: at(sun, 14),
      end: at(sun, 18),
      isAllDay: false,
      color: 'rose' as const,
      status: 'completed' as const,
    },

    // Deep Work — Tuesday 4:00–6:00 PM (actually shown as 7-9 PM in screenshot, but label says 4-6)
    {
      id: 'deep-work-tue',
      title: 'Deep Work',
      start: at(tue, 19),
      end: at(tue, 21),
      isAllDay: false,
      color: 'teal' as const,
      status: 'completed' as const,
      participants: [teamAvatars[1]],
    },

    // Client Call — Wednesday 5:00–6:00 PM
    {
      id: 'client-call-wed',
      title: 'Client Call',
      start: at(wed, 17),
      end: at(wed, 18),
      isAllDay: false,
      color: 'emerald' as const,
      status: 'completed' as const,
      participants: [teamAvatars[0], teamAvatars[1]],
    },

    // Team Lunch — Friday 1:00–2:00 PM
    {
      id: 'team-lunch-fri',
      title: 'Team Lunch',
      start: at(fri, 13),
      end: at(fri, 14),
      isAllDay: false,
      color: 'purple' as const,
      status: 'pending' as const,
      participants: teamAvatars,
    },

    // Deep Work — Friday 4:00–6:00 PM
    {
      id: 'deep-work-fri',
      title: 'Deep Work',
      start: at(fri, 16),
      end: at(fri, 18),
      isAllDay: false,
      color: 'teal' as const,
      status: 'pending' as const,
    },

    // Client Call — Saturday 5:00–6:00 PM
    {
      id: 'client-call-sat',
      title: 'Client Call',
      start: at(sat, 17),
      end: at(sat, 18),
      isAllDay: false,
      color: 'teal' as const,
      status: 'pending' as const,
      participants: [teamAvatars[0], teamAvatars[1]],
    },
  ]
}
