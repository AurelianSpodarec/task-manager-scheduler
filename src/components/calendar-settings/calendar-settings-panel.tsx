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
    <aside className="flex h-full flex-col overflow-hidden border-l border-cal-grid-line bg-gradient-to-b from-cal-bg to-cal-bg-subtle">
      {/* Panel header */}
      <header className="flex shrink-0 items-center justify-between border-b border-cal-grid-line px-5 py-3.5">
        <h2 className="text-[13px] font-semibold tracking-tight text-cal-text">Calendar Settings</h2>
        <button
          type="button"
          onClick={toggleSettingsPanel}
          className="inline-flex size-7 items-center justify-center rounded-lg text-cal-text-muted transition-all hover:bg-cal-bg-subtle hover:text-cal-text active:scale-95"
          aria-label="Close settings"
        >
          <X className="size-3.5" />
        </button>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-6">
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
          { value: 1 as WeekStartDay, label: 'Mon' },
          { value: 0 as WeekStartDay, label: 'Sun' },
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
    <section className="space-y-3.5">
      <SectionLabel>Work Hours</SectionLabel>

      <div className="flex items-center gap-2.5">
        <HourSelect label="Start" value={workHours.startHour} onChange={handleStartChange} formatHour={formatHour} />
        <span className="mt-5 text-[11px] font-medium text-cal-text-dimmed">–</span>
        <HourSelect label="End" value={workHours.endHour} onChange={handleEndChange} formatHour={formatHour} />
      </div>

      <div>
        <span className="mb-2 block text-[10.5px] font-medium tracking-wide text-cal-text-muted uppercase">Work Days</span>
        <div className="flex gap-1.5">
          {orderedDays.map(({ label, dayIndex }) => {
            const active = workHours.daysOfWeek.includes(dayIndex)
            return (
              <button
                key={dayIndex}
                type="button"
                onClick={() => toggleDay(dayIndex)}
                className={`flex size-[1.85rem] items-center justify-center rounded-lg text-[10.5px] font-semibold transition-all ${
                  active
                    ? 'bg-cal-today-text text-white shadow-sm shadow-cal-today-text/25'
                    : 'bg-cal-bg text-cal-text-muted ring-1 ring-cal-grid-line hover:ring-cal-text-dimmed hover:text-cal-text'
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
      <div>
        <SectionLabel>Visible Days</SectionLabel>
        <p className="mt-0.5 text-[10.5px] leading-relaxed text-cal-text-muted">Choose which days appear in the calendar grid.</p>
      </div>
      <div className="flex gap-1.5">
        {orderedDays.map(({ label, dayIndex }) => {
          const active = visibleDays.includes(dayIndex)
          return (
            <button
              key={dayIndex}
              type="button"
              onClick={() => toggleDay(dayIndex)}
              className={`flex size-[1.85rem] items-center justify-center rounded-lg text-[10.5px] font-semibold transition-all ${
                active
                  ? 'bg-cal-today-text text-white shadow-sm shadow-cal-today-text/25'
                  : 'bg-cal-bg text-cal-text-muted ring-1 ring-cal-grid-line hover:ring-cal-text-dimmed hover:text-cal-text'
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
      <div>
        <SectionLabel>Day Window</SectionLabel>
        <p className="mt-0.5 text-[10.5px] leading-relaxed text-cal-text-muted">Grid hour range and initial scroll position.</p>
      </div>

      <div className="flex items-center gap-2.5">
        <HourSelect
          label="Grid Start"
          value={dayStartHour}
          onChange={(e) => applyConfig({ dayStartHour: Number(e.target.value) })}
          formatHour={formatHour}
        />
        <span className="mt-5 text-[11px] font-medium text-cal-text-dimmed">–</span>
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
  return <h3 className="text-[11.5px] font-semibold tracking-tight text-cal-text">{children}</h3>
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-cal-grid-line/60" />
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
    <div className="flex gap-0.5 rounded-lg bg-cal-bg-subtle p-[3px] ring-1 ring-cal-grid-line/50">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-2.5 py-[3px] text-[11px] font-semibold transition-all ${
              active
                ? 'bg-cal-bg text-cal-text shadow-sm ring-1 ring-cal-grid-line/60'
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
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-[10px] font-semibold tracking-wide text-cal-text-muted uppercase">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="h-8 w-full rounded-lg border border-cal-grid-line bg-cal-bg px-2 text-[11.5px] font-medium text-cal-text shadow-sm transition-colors focus:border-cal-focus-ring focus:ring-2 focus:ring-cal-focus-ring/20 focus:outline-none"
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
