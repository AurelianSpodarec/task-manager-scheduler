export type StatusIconProps = { className?: string; animate?: boolean }

/** Pending task indicator — zinc-bordered rounded square. */
export function PendingStatusIcon({ className }: StatusIconProps) {
  return (
    <span
      className={className}
      style={{ border: '1px solid var(--cal-brand-zinc-400)', borderRadius: 4, opacity: 0.6 }}
    />
  )
}

/** Completed task indicator — emerald-filled rounded square with animated checkmark draw. */
export function CompletedStatusIcon({ className, animate }: StatusIconProps) {
  return (
    <span
      className={`flex items-center justify-center ${className ?? ''}`}
      style={{
        backgroundColor: 'var(--cal-brand-emerald)',
        borderRadius: 4,
        ...(animate ? { animation: 'checkmark-bg-pop var(--completion-checkbox-pop-ms) var(--completion-strike-ease) both' } : {}),
      }}
    >
      <svg
        viewBox="0 0 12 12"
        fill="none"
        className="size-2 text-white"
        aria-hidden="true"
      >
        <path
          d="M2.5 6.5 5 9l4.5-6"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...(animate
            ? { strokeDasharray: 16, strokeDashoffset: 16, style: { animation: 'checkmark-draw var(--completion-check-draw-ms) var(--completion-check-draw-delay-ms) ease-out forwards' } }
            : {})}
        />
      </svg>
    </span>
  )
}
