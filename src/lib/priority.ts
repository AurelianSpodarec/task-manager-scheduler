import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Minus,
  type LucideIcon,
} from 'lucide-react'

export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'critical'

export const priorityBadgeClass: Record<TaskPriority, string | null> = {
  none: null,
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  high: 'border-orange-200 bg-orange-50 text-orange-700',
  critical: 'border-red-200 bg-red-50 text-red-700',
}

export const priorityBadgeLabel: Record<TaskPriority, string | null> = {
  none: null,
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const priorityBadgeIcon: Record<TaskPriority, LucideIcon | null> = {
  none: null,
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  critical: AlertTriangle,
}
