import { env } from '../config/env.js';
import User, { UserRole } from '../modules/auth/models/User.js';

/**
 * Ensures a deterministic admin account exists for local testing.
 * Idempotent on every startup.
 */
export async function seedAdminAccount(): Promise<void> {
    const email = env.ADMIN_SEED_EMAIL.trim().toLowerCase();
    const password = env.ADMIN_SEED_PASSWORD;

    const existingAdmin = await User.findOne({
        where: { email },
        paranoid: false,
    });

    if (!existingAdmin) {
        await User.create({
            email,
            password_hash: password,
            role: UserRole.ADMIN,
            is_verified: true,
            email_verified: true,
        });

        console.log(`🌱 Seeded admin account: ${email}`);
        return;
    }

    if (existingAdmin.deleted_at) {
        await existingAdmin.restore();
    }

    const hasSeedPassword = await existingAdmin.comparePassword(password);
    const needsUpdate =
        existingAdmin.role !== UserRole.ADMIN ||
        !hasSeedPassword ||
        !existingAdmin.is_verified ||
        !existingAdmin.email_verified;

    if (needsUpdate) {
        existingAdmin.role = UserRole.ADMIN;
        existingAdmin.password_hash = password;
        existingAdmin.is_verified = true;
        existingAdmin.email_verified = true;
        await existingAdmin.save();
        console.log(`🌱 Updated seeded admin account: ${email}`);
    }
}
