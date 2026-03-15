import { addDays, startOfWeek, setHours, setMinutes, startOfDay } from 'date-fns'
import type { Task } from '../schema'
import type { Seeder } from './seeder'

function at(day: Date, hour: number, minute = 0): string {
  return setMinutes(setHours(startOfDay(day), hour), minute).toISOString()
}

export const WorkTaskSeeder: Seeder = {
  run(): Task[] {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
    const mon = addDays(weekStart, 1)
    const tue = addDays(weekStart, 2)
    const wed = addDays(weekStart, 3)
    const thu = addDays(weekStart, 4)
    const fri = addDays(weekStart, 5)

    return [
      // ── Unscheduled sidebar pool ─────────────────────────
      { id: 'task-brand-refresh-workshop', title: 'Brand Refresh Workshop', type: 'work', durationMinutes: 125, priority: 'medium', status: 'pending', color: 'teal', clientName: 'Laser Red', dueDateLabel: 'Mar 18', isRecurring: true, recurringType: 'retainer', schedule: null },
      { id: 'task-dashboard-qa-pass', title: 'Dashboard QA Pass', type: 'work', durationMinutes: 80, priority: 'none', status: 'pending', color: 'teal', clientName: 'MyEnergi Ltd', dueDateLabel: null, isRecurring: false, schedule: null },
      { id: 'task-weekly-insights-sync', title: 'Weekly Insights Sync', type: 'work', durationMinutes: 45, priority: 'high', status: 'pending', color: 'teal', clientName: 'FiveCast', dueDateLabel: 'Mar 15', isRecurring: true, recurringType: 'standard', schedule: null },
      { id: 'task-campaign-copy-review', title: 'Campaign Copy Review', type: 'work', durationMinutes: 95, priority: 'none', status: 'pending', color: 'teal', clientName: 'Bush Tyres', dueDateLabel: 'Mar 22', isRecurring: false, schedule: null },
      { id: 'task-donation-form-audit', title: 'Donation Form Audit', type: 'work', durationMinutes: 160, priority: 'none', status: 'pending', color: 'teal', clientName: 'St Barbans Hospice', dueDateLabel: null, isRecurring: false, schedule: null },
      { id: 'task-mobile-nav-hotfix', title: 'Mobile Nav Hotfix', type: 'work', durationMinutes: 55, priority: 'critical', status: 'pending', color: 'teal', clientName: 'Smartev Limited', dueDateLabel: 'Mar 16', isRecurring: true, recurringType: 'standard', schedule: null },
      { id: 'task-seo-content-batch', title: 'SEO Content Batch', type: 'work', durationMinutes: 190, priority: 'none', status: 'pending', color: 'teal', clientName: 'National Education Union', dueDateLabel: 'Mar 29', isRecurring: false, schedule: null },
      { id: 'task-api-contract-check', title: 'API Contract Check', type: 'work', durationMinutes: 110, priority: 'high', status: 'pending', color: 'teal', clientName: 'Synapsys Solutions', dueDateLabel: null, isRecurring: true, recurringType: 'standard', schedule: null },

      // ── Scheduled calendar instances ──────────────────────
      { id: 'mon-brand', title: 'Brand Refresh Workshop', type: 'work', durationMinutes: 120, priority: 'high', status: 'completed', color: 'teal', schedule: { start: at(mon, 10), end: at(mon, 12), isAllDay: false } },
      { id: 'mon-qa', title: 'Dashboard QA Pass', type: 'work', durationMinutes: 90, priority: 'none', status: 'completed', color: 'teal', schedule: { start: at(mon, 13, 30), end: at(mon, 15), isAllDay: false } },
      { id: 'mon-emails', title: 'Email Catch-up', type: 'work', durationMinutes: 45, priority: 'low', status: 'completed', color: 'blue', schedule: { start: at(mon, 15, 15), end: at(mon, 16), isAllDay: false } },
      { id: 'tue-seo', title: 'SEO Content Batch', type: 'work', durationMinutes: 120, priority: 'none', status: 'completed', color: 'teal', schedule: { start: at(tue, 10), end: at(tue, 12), isAllDay: false } },
      { id: 'tue-api', title: 'API Contract Check', type: 'work', durationMinutes: 105, priority: 'high', status: 'completed', color: 'teal', schedule: { start: at(tue, 14, 45), end: at(tue, 16, 30), isAllDay: false } },
      { id: 'wed-hotfix', title: 'Mobile Nav Hotfix', type: 'work', durationMinutes: 60, priority: 'critical', status: 'pending', color: 'teal', schedule: { start: at(wed, 10), end: at(wed, 11), isAllDay: false } },
      { id: 'wed-campaign', title: 'Campaign Copy Review', type: 'work', durationMinutes: 90, priority: 'none', status: 'pending', color: 'teal', schedule: { start: at(wed, 13, 30), end: at(wed, 15), isAllDay: false } },
      { id: 'wed-deep', title: 'Deep Work', type: 'work', durationMinutes: 105, priority: 'high', status: 'pending', color: 'teal', schedule: { start: at(wed, 15, 15), end: at(wed, 17), isAllDay: false } },
      { id: 'thu-donation', title: 'Donation Form Audit', type: 'work', durationMinutes: 120, priority: 'none', status: 'pending', color: 'teal', schedule: { start: at(thu, 10), end: at(thu, 12), isAllDay: false } },
      { id: 'thu-seo2', title: 'SEO Content Batch', type: 'work', durationMinutes: 120, priority: 'none', status: 'pending', color: 'teal', schedule: { start: at(thu, 14, 30), end: at(thu, 16, 30), isAllDay: false } },
      { id: 'fri-brand2', title: 'Brand Refresh Workshop', type: 'work', durationMinutes: 120, priority: 'high', status: 'pending', color: 'teal', schedule: { start: at(fri, 10), end: at(fri, 12), isAllDay: false } },
      { id: 'fri-copy', title: 'Campaign Copy Review', type: 'work', durationMinutes: 135, priority: 'none', status: 'pending', color: 'teal', schedule: { start: at(fri, 14, 15), end: at(fri, 16, 30), isAllDay: false } },
    ]
  },
}
