/**
 * Standalone runner for the amenities seed.
 * Usage: npm run seed:amenities
 */
import '../modules/properties/models/index.js';
import sequelize from '../config/database.js';
import { seedAmenities } from './amenities.seed.js';

(async () => {
    try {
        console.log('🔌 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected.');
        await seedAmenities();
        console.log('🎉 Done.');
        await sequelize.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err);
        await sequelize.close();
        process.exit(1);
    }
})();
