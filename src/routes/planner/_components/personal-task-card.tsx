import { makeSidebarDragData, useCalendarDragSource } from '@/features/calendar'
import type { Task } from '@/database/schema'
import { cn } from '@/lib/utils'
import {
  personalActivityStyles,
  personalActivityIcons,
  type PersonalActivityType,
} from '@/lib/personal-activity'
import { PersonalCardContent } from './personal-card-content'
import { roundUpDurationMinutes, formatDurationLabel } from './utils'

export function PersonalTaskCard({ task }: { task: Task }) {
  const activityType = task.personalActivityType as PersonalActivityType
  const roundedDurationMinutes = roundUpDurationMinutes(task.durationMinutes)
  const roundedDurationLabel = formatDurationLabel(roundedDurationMinutes)
  const { ref, isDragging, onPointerDown } = useCalendarDragSource<HTMLElement>({
    createDragData: () => makeSidebarDragData(task.id, task.title, roundedDurationMinutes, {
      color: task.color,
      className: personalActivityStyles[activityType],
      icon: personalActivityIcons[activityType],
      dragMeta: {
        kind: 'personal' as const,
        activityType,
        durationLabel: roundedDurationLabel,
      },
    }),
  })

  return (
    <article
      ref={ref}
      onPointerDown={onPointerDown}
      className={cn(
        'flex w-full min-h-[2.2rem] cursor-grab items-center gap-[0.4rem] rounded-[8px] border px-[0.6rem] py-[0.5rem] transition-colors',
        personalActivityStyles[activityType],
        isDragging && 'opacity-40',
      )}
    >
      <PersonalCardContent
        title={task.title}
        durationLabel={roundedDurationLabel}
        activityType={activityType}
      />
    </article>
  )
}
