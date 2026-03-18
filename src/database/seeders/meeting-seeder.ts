import { addDays, addMinutes, startOfWeek, setHours, setMinutes, startOfDay } from 'date-fns'
import type { Task } from '../schema'
import type { Seeder } from './seeder'

function at(day: Date, hour: number, minute = 0): string {
  return setMinutes(setHours(startOfDay(day), hour), minute).toISOString()
}

const teamAvatars = [
  { id: 'u1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/32?u=alice' },
  { id: 'u2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/32?u=bob' },
  { id: 'u3', name: 'Carol', avatarUrl: 'https://i.pravatar.cc/32?u=carol' },
  { id: 'u4', name: 'Dan', avatarUrl: 'https://i.pravatar.cc/32?u=dan' },
  { id: 'u5', name: 'Emma', avatarUrl: 'https://i.pravatar.cc/32?u=emma' },
  { id: 'u6', name: 'Felix', avatarUrl: 'https://i.pravatar.cc/32?u=felix' },
]

export const MeetingSeeder: Seeder = {
  run(): Task[] {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
    const mon = addDays(weekStart, 1)
    const tue = addDays(weekStart, 2)
    const wed = addDays(weekStart, 3)
    const thu = addDays(weekStart, 4)
    const fri = addDays(weekStart, 5)
    const now = new Date()
    const nearStart = addMinutes(now, 10)
    const nearEnd = addMinutes(nearStart, 90)

    return [
      // Sidebar meeting templates (provider-only + participant-heavy)
      {
        id: 'provider-google-office-hours',
        title: 'Google Meet Office Hours',
        type: 'meeting',
        durationMinutes: 45,
        priority: 'none',
        status: 'pending',
        color: 'emerald',
        meetingProvider: 'google',
        meetingJoinUrl: 'https://meet.google.com/fivecast-office-hours',
        schedule: null,
      },
      {
        id: 'live-design-jam-template',
        title: 'Design Jam',
        type: 'meeting',
        durationMinutes: 90,
        priority: 'high',
        status: 'pending',
        color: 'blue',
        participants: teamAvatars,
        meetingProvider: 'zoom',
        meetingJoinUrl: 'https://zoom.us/j/9751397531',
        schedule: null,
      },
      {
        id: 'live-design-jam-scheduled',
        title: 'Design Jam',
        type: 'meeting',
        durationMinutes: 90,
        priority: 'high',
        status: 'pending',
        color: 'blue',
        participants: teamAvatars,
        meetingProvider: 'zoom',
        meetingJoinUrl: 'https://zoom.us/j/9751397531',
        schedule: { start: nearStart.toISOString(), end: nearEnd.toISOString(), isAllDay: false },
      },

      // Daily standups
      { id: 'mon-standup', title: 'Morning Standup', type: 'meeting', durationMinutes: 30, priority: 'medium', status: 'completed', color: 'blue', participants: teamAvatars, meetingProvider: 'google', meetingJoinUrl: 'https://meet.google.com/fivecast-standup', schedule: { start: at(mon, 9, 15), end: at(mon, 9, 45), isAllDay: false } },
      { id: 'tue-standup', title: 'Morning Standup', type: 'meeting', durationMinutes: 30, priority: 'medium', status: 'completed', color: 'blue', participants: teamAvatars, meetingProvider: 'google', meetingJoinUrl: 'https://meet.google.com/fivecast-standup', schedule: { start: at(tue, 9, 15), end: at(tue, 9, 45), isAllDay: false } },
      { id: 'wed-standup', title: 'Morning Standup', type: 'meeting', durationMinutes: 30, priority: 'medium', status: 'completed', color: 'blue', participants: teamAvatars, meetingProvider: 'google', meetingJoinUrl: 'https://meet.google.com/fivecast-standup', schedule: { start: at(wed, 9, 15), end: at(wed, 9, 45), isAllDay: false } },
      { id: 'thu-standup', title: 'Morning Standup', type: 'meeting', durationMinutes: 30, priority: 'medium', status: 'pending', color: 'blue', participants: teamAvatars, meetingProvider: 'google', meetingJoinUrl: 'https://meet.google.com/fivecast-standup', schedule: { start: at(thu, 9, 15), end: at(thu, 9, 45), isAllDay: false } },
      { id: 'fri-standup', title: 'Morning Standup', type: 'meeting', durationMinutes: 30, priority: 'medium', status: 'pending', color: 'blue', participants: teamAvatars, meetingProvider: 'google', meetingJoinUrl: 'https://meet.google.com/fivecast-standup', schedule: { start: at(fri, 9, 15), end: at(fri, 9, 45), isAllDay: false } },

      // One-off meetings
      { id: 'tue-client', title: 'Client Call', type: 'meeting', durationMinutes: 60, priority: 'none', status: 'completed', color: 'emerald', participants: [teamAvatars[0], teamAvatars[1]], meetingProvider: 'zoom', meetingJoinUrl: 'https://zoom.us/j/9805557712', schedule: { start: at(tue, 13, 30), end: at(tue, 14, 30), isAllDay: false } },
      { id: 'thu-insights', title: 'Weekly Insights Sync', type: 'meeting', durationMinutes: 45, priority: 'high', status: 'pending', color: 'blue', participants: [teamAvatars[0], teamAvatars[2]], meetingProvider: 'google', meetingJoinUrl: 'https://meet.google.com/fivecast-insights', schedule: { start: at(thu, 13, 30), end: at(thu, 14, 15), isAllDay: false } },
      { id: 'fri-meeting', title: 'Team Meeting', type: 'meeting', durationMinutes: 30, priority: 'medium', status: 'pending', color: 'blue', participants: teamAvatars, meetingProvider: 'zoom', meetingJoinUrl: 'https://zoom.us/j/9854421188', schedule: { start: at(fri, 13, 30), end: at(fri, 14), isAllDay: false } },
      { id: 'thu-roadmap-review', title: 'Roadmap Review', type: 'meeting', durationMinutes: 75, priority: 'high', status: 'pending', color: 'blue', participants: [teamAvatars[0], teamAvatars[1], teamAvatars[2], teamAvatars[3], teamAvatars[4], teamAvatars[5]], meetingProvider: 'zoom', meetingJoinUrl: 'https://zoom.us/j/9134488101', schedule: { start: at(thu, 16), end: at(thu, 17, 15), isAllDay: false } },
    ]
  },
}
