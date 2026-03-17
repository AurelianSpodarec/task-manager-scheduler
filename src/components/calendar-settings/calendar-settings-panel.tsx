import { X } from 'lucide-react'
import {
  useWorkHours,
  setWorkHours,
  useUse24HourTime,
  setUse24HourTime,
  useWeekStartsOn,
  setWeekStartsOn,
  useVisibleDays,
  setVisibleDays,
  useConfigLocale,
  useFormatTime,
  getOrderedWeekDays,
  applyConfig,
  useDayStartHour,
  useDayEndHour,
  useVisibleStartHour,
  toggleSettingsPanel,
  useSidebarPosition,
  setSidebarPosition,
  type WeekStartDay,
  type SidebarPosition,
} from '@/features/calendar'

const HOURS = Array.from({ length: 25 }, (_, i) => i)

export function CalendarSettingsPanel() {
  return (
    <aside className="flex h-full flex-col overflow-hidden border-l border-cal-grid-line bg-cal-bg">
      <header className="flex h-cal-header shrink-0 items-center justify-between border-b border-cal-grid-line px-4">
        <h2 className="text-xs font-semibold text-cal-text">Settings</h2>
        <button
          type="button"
          onClick={toggleSettingsPanel}
          className="inline-flex size-7 items-center justify-center rounded-md text-cal-text-muted transition-colors hover:bg-cal-bg-subtle hover:text-cal-text"
          aria-label="Close settings"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-5">
          <TimeFormatSection />
          <Divider />
          <WeekStartSection />
          <Divider />
          <WorkHoursSection />
          <Divider />
          <VisibleDaysSection />
          <Divider />
          <SidebarPositionSection />
          <Divider />
          <DayWindowSection />
        </div>
      </div>
    </aside>
  )
}

// ─── Sections ────────────────────────────────────────────────────────────────

function TimeFormatSection() {
  const use24h = useUse24HourTime()

  return (
    <SettingRow label="Time Format">
      <ToggleGroup
        options={[
          { value: false, label: '12h' },
          { value: true, label: '24h' },
        ]}
        value={use24h}
        onChange={setUse24HourTime}
      />
    </SettingRow>
  )
}

function WeekStartSection() {
  const weekStartsOn = useWeekStartsOn()

  return (
    <SettingRow label="Week Starts On">
      <ToggleGroup
        options={[
          { value: 1 as WeekStartDay, label: 'Monday' },
          { value: 0 as WeekStartDay, label: 'Sunday' },
        ]}
        value={weekStartsOn}
        onChange={setWeekStartsOn}
      />
    </SettingRow>
  )
}

function WorkHoursSection() {
  const workHours = useWorkHours()
  const weekStartsOn = useWeekStartsOn()
  const locale = useConfigLocale()
  const { formatHour } = useFormatTime()
  const orderedDays = getOrderedWeekDays(weekStartsOn, locale)

  function handleStartChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setWorkHours({ ...workHours, startHour: Number(e.target.value) })
  }

  function handleEndChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setWorkHours({ ...workHours, endHour: Number(e.target.value) })
  }

  function toggleDay(day: number) {
    const days = workHours.daysOfWeek.includes(day)
      ? workHours.daysOfWeek.filter((d) => d !== day)
      : [...workHours.daysOfWeek, day].sort()
    setWorkHours({ ...workHours, daysOfWeek: days })
  }

  return (
    <section className="space-y-3">
      <SectionLabel>Work Hours</SectionLabel>

      <div className="flex items-center gap-2">
        <HourSelect label="Start" value={workHours.startHour} onChange={handleStartChange} formatHour={formatHour} />
        <span className="mt-4 text-xs text-cal-text-muted">–</span>
        <HourSelect label="End" value={workHours.endHour} onChange={handleEndChange} formatHour={formatHour} />
      </div>

      <div>
        <span className="mb-1.5 block text-[11px] font-medium text-cal-text-muted">Work Days</span>
        <div className="flex gap-1">
          {orderedDays.map(({ label, dayIndex }) => {
            const active = workHours.daysOfWeek.includes(dayIndex)
            return (
              <button
                key={dayIndex}
                type="button"
                onClick={() => toggleDay(dayIndex)}
                className={`flex size-7 items-center justify-center rounded-md text-[11px] font-medium transition-colors ${
                  active
                    ? 'bg-cal-today-text text-white'
                    : 'bg-cal-bg-subtle text-cal-text-muted hover:text-cal-text'
                }`}
                aria-pressed={active}
                aria-label={label}
              >
                {label[0]}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function VisibleDaysSection() {
  const visibleDays = useVisibleDays()
  const weekStartsOn = useWeekStartsOn()
  const locale = useConfigLocale()
  const orderedDays = getOrderedWeekDays(weekStartsOn, locale)

  function toggleDay(day: number) {
    const next = visibleDays.includes(day)
      ? visibleDays.filter((d) => d !== day)
      : [...visibleDays, day].sort()
    if (next.length > 0) setVisibleDays(next)
  }

  return (
    <section className="space-y-2">
      <SectionLabel>Visible Days</SectionLabel>
      <p className="text-[11px] text-cal-text-muted">Which days appear in the grid.</p>
      <div className="flex gap-1">
        {orderedDays.map(({ label, dayIndex }) => {
          const active = visibleDays.includes(dayIndex)
          return (
            <button
              key={dayIndex}
              type="button"
              onClick={() => toggleDay(dayIndex)}
              className={`flex size-7 items-center justify-center rounded-md text-[11px] font-medium transition-colors ${
                active
                  ? 'bg-cal-today-text text-white'
                  : 'bg-cal-bg-subtle text-cal-text-muted hover:text-cal-text'
              }`}
              aria-pressed={active}
              aria-label={label}
            >
              {label[0]}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function SidebarPositionSection() {
  const position = useSidebarPosition()

  return (
    <SettingRow label="Sidebar Position">
      <ToggleGroup<SidebarPosition>
        options={[
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ]}
        value={position}
        onChange={setSidebarPosition}
      />
    </SettingRow>
  )
}

function DayWindowSection() {
  const dayStartHour = useDayStartHour()
  const dayEndHour = useDayEndHour()
  const visibleStartHour = useVisibleStartHour()
  const { formatHour } = useFormatTime()

  return (
    <section className="space-y-3">
      <SectionLabel>Day Window</SectionLabel>
      <p className="text-[11px] text-cal-text-muted">Grid hour range and initial scroll position.</p>

      <div className="flex items-center gap-2">
        <HourSelect
          label="Grid Start"
          value={dayStartHour}
          onChange={(e) => applyConfig({ dayStartHour: Number(e.target.value) })}
          formatHour={formatHour}
        />
        <span className="mt-4 text-xs text-cal-text-muted">–</span>
        <HourSelect
          label="Grid End"
          value={dayEndHour}
          onChange={(e) => applyConfig({ dayEndHour: Number(e.target.value) })}
          formatHour={formatHour}
        />
      </div>

      <HourSelect
        label="Scroll To"
        value={visibleStartHour}
        onChange={(e) => applyConfig({ visibleStartHour: Number(e.target.value) })}
        formatHour={formatHour}
      />
    </section>
  )
}

// ─── Shared primitives ───────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-semibold text-cal-text">{children}</h3>
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-cal-grid-line" />
}

function ToggleGroup<T>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-0.5 rounded-md bg-cal-bg-subtle p-0.5">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
              active
                ? 'bg-cal-bg text-cal-text shadow-sm'
                : 'text-cal-text-muted hover:text-cal-text'
            }`}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function HourSelect({
  label,
  value,
  onChange,
  formatHour,
}: {
  label: string
  value: number
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  formatHour: (h: number) => string
}) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-[10px] font-medium text-cal-text-muted">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="h-7 w-full rounded-md border border-cal-grid-line bg-transparent px-1.5 text-[12px] text-cal-text focus:border-cal-focus-ring focus:outline-none"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {formatHour(h)}
          </option>
        ))}
      </select>
    </label>
  )
}
