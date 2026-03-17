import { useEffect, useMemo, type ReactNode } from 'react'
import type { CalendarConfigUpdate } from '../config'
import { applyConfig } from '../config'
import { CalendarInstanceContext } from './calendar-instance'

let instanceCounter = 0

function nextInstanceId() {
  instanceCounter += 1
  return `calendar-${instanceCounter}`
}

type CalendarRootProps = {
  children: ReactNode
  /**
   * Optional config override applied when this root mounts.
   * This preserves current behavior while introducing an explicit root boundary.
   */
  config?: CalendarConfigUpdate
  /**
   * Optional stable instance id for deterministic testing / debugging.
   */
  id?: string
}

export function CalendarRoot({ children, config, id }: CalendarRootProps) {
  const instanceId = useMemo(() => id ?? nextInstanceId(), [id])

  // Intentional mount-time application to match existing calendar-shell semantics.
  useEffect(() => {
    if (config) applyConfig(config)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentional mount-only

  return (
    <CalendarInstanceContext.Provider value={instanceId}>
      {children}
    </CalendarInstanceContext.Provider>
  )
}
