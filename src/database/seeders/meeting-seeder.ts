import { addDays, startOfWeek, setHours, setMinutes, startOfDay } from 'date-fns'
import type { Task } from '../schema'
import type { Seeder } from './seeder'

function at(day: Date, hour: number, minute = 0): string {
  return setMinutes(setHours(startOfDay(day), hour), minute).toISOString()
}

const teamAvatars = [
  { id: 'u1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/32?u=alice' },
  { id: 'u2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/32?u=bob' },
  { id: 'u3', name: 'Carol', avatarUrl: 'https://i.pravatar.cc/32?u=carol' },
]

export const MeetingSeeder: Seeder = {
  run(): Task[] {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
    const mon = addDays(weekStart, 1)
    const tue = addDays(weekStart, 2)
    const wed = addDays(weekStart, 3)
    const thu = addDays(weekStart, 4)
    const fri = addDays(weekStart, 5)

    return [
      // Daily standups
      { id: 'mon-standup', title: 'Morning Standup', type: 'meeting', durationMinutes: 30, priority: 'medium', status: 'completed', color: 'blue', participants: teamAvatars, schedule: { start: at(mon, 9, 15), end: at(mon, 9, 45), isAllDay: false } },
      { id: 'tue-standup', title: 'Morning Standup', type: 'meeting', durationMinutes: 30, priority: 'medium', status: 'completed', color: 'blue', participants: teamAvatars, schedule: { start: at(tue, 9, 15), end: at(tue, 9, 45), isAllDay: false } },
      { id: 'wed-standup', title: 'Morning Standup', type: 'meeting', durationMinutes: 30, priority: 'medium', status: 'completed', color: 'blue', participants: teamAvatars, schedule: { start: at(wed, 9, 15), end: at(wed, 9, 45), isAllDay: false } },
      { id: 'thu-standup', title: 'Morning Standup', type: 'meeting', durationMinutes: 30, priority: 'medium', status: 'pending', color: 'blue', participants: teamAvatars, schedule: { start: at(thu, 9, 15), end: at(thu, 9, 45), isAllDay: false } },
      { id: 'fri-standup', title: 'Morning Standup', type: 'meeting', durationMinutes: 30, priority: 'medium', status: 'pending', color: 'blue', participants: teamAvatars, schedule: { start: at(fri, 9, 15), end: at(fri, 9, 45), isAllDay: false } },

      // One-off meetings
      { id: 'tue-client', title: 'Client Call', type: 'meeting', durationMinutes: 60, priority: 'none', status: 'completed', color: 'emerald', participants: [teamAvatars[0], teamAvatars[1]], schedule: { start: at(tue, 13, 30), end: at(tue, 14, 30), isAllDay: false } },
      { id: 'thu-insights', title: 'Weekly Insights Sync', type: 'meeting', durationMinutes: 45, priority: 'high', status: 'pending', color: 'blue', participants: [teamAvatars[0], teamAvatars[2]], schedule: { start: at(thu, 13, 30), end: at(thu, 14, 15), isAllDay: false } },
      { id: 'fri-meeting', title: 'Team Meeting', type: 'meeting', durationMinutes: 30, priority: 'medium', status: 'pending', color: 'blue', participants: teamAvatars, schedule: { start: at(fri, 13, 30), end: at(fri, 14), isAllDay: false } },
    ]
  },
}
