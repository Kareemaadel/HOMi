import sequelize from '../../../config/database.js';
import { User } from '../../auth/models/User.js';
import { Profile } from '../../auth/models/Profile.js';
import { Property } from '../../properties/models/Property.js';
import { Contract } from '../../contracts/models/Contract.js';

import { MaintenanceProviderApplication } from './MaintenanceProviderApplication.js';
import { MaintenanceRequest } from './MaintenanceRequest.js';
import { MaintenanceJobApplication } from './MaintenanceJobApplication.js';
import { MaintenanceLocation } from './MaintenanceLocation.js';
import { MaintenanceConflict } from './MaintenanceConflict.js';
import { MaintenanceRating } from './MaintenanceRating.js';
import { LandlordMaintenanceCharge } from './LandlordMaintenanceCharge.js';

// ─── MaintenanceProviderApplication ↔ User ─────────────────────────────────
MaintenanceProviderApplication.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── MaintenanceRequest ────────────────────────────────────────────────────
MaintenanceRequest.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlord' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'assigned_provider_id', as: 'provider' });
MaintenanceRequest.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });
MaintenanceRequest.belongsTo(Contract, { foreignKey: 'contract_id', as: 'contract' });

MaintenanceRequest.hasMany(MaintenanceJobApplication, {
    foreignKey: 'request_id',
    as: 'applications',
    onDelete: 'CASCADE',
});
MaintenanceRequest.hasOne(MaintenanceLocation, {
    foreignKey: 'request_id',
    as: 'currentLocation',
    onDelete: 'CASCADE',
});
MaintenanceRequest.hasOne(MaintenanceConflict, {
    foreignKey: 'request_id',
    as: 'conflict',
    onDelete: 'CASCADE',
});
MaintenanceRequest.hasOne(MaintenanceRating, {
    foreignKey: 'request_id',
    as: 'rating',
    onDelete: 'CASCADE',
});

// ─── MaintenanceJobApplication ─────────────────────────────────────────────
MaintenanceJobApplication.belongsTo(MaintenanceRequest, {
    foreignKey: 'request_id',
    as: 'request',
});
MaintenanceJobApplication.belongsTo(User, {
    foreignKey: 'provider_id',
    as: 'provider',
});

// ─── MaintenanceLocation ───────────────────────────────────────────────────
MaintenanceLocation.belongsTo(MaintenanceRequest, {
    foreignKey: 'request_id',
    as: 'request',
});
MaintenanceLocation.belongsTo(User, {
    foreignKey: 'provider_id',
    as: 'provider',
});

// ─── MaintenanceConflict ───────────────────────────────────────────────────
MaintenanceConflict.belongsTo(MaintenanceRequest, {
    foreignKey: 'request_id',
    as: 'request',
});
MaintenanceConflict.belongsTo(User, {
    foreignKey: 'opened_by_tenant_id',
    as: 'tenant',
});
MaintenanceConflict.belongsTo(User, {
    foreignKey: 'provider_id',
    as: 'provider',
});
MaintenanceConflict.belongsTo(User, {
    foreignKey: 'resolved_by_admin_id',
    as: 'admin',
});

// ─── MaintenanceRating ─────────────────────────────────────────────────────
MaintenanceRating.belongsTo(MaintenanceRequest, {
    foreignKey: 'request_id',
    as: 'request',
});
MaintenanceRating.belongsTo(User, {
    foreignKey: 'provider_id',
    as: 'provider',
});
MaintenanceRating.belongsTo(User, {
    foreignKey: 'tenant_id',
    as: 'tenant',
});
User.hasMany(MaintenanceRating, {
    foreignKey: 'provider_id',
    as: 'maintenanceRatings',
});

// ─── LandlordMaintenanceCharge ─────────────────────────────────────────────
LandlordMaintenanceCharge.belongsTo(MaintenanceRequest, {
    foreignKey: 'request_id',
    as: 'request',
});
LandlordMaintenanceCharge.belongsTo(Contract, {
    foreignKey: 'contract_id',
    as: 'contract',
});
LandlordMaintenanceCharge.belongsTo(User, {
    foreignKey: 'landlord_id',
    as: 'landlord',
});
LandlordMaintenanceCharge.belongsTo(User, {
    foreignKey: 'tenant_id',
    as: 'tenant',
});

export {
    sequelize,
    User,
    Profile,
    Property,
    Contract,
    MaintenanceProviderApplication,
    MaintenanceRequest,
    MaintenanceJobApplication,
    MaintenanceLocation,
    MaintenanceConflict,
    MaintenanceRating,
    LandlordMaintenanceCharge,
};

export default {
    MaintenanceProviderApplication,
    MaintenanceRequest,
    MaintenanceJobApplication,
    MaintenanceLocation,
    MaintenanceConflict,
    MaintenanceRating,
    LandlordMaintenanceCharge,
};
