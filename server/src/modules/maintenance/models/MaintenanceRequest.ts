import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
    type NonAttribute,
    type Association,
} from 'sequelize';
import sequelize from '../../../config/database.js';

import type { User } from '../../auth/models/User.js';
import type { Property } from '../../properties/models/Property.js';
import type { Contract } from '../../contracts/models/Contract.js';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const MaintenanceRequestStatus = {
    OPEN: 'OPEN',                           // Posted by tenant, accepting applications
    ASSIGNED: 'ASSIGNED',                   // Tenant accepted a provider; escrow held
    EN_ROUTE: 'EN_ROUTE',                   // Provider is travelling to the property
    IN_PROGRESS: 'IN_PROGRESS',             // Provider arrived/started the job
    AWAITING_CONFIRMATION: 'AWAITING_CONFIRMATION', // Provider marked complete; tenant must confirm
    COMPLETED: 'COMPLETED',                 // Tenant confirmed; escrow released
    DISPUTED: 'DISPUTED',                   // Tenant said not solved; admin must resolve
    RESOLVED_BY_ADMIN: 'RESOLVED_BY_ADMIN', // Admin made a ruling
    CANCELLED: 'CANCELLED',                 // Cancelled by tenant before assignment
} as const;

export type MaintenanceRequestStatusType =
    (typeof MaintenanceRequestStatus)[keyof typeof MaintenanceRequestStatus];

export const MaintenanceUrgency = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
} as const;

export type MaintenanceUrgencyType =
    (typeof MaintenanceUrgency)[keyof typeof MaintenanceUrgency];

export const MaintenanceChargeParty = {
    TENANT: 'TENANT',
    LANDLORD: 'LANDLORD',
} as const;

export type MaintenanceChargePartyType =
    (typeof MaintenanceChargeParty)[keyof typeof MaintenanceChargeParty];

// ─── Model ───────────────────────────────────────────────────────────────────

export class MaintenanceRequest extends Model<
    InferAttributes<MaintenanceRequest>,
    InferCreationAttributes<MaintenanceRequest>
> {
    declare id: CreationOptional<string>;

    declare tenant_id: ForeignKey<string>;
    declare property_id: ForeignKey<string>;
    declare contract_id: ForeignKey<string> | null;
    declare landlord_id: ForeignKey<string>;
    declare assigned_provider_id: ForeignKey<string> | null;
    declare accepted_application_id: CreationOptional<string | null>;

    declare category: string;
    declare title: string;
    declare description: string;
    declare urgency: CreationOptional<MaintenanceUrgencyType>;
    declare estimated_budget: number | null;
    declare images: CreationOptional<string[]>;

    declare status: CreationOptional<MaintenanceRequestStatusType>;
    declare charge_party: CreationOptional<MaintenanceChargePartyType>;

    // Final price agreed when an application is accepted
    declare agreed_price: number | null;

    // Amount held in escrow from tenant wallet
    declare escrow_amount: CreationOptional<number>;

    // Provider completion artifacts
    declare completion_notes: string | null;
    declare completion_images: CreationOptional<string[]>;

    declare en_route_started_at: Date | null;
    declare in_progress_started_at: Date | null;
    declare provider_completed_at: Date | null;
    declare tenant_confirmed_at: Date | null;
    declare disputed_at: Date | null;
    declare disputed_reason: string | null;
    declare resolved_at: Date | null;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    // Associations
    declare tenant?: NonAttribute<User>;
    declare landlord?: NonAttribute<User>;
    declare provider?: NonAttribute<User>;
    declare property?: NonAttribute<Property>;
    declare contract?: NonAttribute<Contract>;

    declare static readonly associations: {
        tenant: Association<MaintenanceRequest, User>;
        landlord: Association<MaintenanceRequest, User>;
        provider: Association<MaintenanceRequest, User>;
        property: Association<MaintenanceRequest, Property>;
        contract: Association<MaintenanceRequest, Contract>;
    };
}

MaintenanceRequest.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tenant_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        property_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'properties', key: 'id' },
        },
        contract_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'contracts', key: 'id' },
        },
        landlord_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        assigned_provider_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'users', key: 'id' },
        },
        accepted_application_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        urgency: {
            type: DataTypes.ENUM(...Object.values(MaintenanceUrgency)),
            allowNull: false,
            defaultValue: MaintenanceUrgency.MEDIUM,
        },
        estimated_budget: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
        },
        images: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
        },
        status: {
            type: DataTypes.ENUM(...Object.values(MaintenanceRequestStatus)),
            allowNull: false,
            defaultValue: MaintenanceRequestStatus.OPEN,
        },
        charge_party: {
            type: DataTypes.ENUM(...Object.values(MaintenanceChargeParty)),
            allowNull: false,
            defaultValue: MaintenanceChargeParty.TENANT,
        },
        agreed_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
        },
        escrow_amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
        },
        completion_notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        completion_images: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
        },
        en_route_started_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        in_progress_started_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        provider_completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tenant_confirmed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        disputed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        disputed_reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        resolved_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'maintenance_requests',
        modelName: 'MaintenanceRequest',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['tenant_id'] },
            { fields: ['landlord_id'] },
            { fields: ['property_id'] },
            { fields: ['assigned_provider_id'] },
            { fields: ['status'] },
            { fields: ['category'] },
        ],
    }
);

export default MaintenanceRequest;
