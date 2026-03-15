import sequelize from '../../../config/database.js';
import { User, UserRole, type UserRoleType } from './User.js';
import { Profile, Gender, type GenderType } from './Profile.js';
import { Habit } from './Habit.js';
import { UserHabit } from './UserHabit.js';

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

// Export all models and types
export {
    sequelize,
    User,
    UserRole,
    Profile,
    Gender,
    Habit,
    UserHabit,
};

export type { UserRoleType, GenderType };

// Export default as object with all models for convenience
export default {
    sequelize,
    User,
    Profile,
    Habit,
    UserHabit,
};
