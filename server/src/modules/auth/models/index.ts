import sequelize from '../../../config/database.js';
import { User, UserRole, type UserRoleType } from './User.js';
import { Profile, Gender, type GenderType } from './Profile.js';
import { Habit } from './Habit.js';
import { UserHabit } from './UserHabit.js';
import { UserPasskey } from './UserPasskey.js';
import { WebAuthnChallenge } from './WebAuthnChallenge.js';

// ─── User ↔ Profile Associations ──────────────────────────────────────────────
User.hasOne(Profile, {
    foreignKey: 'user_id',
    as: 'profile',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Profile.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
});

// ─── User ↔ Habit Many-to-Many ────────────────────────────────────────────────
User.belongsToMany(Habit, {
    through: UserHabit,
    foreignKey: 'user_id',
    otherKey: 'habit_id',
    as: 'habits',
});

Habit.belongsToMany(User, {
    through: UserHabit,
    foreignKey: 'habit_id',
    otherKey: 'user_id',
    as: 'users',
});

User.hasMany(UserPasskey, { foreignKey: 'user_id', as: 'passkeys', onDelete: 'CASCADE' });
UserPasskey.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(WebAuthnChallenge, { foreignKey: 'user_id', as: 'webauthnChallenges', onDelete: 'CASCADE' });
WebAuthnChallenge.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Export all models and types
export {
    sequelize,
    User,
    UserRole,
    Profile,
    Gender,
    Habit,
    UserHabit,
    UserPasskey,
    WebAuthnChallenge,
};

export type { UserRoleType, GenderType };

// Export default as object with all models for convenience
export default {
    sequelize,
    User,
    Profile,
    Habit,
    UserHabit,
    UserPasskey,
    WebAuthnChallenge,
};
