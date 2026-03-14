import { addDays, startOfWeek, setHours, setMinutes, startOfDay } from 'date-fns'
import type { CalendarEvent, EventPriority } from './types'

function at(day: Date, hour: number, minute = 0): Date {
  return setMinutes(setHours(startOfDay(day), hour), minute)
}

/**
 * Seed events anchored to the current week — a realistic work week with
 * a mix of work tasks, personal activities, and meetings.
 */
export function seedEvents(): CalendarEvent[] {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
  const mon = addDays(weekStart, 1)
  const tue = addDays(weekStart, 2)
  const wed = addDays(weekStart, 3)
  const thu = addDays(weekStart, 4)
  const fri = addDays(weekStart, 5)

  const teamAvatars = [
    { id: 'u1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/32?u=alice' },
    { id: 'u2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/32?u=bob' },
    { id: 'u3', name: 'Carol', avatarUrl: 'https://i.pravatar.cc/32?u=carol' },
  ]

  return [
    // ── Monday ─────────────────────────────────────────────
    { id: 'mon-drive', title: 'Driving', start: at(mon, 8), end: at(mon, 9), isAllDay: false, color: 'indigo' as const, status: 'completed' as const, priority: 'none' as EventPriority, personalActivityType: 'driving' },
    { id: 'mon-standup', title: 'Morning Standup', start: at(mon, 9, 15), end: at(mon, 9, 45), isAllDay: false, color: 'blue' as const, status: 'completed' as const, priority: 'medium' as EventPriority, participants: teamAvatars },
    { id: 'mon-brand', title: 'Brand Refresh Workshop', start: at(mon, 10), end: at(mon, 12), isAllDay: false, color: 'teal' as const, status: 'completed' as const, priority: 'high' as EventPriority },
    { id: 'mon-lunch', title: 'Lunch', start: at(mon, 12), end: at(mon, 13), isAllDay: false, color: 'rose' as const, status: 'completed' as const, priority: 'none' as EventPriority, personalActivityType: 'lunch' },
    { id: 'mon-qa', title: 'Dashboard QA Pass', start: at(mon, 13, 30), end: at(mon, 15), isAllDay: false, color: 'teal' as const, status: 'completed' as const, priority: 'none' as EventPriority },
    { id: 'mon-emails', title: 'Email Catch-up', start: at(mon, 15, 15), end: at(mon, 16), isAllDay: false, color: 'blue' as const, status: 'completed' as const, priority: 'low' as EventPriority },
    { id: 'mon-drive-back', title: 'Driving', start: at(mon, 17), end: at(mon, 18), isAllDay: false, color: 'indigo' as const, status: 'completed' as const, priority: 'none' as EventPriority, personalActivityType: 'driving' },

    // ── Tuesday ────────────────────────────────────────────
    { id: 'tue-school', title: 'School Run', start: at(tue, 8), end: at(tue, 9), isAllDay: false, color: 'amber' as const, status: 'completed' as const, priority: 'none' as EventPriority, personalActivityType: 'schoolRun' },
    { id: 'tue-standup', title: 'Morning Standup', start: at(tue, 9, 15), end: at(tue, 9, 45), isAllDay: false, color: 'blue' as const, status: 'completed' as const, priority: 'medium' as EventPriority, participants: teamAvatars },
    { id: 'tue-seo', title: 'SEO Content Batch', start: at(tue, 10), end: at(tue, 12), isAllDay: false, color: 'teal' as const, status: 'completed' as const, priority: 'none' as EventPriority },
    { id: 'tue-lunch', title: 'Lunch', start: at(tue, 12), end: at(tue, 13), isAllDay: false, color: 'rose' as const, status: 'completed' as const, priority: 'none' as EventPriority, personalActivityType: 'lunch' },
    { id: 'tue-client', title: 'Client Call', start: at(tue, 13, 30), end: at(tue, 14, 30), isAllDay: false, color: 'emerald' as const, status: 'completed' as const, priority: 'none' as EventPriority, participants: [teamAvatars[0], teamAvatars[1]] },
    { id: 'tue-api', title: 'API Contract Check', start: at(tue, 14, 45), end: at(tue, 16, 30), isAllDay: false, color: 'teal' as const, status: 'completed' as const, priority: 'high' as EventPriority },
    { id: 'tue-gym', title: 'Gym', start: at(tue, 17), end: at(tue, 18), isAllDay: false, color: 'purple' as const, status: 'completed' as const, priority: 'none' as EventPriority, personalActivityType: 'gym' },

    // ── Wednesday ──────────────────────────────────────────
    { id: 'wed-drive', title: 'Driving', start: at(wed, 8), end: at(wed, 9), isAllDay: false, color: 'indigo' as const, status: 'completed' as const, priority: 'none' as EventPriority, personalActivityType: 'driving' },
    { id: 'wed-standup', title: 'Morning Standup', start: at(wed, 9, 15), end: at(wed, 9, 45), isAllDay: false, color: 'blue' as const, status: 'completed' as const, priority: 'medium' as EventPriority, participants: teamAvatars },
    { id: 'wed-hotfix', title: 'Mobile Nav Hotfix', start: at(wed, 10), end: at(wed, 11), isAllDay: false, color: 'teal' as const, status: 'pending' as const, priority: 'critical' as EventPriority },
    { id: 'wed-dentist', title: 'Dentist', start: at(wed, 11, 15), end: at(wed, 12, 15), isAllDay: false, color: 'emerald' as const, status: 'pending' as const, priority: 'none' as EventPriority, personalActivityType: 'dentist' },
    { id: 'wed-lunch', title: 'Lunch', start: at(wed, 12, 15), end: at(wed, 13), isAllDay: false, color: 'rose' as const, status: 'pending' as const, priority: 'none' as EventPriority, personalActivityType: 'lunch' },
    { id: 'wed-campaign', title: 'Campaign Copy Review', start: at(wed, 13, 30), end: at(wed, 15), isAllDay: false, color: 'teal' as const, status: 'pending' as const, priority: 'none' as EventPriority },
    { id: 'wed-deep', title: 'Deep Work', start: at(wed, 15, 15), end: at(wed, 17), isAllDay: false, color: 'teal' as const, status: 'pending' as const, priority: 'high' as EventPriority },
    { id: 'wed-drive-back', title: 'Driving', start: at(wed, 17), end: at(wed, 18), isAllDay: false, color: 'indigo' as const, status: 'pending' as const, priority: 'none' as EventPriority, personalActivityType: 'driving' },

    // ── Thursday ───────────────────────────────────────────
    { id: 'thu-school', title: 'School Run', start: at(thu, 8), end: at(thu, 9), isAllDay: false, color: 'amber' as const, status: 'pending' as const, priority: 'none' as EventPriority, personalActivityType: 'schoolRun' },
    { id: 'thu-standup', title: 'Morning Standup', start: at(thu, 9, 15), end: at(thu, 9, 45), isAllDay: false, color: 'blue' as const, status: 'pending' as const, priority: 'medium' as EventPriority, participants: teamAvatars },
    { id: 'thu-donation', title: 'Donation Form Audit', start: at(thu, 10), end: at(thu, 12), isAllDay: false, color: 'teal' as const, status: 'pending' as const, priority: 'none' as EventPriority },
    { id: 'thu-lunch', title: 'Lunch', start: at(thu, 12), end: at(thu, 13), isAllDay: false, color: 'rose' as const, status: 'pending' as const, priority: 'none' as EventPriority, personalActivityType: 'lunch' },
    { id: 'thu-insights', title: 'Weekly Insights Sync', start: at(thu, 13, 30), end: at(thu, 14, 15), isAllDay: false, color: 'blue' as const, status: 'pending' as const, priority: 'high' as EventPriority, participants: [teamAvatars[0], teamAvatars[2]] },
    { id: 'thu-seo2', title: 'SEO Content Batch', start: at(thu, 14, 30), end: at(thu, 16, 30), isAllDay: false, color: 'teal' as const, status: 'pending' as const, priority: 'none' as EventPriority },
    { id: 'thu-gym', title: 'Gym', start: at(thu, 17), end: at(thu, 18), isAllDay: false, color: 'purple' as const, status: 'pending' as const, priority: 'none' as EventPriority, personalActivityType: 'gym' },

    // ── Friday ─────────────────────────────────────────────
    { id: 'fri-drive', title: 'Driving', start: at(fri, 8), end: at(fri, 9), isAllDay: false, color: 'indigo' as const, status: 'pending' as const, priority: 'none' as EventPriority, personalActivityType: 'driving' },
    { id: 'fri-standup', title: 'Morning Standup', start: at(fri, 9, 15), end: at(fri, 9, 45), isAllDay: false, color: 'blue' as const, status: 'pending' as const, priority: 'medium' as EventPriority, participants: teamAvatars },
    { id: 'fri-brand2', title: 'Brand Refresh Workshop', start: at(fri, 10), end: at(fri, 12), isAllDay: false, color: 'teal' as const, status: 'pending' as const, priority: 'high' as EventPriority },
    { id: 'fri-lunch', title: 'Lunch', start: at(fri, 12), end: at(fri, 13), isAllDay: false, color: 'rose' as const, status: 'pending' as const, priority: 'none' as EventPriority, personalActivityType: 'lunch' },
    { id: 'fri-meeting', title: 'Team Meeting', start: at(fri, 13, 30), end: at(fri, 14), isAllDay: false, color: 'blue' as const, status: 'pending' as const, priority: 'medium' as EventPriority, participants: teamAvatars },
    { id: 'fri-copy', title: 'Campaign Copy Review', start: at(fri, 14, 15), end: at(fri, 16, 30), isAllDay: false, color: 'teal' as const, status: 'pending' as const, priority: 'none' as EventPriority },
    { id: 'fri-gym', title: 'Gym', start: at(fri, 17), end: at(fri, 18), isAllDay: false, color: 'purple' as const, status: 'pending' as const, priority: 'none' as EventPriority, personalActivityType: 'gym' },
  ]
}
