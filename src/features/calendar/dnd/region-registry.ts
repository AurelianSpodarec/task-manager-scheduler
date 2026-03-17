type RegionRegistryState = {
  dayColumns: Map<string, Set<HTMLElement>>
  allDayRow: HTMLElement | null
  sidebarDropzone: HTMLElement | null
}

const registries = new Map<string, RegionRegistryState>()

function getOrCreateRegistry(instanceId: string): RegionRegistryState {
  const existing = registries.get(instanceId)
  if (existing) return existing
  const created: RegionRegistryState = {
    dayColumns: new Map(),
    allDayRow: null,
    sidebarDropzone: null,
  }
  registries.set(instanceId, created)
  return created
}

function removeIfEmpty(instanceId: string) {
  const registry = registries.get(instanceId)
  if (!registry) return
  if (
    registry.dayColumns.size === 0 &&
    registry.allDayRow == null &&
    registry.sidebarDropzone == null
  ) {
    registries.delete(instanceId)
  }
}

function isElementVisible(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

export function registerDayColumn(instanceId: string, isoDay: string, element: HTMLElement) {
  const registry = getOrCreateRegistry(instanceId)
  const set = registry.dayColumns.get(isoDay) ?? new Set<HTMLElement>()
  set.add(element)
  registry.dayColumns.set(isoDay, set)

  return () => {
    const current = registry.dayColumns.get(isoDay)
    if (!current) return
    current.delete(element)
    if (current.size === 0) registry.dayColumns.delete(isoDay)
    removeIfEmpty(instanceId)
  }
}

export function getRegisteredDayColumns(instanceId: string): Array<{ isoDay: string; element: HTMLElement }> {
  const registry = registries.get(instanceId)
  if (!registry) return []
  const entries: Array<{ isoDay: string; element: HTMLElement }> = []
  for (const [isoDay, elements] of registry.dayColumns.entries()) {
    for (const element of elements.values()) {
      entries.push({ isoDay, element })
    }
  }
  return entries
}

export function getDayColumnElement(instanceId: string, isoDay: string): HTMLElement | null {
  const registry = registries.get(instanceId)
  if (!registry) return null
  const set = registry.dayColumns.get(isoDay)
  if (!set || set.size === 0) return null

  for (const el of set.values()) {
    if (isElementVisible(el)) return el
  }
  return set.values().next().value ?? null
}

export function registerAllDayRow(instanceId: string, element: HTMLElement) {
  const registry = getOrCreateRegistry(instanceId)
  registry.allDayRow = element
  return () => {
    const current = registries.get(instanceId)
    if (!current) return
    if (current.allDayRow === element) current.allDayRow = null
    removeIfEmpty(instanceId)
  }
}

export function getAllDayRowElement(instanceId: string): HTMLElement | null {
  return registries.get(instanceId)?.allDayRow ?? null
}

export function registerSidebarDropzone(instanceId: string, element: HTMLElement) {
  const registry = getOrCreateRegistry(instanceId)
  registry.sidebarDropzone = element
  return () => {
    const current = registries.get(instanceId)
    if (!current) return
    if (current.sidebarDropzone === element) current.sidebarDropzone = null
    removeIfEmpty(instanceId)
  }
}

export function getSidebarDropzoneElement(instanceId: string): HTMLElement | null {
  return registries.get(instanceId)?.sidebarDropzone ?? null
}
