/**
 * Habits Seed
 *
 * Exports `seedHabits()` — called automatically from src/index.ts on server start.
 */
import { Habit } from '../modules/auth/models/Habit.js';

const HABITS = [
    'Non-smoker',
    'Early Riser',
    'Social',
    'Work from Home',
    'Vegan',
    'Musician',
    'Gamer',
    'Chef at Home',
    'Pet Owner',
    'Very Clean',
    'Night Owl',
    'Quiet Lifestyle',
    'Fitness Enthusiast',
    'Student',
    'Minimalist',
    'Plant Parent',
    'Frequent Traveler',
    'Organized',
    'Eco-friendly',
    'Introverted',
];

/**
 * Upserts all habits in a single query. Silent and idempotent.
 */
export async function seedHabits(): Promise<void> {
    const rows = HABITS.map((name) => ({ name }));

    const results = await Habit.bulkCreate(rows, {
        ignoreDuplicates: true, // INSERT ... ON CONFLICT DO NOTHING
        logging: false,         // suppress SQL output on every server start
    });

    const created = results.filter((r) => r.isNewRecord === false ? false : true).length;
    if (created > 0) {
        console.log(`🌱 Seeded ${created} new habit record(s).`);
    }
}
