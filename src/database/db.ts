import type { Task } from './schema'
import type { Seeder } from './seeders/seeder'
import { DatabaseSeeder } from './seeders/database-seeder'

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------
let tasks: Map<string, Task> = new Map()
let snapshot: Task[] = []

const listeners = new Set<() => void>()

function rebuildSnapshot() {
  snapshot = Array.from(tasks.values())
}

function emit() {
  listeners.forEach((l) => l())
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------
export function getAllTasks(): Task[] {
  return snapshot
}

export function getTask(id: string): Task | undefined {
  return tasks.get(id)
}

export function upsertTask(task: Task): void {
  tasks.set(task.id, task)
  rebuildSnapshot()
  emit()
}

export function deleteTask(id: string): void {
  if (!tasks.delete(id)) return
  rebuildSnapshot()
  emit()
}

// ---------------------------------------------------------------------------
// Reactive subscription (same contract as calendar-store)
// ---------------------------------------------------------------------------
export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Current snapshot ref — used by selectors to detect changes. */
export function getSnapshot(): Task[] {
  return snapshot
}

// ---------------------------------------------------------------------------
// Seeder runner
// ---------------------------------------------------------------------------
export function runSeeder(seeder: Seeder): void {
  const batch = seeder.run()
  for (const task of batch) {
    tasks.set(task.id, task)
  }
  rebuildSnapshot()
  emit()
}

// ---------------------------------------------------------------------------
// Boot — seed the DB on module load
// ---------------------------------------------------------------------------
runSeeder(DatabaseSeeder)
