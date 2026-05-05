import { env } from '../config/env.js';
import User, { UserRole } from '../modules/auth/models/User.js';
import Profile from '../modules/auth/models/Profile.js';

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
        const user = await User.create({
            email,
            password_hash: password,
            role: UserRole.ADMIN,
            is_verified: true,
            email_verified: true,
        });

        // Also create a profile for the admin
        await Profile.create({
            user_id: user.id,
            first_name: 'HOMi',
            last_name: 'Admin',
            phone_number: '0000000000',
            onboarding_step2_completed: true,
            onboarding_step3_completed: true,
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

    // Ensure profile exists for existing admin
    const profile = await Profile.findOne({ where: { user_id: existingAdmin.id } });
    if (!profile) {
        await Profile.create({
            user_id: existingAdmin.id,
            first_name: 'HOMi',
            last_name: 'Admin',
            phone_number: '0000000000',
            onboarding_step2_completed: true,
            onboarding_step3_completed: true,
        });
        console.log(`🌱 Created missing profile for admin: ${email}`);
    }
}
