import type { Task } from '../schema'

/** Laravel-style seeder contract — each seeder produces a batch of tasks. */
export interface Seeder {
  run(): Task[]
}
