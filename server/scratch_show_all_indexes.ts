import { Sequelize } from 'sequelize';
import { env } from './src/config/env.js';

const sequelize = new Sequelize(
    env.DB_NAME,
    env.DB_USER,
    env.DB_PASSWORD,
    {
        dialect: 'postgres',
        host: env.DB_HOST,
        port: Number(env.DB_PORT),
        logging: false
    }
);

async function checkAllIndexes() {
    try {
        const qi = sequelize.getQueryInterface();
        const [tables] = await sequelize.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        
        let foundFail = false;
        for (const table of tables as any[]) {
            const sql = (qi.queryGenerator as any).showIndexesQuery(table.tablename);
            const [rows] = await sequelize.query(sql);
            for (const row of rows as any[]) {
                const regex = /ON .*? (?:USING .*?\s)?\(([^]*)\)/gi;
                const match = regex.exec(row.definition);
                if (!match) {
                    console.log("FAIL on table", table.tablename, ":", row.definition);
                    foundFail = true;
                }
            }
        }
        if (!foundFail) console.log("All indexes parsed successfully.");
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

checkAllIndexes();
