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
import type { MaintenanceRequest } from './MaintenanceRequest.js';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const MaintenanceJobApplicationStatus = {
    PENDING: 'PENDING',     // Tenant has not decided
    ACCEPTED: 'ACCEPTED',   // Tenant accepted this provider
    REJECTED: 'REJECTED',   // Another provider was accepted, or tenant rejected this one
    WITHDRAWN: 'WITHDRAWN', // Provider withdrew the bid
} as const;

export type MaintenanceJobApplicationStatusType =
    (typeof MaintenanceJobApplicationStatus)[keyof typeof MaintenanceJobApplicationStatus];

// ─── Model ───────────────────────────────────────────────────────────────────

export class MaintenanceJobApplication extends Model<
    InferAttributes<MaintenanceJobApplication>,
    InferCreationAttributes<MaintenanceJobApplication>
> {
    declare id: CreationOptional<string>;

    declare request_id: ForeignKey<string>;
    declare provider_id: ForeignKey<string>;

    // Final price (parts + labour + everything) the maintainer is committing to
    declare final_price: number;
    // Optional breakdown shown to tenant
    declare price_breakdown: string | null;
    // Optional message/cover note
    declare cover_note: string | null;
    // ETA hours (e.g. how long after acceptance until provider arrives)
    declare eta_hours: number | null;

    declare status: CreationOptional<MaintenanceJobApplicationStatusType>;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    // Associations
    declare request?: NonAttribute<MaintenanceRequest>;
    declare provider?: NonAttribute<User>;

    declare static readonly associations: {
        request: Association<MaintenanceJobApplication, MaintenanceRequest>;
        provider: Association<MaintenanceJobApplication, User>;
    };
}

MaintenanceJobApplication.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        request_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'maintenance_requests', key: 'id' },
            onDelete: 'CASCADE',
        },
        provider_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        final_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: { min: 0 },
        },
        price_breakdown: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        cover_note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        eta_hours: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(MaintenanceJobApplicationStatus)),
            allowNull: false,
            defaultValue: MaintenanceJobApplicationStatus.PENDING,
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
        tableName: 'maintenance_job_applications',
        modelName: 'MaintenanceJobApplication',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['request_id'] },
            { fields: ['provider_id'] },
            { fields: ['status'] },
            { unique: true, fields: ['request_id', 'provider_id'] },
        ],
    }
);

export default MaintenanceJobApplication;
