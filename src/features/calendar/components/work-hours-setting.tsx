import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useWorkHours, setWorkHours, useWeekStartsOn, setWeekStartsOn, useConfigLocale } from '../calendar-store'
import { getOrderedWeekDays } from '../utils/date'
import { useFormatTime } from '../hooks/use-format-time'
import type { WeekStartDay } from '../types'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function WorkHoursSetting() {
  const workHours = useWorkHours()
  const weekStartsOn = useWeekStartsOn()
  const { formatHour } = useFormatTime()
  const locale = useConfigLocale()
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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Work hours settings">
            <Clock className="size-4" />
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-56 p-3"
      >
        <DropdownMenuLabel className="px-0 text-xs font-semibold text-cal-text">
          Work Hours
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Time range selects */}
        <div className="mt-2 flex items-center gap-2">
          <HourSelect label="Start" value={workHours.startHour} onChange={handleStartChange} formatHour={formatHour} />
          <span className="text-xs text-cal-text-muted">–</span>
          <HourSelect label="End" value={workHours.endHour} onChange={handleEndChange} formatHour={formatHour} />
        </div>

        {/* Day-of-week toggles */}
        <div className="mt-3 flex gap-1">
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

        <DropdownMenuSeparator className="my-2" />

        {/* Week start toggle */}
        <DropdownMenuLabel className="px-0 text-xs font-semibold text-cal-text">
          Week Starts On
        </DropdownMenuLabel>
        <div className="mt-1.5 flex gap-1">
          {([{ value: 1 as WeekStartDay, label: 'Monday' }, { value: 0 as WeekStartDay, label: 'Sunday' }]).map(
            ({ value, label }) => {
              const active = weekStartsOn === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setWeekStartsOn(value)}
                  className={`flex-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                    active
                      ? 'bg-cal-today-text text-white'
                      : 'bg-cal-bg-subtle text-cal-text-muted hover:text-cal-text'
                  }`}
                  aria-pressed={active}
                >
                  {label}
                </button>
              )
            },
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
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
        className="h-7 w-full rounded-md border border-zinc-200 bg-transparent px-1.5 text-[12px] text-cal-text focus:border-cal-focus-ring focus:outline-none dark:border-zinc-700"
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
