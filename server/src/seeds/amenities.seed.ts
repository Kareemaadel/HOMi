/**
 * Amenities Seed
 *
 * Exports `seedAmenities()` — called automatically from src/index.ts on server start.
 * To run standalone: npm run seed:amenities
 */
import { Amenity } from '../modules/properties/models/Amenity.js';

const AMENITIES = [
    'Private Parking',
    'Smart Home System',
    '24/7 Concierge',
    'Fitness Center',
    'High-Speed Wi-Fi',
    'Pet Friendly',
    'EV Charging Station',
    'Keyless / Biometric Entry',
    'Rooftop Lounge',
    'Spa & Sauna',
    'Private Cinema / Theater Room',
    'Valet Parking',
    'Co-working Space / Business Center',
    '24/7 Security System',
    'Air Conditioning (A/C)',
    'Kids Play Area',
    'Intercom System',
    '24/7 Compound Security',
];

/**
 * Upserts all amenities in a single query. Silent and idempotent.
 */
export async function seedAmenities(): Promise<void> {
    const rows = AMENITIES.map((name) => ({ name }));

    const results = await Amenity.bulkCreate(rows, {
        ignoreDuplicates: true, // INSERT ... ON CONFLICT DO NOTHING
        logging: false,         // suppress SQL output on every server start
    });

    const created = results.filter((r) => r.isNewRecord === false ? false : true).length;
    if (created > 0) {
        console.log(`🌱 Seeded ${created} new amenity record(s).`);
    }
}

