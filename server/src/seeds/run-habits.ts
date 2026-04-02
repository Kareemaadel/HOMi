
import '../modules/auth/models/index.js';
import sequelize from '../config/database.js';
import { seedHabits } from './habits.seed.js';

(async () => {
    try {
        console.log('🔌 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected.');
        await seedHabits();
        console.log('🎉 Done.');
        await sequelize.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err);
        await sequelize.close();
        process.exit(1);
    }
})();
