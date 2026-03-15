import { personalActivityIcons, type PersonalActivityType } from '@/lib/personal-activity'

type PersonalCardContentProps = {
  title: string
  durationLabel: string
  activityType: PersonalActivityType
}

/**
 * Shared presentational content for personal-activity cards.
 * Used by both PersonalTaskCard (interactive) and PersonalDragPreview (static).
 */
export function PersonalCardContent({ title, durationLabel, activityType }: PersonalCardContentProps) {
  const ActivityIcon = personalActivityIcons[activityType]
  return (
    <>
      <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center">
        <ActivityIcon className="size-3.5" strokeWidth={2} />
      </span>
      <span className="flex-1 text-[12px] leading-none font-semibold tracking-[0.03em] uppercase">
        {title}
      </span>
      <span className="shrink-0 text-[11px] tabular-nums font-medium opacity-70">
        {durationLabel}
      </span>
    </>
  )
}
