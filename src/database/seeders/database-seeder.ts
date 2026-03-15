import type { Task } from '../schema'
import type { Seeder } from './seeder'
import { WorkTaskSeeder } from './work-task-seeder'
import { PersonalTaskSeeder } from './personal-task-seeder'
import { MeetingSeeder } from './meeting-seeder'

/**
 * Master seeder — runs all domain seeders in order.
 * Add or remove seeders here to control what gets loaded at boot.
 */
export const DatabaseSeeder: Seeder = {
  run(): Task[] {
    const seeders: Seeder[] = [
      WorkTaskSeeder,
      PersonalTaskSeeder,
      MeetingSeeder,
    ]

    return seeders.flatMap((s) => s.run())
  },
}
