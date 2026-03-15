import {
  Backpack,
  Utensils,
  Stethoscope,
  Car,
  Dumbbell,
  type LucideIcon,
} from 'lucide-react'
import type { EventColor } from '@/types/shared'

export type PersonalActivityType = 'schoolRun' | 'lunch' | 'dentist' | 'driving' | 'gym'

/** Tailwind classes for sidebar cards and calendar event blocks */
export const personalActivityStyles: Record<PersonalActivityType, string> = {
  schoolRun: 'border-orange-200 bg-orange-50 text-zinc-900',
  lunch: 'border-rose-200 bg-rose-50 text-zinc-900',
  dentist: 'border-emerald-200 bg-emerald-50 text-zinc-900',
  driving: 'border-indigo-200 bg-indigo-50 text-zinc-900',
  gym: 'border-violet-200 bg-violet-50 text-zinc-900',
}

export const personalActivityIcons: Record<PersonalActivityType, LucideIcon> = {
  schoolRun: Backpack,
  lunch: Utensils,
  dentist: Stethoscope,
  driving: Car,
  gym: Dumbbell,
}

export const personalActivityLeftBorder: Record<PersonalActivityType, string> = {
  schoolRun: '#fb923c',
  lunch: '#fb7185',
  dentist: '#34d399',
  driving: '#818cf8',
  gym: '#a78bfa',
}

/** Maps activity types to the closest EventColor for month-view pills */
export const personalActivityEventColor: Record<PersonalActivityType, EventColor> = {
  schoolRun: 'amber',
  lunch: 'rose',
  dentist: 'emerald',
  driving: 'indigo',
  gym: 'purple',
}
