import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../../../config/database.js';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const MaintenanceConflictStatus = {
    OPEN: 'OPEN',
    RESOLVED: 'RESOLVED',
} as const;

export type MaintenanceConflictStatusType =
    (typeof MaintenanceConflictStatus)[keyof typeof MaintenanceConflictStatus];

export const MaintenanceConflictResolution = {
    /** Tenant pays — release escrow to provider */
    CHARGE_TENANT: 'CHARGE_TENANT',
    /** Provider pays — refund escrow to tenant */
    CHARGE_PROVIDER: 'CHARGE_PROVIDER',
} as const;

export type MaintenanceConflictResolutionType =
    (typeof MaintenanceConflictResolution)[keyof typeof MaintenanceConflictResolution];

// ─── Model ───────────────────────────────────────────────────────────────────

export class MaintenanceConflict extends Model<
    InferAttributes<MaintenanceConflict>,
    InferCreationAttributes<MaintenanceConflict>
> {
    declare id: CreationOptional<string>;

    declare request_id: ForeignKey<string>;
    declare opened_by_tenant_id: ForeignKey<string>;
    declare provider_id: ForeignKey<string>;

    declare tenant_reason: string;
    declare provider_completion_notes: string | null;

    declare status: CreationOptional<MaintenanceConflictStatusType>;
    declare resolution: CreationOptional<MaintenanceConflictResolutionType | null>;
    declare admin_notes: string | null;
    declare resolved_by_admin_id: ForeignKey<string> | null;
    declare resolved_at: Date | null;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

MaintenanceConflict.init(
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
        opened_by_tenant_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        provider_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        tenant_reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        provider_completion_notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(MaintenanceConflictStatus)),
            allowNull: false,
            defaultValue: MaintenanceConflictStatus.OPEN,
        },
        resolution: {
            type: DataTypes.ENUM(...Object.values(MaintenanceConflictResolution)),
            allowNull: true,
            defaultValue: null,
        },
        admin_notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        resolved_by_admin_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'users', key: 'id' },
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
        tableName: 'maintenance_conflicts',
        modelName: 'MaintenanceConflict',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['request_id'] },
            { fields: ['status'] },
        ],
    }
);

export default MaintenanceConflict;
