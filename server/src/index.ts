import { env } from './config/env.js';
import { testConnection, syncDatabase } from './config/database.js';
import { seedAmenities } from './seeds/amenities.seed.js';
import { seedHouseRules } from './seeds/house_rules.seed.js';
import { seedHabits } from './seeds/habits.seed.js';
import app from './app.js';

// ======================
// Start Server
// ======================
async function startServer(): Promise<void> {
    try {
        await testConnection();
        await syncDatabase(false);
        await seedAmenities();
        await seedHouseRules();
        await seedHabits();

        app.listen(env.PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏠 HOMi API Server                                       ║
║                                                            ║
║   Environment: ${env.NODE_ENV.padEnd(40)}║
║   Port:        ${String(env.PORT).padEnd(40)}║
║   URL:         http://localhost:${String(env.PORT).padEnd(26)}║
║   API Docs:    http://localhost:${String(env.PORT)}/api-docs${' '.repeat(18)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export default app;
