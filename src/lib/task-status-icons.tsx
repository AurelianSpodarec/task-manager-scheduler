import { Check } from 'lucide-react'

/** Pending task indicator — zinc-bordered rounded square. */
export function PendingStatusIcon({ className }: { className?: string }) {
  return (
    <span
      className={className}
      style={{ border: '1px solid var(--cal-brand-zinc-400)', borderRadius: 4, opacity: 0.6 }}
    />
  )
}

/** Completed task indicator — emerald-filled rounded square with white check. */
export function CompletedStatusIcon({ className }: { className?: string }) {
  return (
    <span
      className={`flex items-center justify-center ${className ?? ''}`}
      style={{ backgroundColor: 'var(--cal-brand-emerald)', borderRadius: 4 }}
    >
      <Check className="size-2 text-white" strokeWidth={3} />
    </span>
  )
}
