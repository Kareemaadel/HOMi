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

async function testShowIndex() {
    try {
        const qi = sequelize.getQueryInterface();
        const sql = (qi.queryGenerator as any).showIndexesQuery('rental_requests');
        console.log("SQL:", sql);
        const [rows] = await sequelize.query(sql);
        console.log("Rows length:", rows.length);
        for (const row of rows as any[]) {
            console.log(row.indname, '=>', row.definition);
            const regex = /ON .*? (?:USING .*?\s)?\(([^]*)\)/gi;
            const match = regex.exec(row.definition);
            if (!match) {
                console.log("FAIL:", row.definition);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
testShowIndex();
