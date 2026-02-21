/**
 * House Rules Seed
 *
 * Exports `seedHouseRules()` — called automatically from src/index.ts on server start.
 * To run standalone: npm run seed:house-rules
 */
import { HouseRule } from '../modules/properties/models/HouseRule.js';

const HOUSE_RULES = [
    'No Smoking',
    'Pets Allowed',
    'No Parties or Events',
    'Quiet Hours (10 PM - 8 AM)',
    'No Additional Guests',
    'No Shoes Inside',
    'Respect Neighbours',
    'Children Welcome',
    'No Cooking of Strong-Smelling Food',
    'Recycling Required',
    'No Open Flames / Candles',
    'CCTV on Premises',
];

/**
 * Upserts all house rules in a single query. Silent and idempotent.
 */
export async function seedHouseRules(): Promise<void> {
    const rows = HOUSE_RULES.map((name) => ({ name }));

    const results = await HouseRule.bulkCreate(rows, {
        ignoreDuplicates: true, // INSERT ... ON CONFLICT DO NOTHING
        logging: false,         // suppress SQL output on every server start
    });

    const created = results.filter((r) => r.isNewRecord === false ? false : true).length;
    if (created > 0) {
        console.log(`🌱 Seeded ${created} new house rule record(s).`);
    }
}
