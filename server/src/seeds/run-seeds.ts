
import '../modules/properties/models/index.js';
import '../modules/auth/models/index.js';
import sequelize from '../config/database.js';
import { seedAmenities } from './amenities.seed.js';
import { seedHabits } from './habits.seed.js';
import { seedHouseRules } from './house_rules.seed.js';

(async () => {
    try {
        console.log('🔌 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected. Running seeds...');

        await seedAmenities();
        await seedHabits();
        await seedHouseRules();

        console.log('🌱 All seeds complete.');
        await sequelize.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err);
        await sequelize.close();
        process.exit(1);
    }
})();
