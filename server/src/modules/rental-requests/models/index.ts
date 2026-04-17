import sequelize from '../../../config/database.js';
import { User } from '../../auth/models/User.js';
import { Property } from '../../properties/models/Property.js';
import { Profile } from '../../auth/models/Profile.js';
import {
    RentalRequest,
    RentalRequestDuration,
    RentalRequestStatus,
    LivingSituation,
    type RentalRequestDurationType,
    type RentalRequestStatusType,
    type LivingSituationType,
} from './RentalRequest.js';

// ─── Associations ─────────────────────────────────────────────────────────────

// RentalRequest belongs to User (tenant)
RentalRequest.belongsTo(User, {
    foreignKey: 'tenant_id',
    as: 'tenant',
});

// User has many RentalRequests
User.hasMany(RentalRequest, {
    foreignKey: 'tenant_id',
    as: 'rentalRequests',
});

// RentalRequest belongs to Property
RentalRequest.belongsTo(Property, {
    foreignKey: 'property_id',
    as: 'property',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Property has many RentalRequests
Property.hasMany(RentalRequest, {
    foreignKey: 'property_id',
    as: 'rentalRequests',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
    sequelize,
    RentalRequest,
    RentalRequestDuration,
    RentalRequestStatus,
    LivingSituation,
    User,
    Property,
    Profile,
};

export type { RentalRequestDurationType, RentalRequestStatusType, LivingSituationType };

export default {
    sequelize,
    RentalRequest,
};
