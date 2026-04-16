import { createServer } from 'node:http';
import { env } from './config/env.js';
import { testConnection, syncDatabase } from './config/database.js';
import { seedAmenities } from './seeds/amenities.seed.js';
import { seedHouseRules } from './seeds/house_rules.seed.js';
import { seedHabits } from './seeds/habits.seed.js';
import app from './app.js';
import { initSocketServer } from './shared/realtime/socket.js';

try {
    await testConnection();
    await syncDatabase(false);
    await seedAmenities();
    await seedHouseRules();
    await seedHabits();

    const httpServer = createServer(app);
    initSocketServer(httpServer);

    httpServer.listen(env.PORT, () => {
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

export default app;
