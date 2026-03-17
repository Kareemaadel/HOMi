import sequelize from '../../../config/database.js';
import { User } from '../../auth/models/User.js';
import { Profile } from '../../auth/models/Profile.js';
import { Property } from '../../properties/models/Property.js';
import { RentalRequest } from '../../rental-requests/models/RentalRequest.js';
import { PropertySpecifications } from '../../properties/models/PropertySpecifications.js';
import {
    Contract,
    ContractStatus,
    PaymentSchedule,
    RentDueDate,
    type ContractStatusType,
    type PaymentScheduleType,
    type RentDueDateType,
} from './Contract.js';
import {
    ContractMaintenanceResponsibility,
    MaintenanceArea,
    ResponsibleParty,
    type MaintenanceAreaType,
    type ResponsiblePartyType,
} from './ContractMaintenanceResponsibility.js';

// ─── Associations ─────────────────────────────────────────────────────────────

// Contract belongs to RentalRequest
Contract.belongsTo(RentalRequest, {
    foreignKey: 'rental_request_id',
    as: 'rentalRequest',
});

RentalRequest.hasOne(Contract, {
    foreignKey: 'rental_request_id',
    as: 'contract',
});

// Contract belongs to Property
Contract.belongsTo(Property, {
    foreignKey: 'property_id',
    as: 'property',
});

Property.hasMany(Contract, {
    foreignKey: 'property_id',
    as: 'contracts',
});

// Contract belongs to User (landlord)
Contract.belongsTo(User, {
    foreignKey: 'landlord_id',
    as: 'landlord',
});

// Contract belongs to User (tenant)
Contract.belongsTo(User, {
    foreignKey: 'tenant_id',
    as: 'tenant',
});

// Contract has many MaintenanceResponsibilities
Contract.hasMany(ContractMaintenanceResponsibility, {
    foreignKey: 'contract_id',
    as: 'maintenanceResponsibilities',
    onDelete: 'CASCADE',
});

ContractMaintenanceResponsibility.belongsTo(Contract, {
    foreignKey: 'contract_id',
    as: 'contract',
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
    sequelize,
    Contract,
    ContractStatus,
    PaymentSchedule,
    RentDueDate,
    ContractMaintenanceResponsibility,
    MaintenanceArea,
    ResponsibleParty,
    User,
    Profile,
    Property,
    RentalRequest,
    PropertySpecifications,
};

export type {
    ContractStatusType,
    PaymentScheduleType,
    RentDueDateType,
    MaintenanceAreaType,
    ResponsiblePartyType,
};

export default {
    sequelize,
    Contract,
    ContractMaintenanceResponsibility,
};
