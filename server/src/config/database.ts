import { Sequelize, type Options } from 'sequelize';
import { env } from './env.js';

const getDatabaseConfig = (): Options => {
    // Use DATABASE_URL if available (for production/cloud deployments)
    if (env.DATABASE_URL) {
        const config: Options = {
            dialect: 'postgres',
            logging: false,
            pool: {
                max: 10,
                min: 2,
                acquire: 30000,
                idle: 30000,
            },
            define: {
                timestamps: true,
                underscored: true,
                paranoid: false,
            },
            dialectOptions: env.NODE_ENV === 'production' ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            } : {},
        };
        return config;
    }

    // Use individual credentials for development
    const config: Options = {
        dialect: 'postgres',
        logging: false,
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        username: env.DB_USER,
        password: env.DB_PASSWORD,
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 30000,
        },
        define: {
            timestamps: true,
            underscored: true,
            paranoid: false,
        },
    };
    return config;
};

// Create Sequelize instance
const sequelizeConfig = getDatabaseConfig();

export const sequelize = env.DATABASE_URL
    ? new Sequelize(env.DATABASE_URL, sequelizeConfig)
    : new Sequelize(sequelizeConfig);

// Test database connection
export const testConnection = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        throw error;
    }
};

// Sync database (use with caution in production)
export const syncDatabase = async (force: boolean = false): Promise<void> => {
    try {
        // ─── Dev pre-sync migration ────────────────────────────────────────
        // Drop legacy columns that were renamed so ALTER TABLE doesn't conflict.
        // These queries are idempotent (IF EXISTS) and only run in development.
        if (env.NODE_ENV === 'development' && !force) {
            await sequelize.query(`
                ALTER TABLE IF EXISTS "properties"
                    DROP COLUMN IF EXISTS "price";
            `);
            // Add new profile.gender enum value for existing PostgreSQL databases
            await sequelize.query(`
                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM pg_type t
                        WHERE t.typname = 'enum_profiles_gender'
                    ) AND NOT EXISTS (
                        SELECT 1 FROM pg_enum e
                        JOIN pg_type t ON e.enumtypid = t.oid
                        WHERE t.typname = 'enum_profiles_gender'
                          AND e.enumlabel = 'PREFER_NOT_TO_SAY'
                    ) THEN
                        ALTER TYPE enum_profiles_gender ADD VALUE 'PREFER_NOT_TO_SAY';
                    END IF;
                END $$;
            `);
            await sequelize.query(`
                ALTER TABLE IF EXISTS "profiles"
                    ADD COLUMN IF NOT EXISTS "current_location" VARCHAR(255);
            `);
        }
        // ──────────────────────────────────────────────────────────────────

        await sequelize.sync({ force, alter: env.NODE_ENV === 'development' });
        console.log('✅ Database synchronized successfully.');
    } catch (error) {
        console.error('❌ Database synchronization failed:', error);
        throw error;
    }
};

export default sequelize;
