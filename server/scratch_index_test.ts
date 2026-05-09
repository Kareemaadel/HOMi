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

async function checkIndexes() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        const [results] = await sequelize.query(`
            SELECT
                i.relname AS index_name,
                pg_get_indexdef(i.oid) AS definition
            FROM pg_class t
            JOIN pg_index ix ON t.oid = ix.indrelid
            JOIN pg_class i ON i.oid = ix.indexrelid
            WHERE t.relkind = 'r'
              AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
        `);
        
        for (const row of results as any[]) {
            const regex = /ON .*? (?:USING .*?\s)?\(([^]*)\)/gi;
            const match = regex.exec(row.definition);
            if (!match) {
                console.log('FAIL:', row.index_name, '=>', row.definition);
            }
        }
        console.log('Done checking.');
    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

checkIndexes();
