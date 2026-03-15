import { addDays, startOfWeek, setHours, setMinutes, startOfDay } from 'date-fns'
import type { Task } from '../schema'
import type { Seeder } from './seeder'

function at(day: Date, hour: number, minute = 0): string {
  return setMinutes(setHours(startOfDay(day), hour), minute).toISOString()
}

export const PersonalTaskSeeder: Seeder = {
  run(): Task[] {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
    const mon = addDays(weekStart, 1)
    const tue = addDays(weekStart, 2)
    const wed = addDays(weekStart, 3)
    const thu = addDays(weekStart, 4)
    const fri = addDays(weekStart, 5)

    return [
      // ── Unscheduled sidebar pool ─────────────────────────
      { id: 'personal-school-run', title: 'School Run', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'amber', personalActivityType: 'schoolRun', schedule: null },
      { id: 'personal-lunch', title: 'Lunch', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'rose', personalActivityType: 'lunch', schedule: null },
      { id: 'personal-dentist', title: 'Dentist', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'emerald', personalActivityType: 'dentist', schedule: null },
      { id: 'personal-driving', title: 'Driving', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'indigo', personalActivityType: 'driving', schedule: null },
      { id: 'personal-gym', title: 'Gym', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'purple', personalActivityType: 'gym', schedule: null },

      // ── Scheduled calendar instances ──────────────────────
      // Monday
      { id: 'mon-drive', title: 'Driving', type: 'personal', durationMinutes: 60, priority: 'none', status: 'completed', color: 'indigo', personalActivityType: 'driving', schedule: { start: at(mon, 8), end: at(mon, 9), isAllDay: false } },
      { id: 'mon-lunch', title: 'Lunch', type: 'personal', durationMinutes: 60, priority: 'none', status: 'completed', color: 'rose', personalActivityType: 'lunch', schedule: { start: at(mon, 12), end: at(mon, 13), isAllDay: false } },
      { id: 'mon-drive-back', title: 'Driving', type: 'personal', durationMinutes: 60, priority: 'none', status: 'completed', color: 'indigo', personalActivityType: 'driving', schedule: { start: at(mon, 17), end: at(mon, 18), isAllDay: false } },
      // Tuesday
      { id: 'tue-school', title: 'School Run', type: 'personal', durationMinutes: 60, priority: 'none', status: 'completed', color: 'amber', personalActivityType: 'schoolRun', schedule: { start: at(tue, 8), end: at(tue, 9), isAllDay: false } },
      { id: 'tue-lunch', title: 'Lunch', type: 'personal', durationMinutes: 60, priority: 'none', status: 'completed', color: 'rose', personalActivityType: 'lunch', schedule: { start: at(tue, 12), end: at(tue, 13), isAllDay: false } },
      { id: 'tue-gym', title: 'Gym', type: 'personal', durationMinutes: 60, priority: 'none', status: 'completed', color: 'purple', personalActivityType: 'gym', schedule: { start: at(tue, 17), end: at(tue, 18), isAllDay: false } },
      // Wednesday
      { id: 'wed-drive', title: 'Driving', type: 'personal', durationMinutes: 60, priority: 'none', status: 'completed', color: 'indigo', personalActivityType: 'driving', schedule: { start: at(wed, 8), end: at(wed, 9), isAllDay: false } },
      { id: 'wed-dentist', title: 'Dentist', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'emerald', personalActivityType: 'dentist', schedule: { start: at(wed, 11, 15), end: at(wed, 12, 15), isAllDay: false } },
      { id: 'wed-lunch', title: 'Lunch', type: 'personal', durationMinutes: 45, priority: 'none', status: 'pending', color: 'rose', personalActivityType: 'lunch', schedule: { start: at(wed, 12, 15), end: at(wed, 13), isAllDay: false } },
      { id: 'wed-drive-back', title: 'Driving', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'indigo', personalActivityType: 'driving', schedule: { start: at(wed, 17), end: at(wed, 18), isAllDay: false } },
      // Thursday
      { id: 'thu-school', title: 'School Run', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'amber', personalActivityType: 'schoolRun', schedule: { start: at(thu, 8), end: at(thu, 9), isAllDay: false } },
      { id: 'thu-lunch', title: 'Lunch', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'rose', personalActivityType: 'lunch', schedule: { start: at(thu, 12), end: at(thu, 13), isAllDay: false } },
      { id: 'thu-gym', title: 'Gym', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'purple', personalActivityType: 'gym', schedule: { start: at(thu, 17), end: at(thu, 18), isAllDay: false } },
      // Friday
      { id: 'fri-drive', title: 'Driving', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'indigo', personalActivityType: 'driving', schedule: { start: at(fri, 8), end: at(fri, 9), isAllDay: false } },
      { id: 'fri-lunch', title: 'Lunch', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'rose', personalActivityType: 'lunch', schedule: { start: at(fri, 12), end: at(fri, 13), isAllDay: false } },
      { id: 'fri-gym', title: 'Gym', type: 'personal', durationMinutes: 60, priority: 'none', status: 'pending', color: 'purple', personalActivityType: 'gym', schedule: { start: at(fri, 17), end: at(fri, 18), isAllDay: false } },
    ]
  },
}
