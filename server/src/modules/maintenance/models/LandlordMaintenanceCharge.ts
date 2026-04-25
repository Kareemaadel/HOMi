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

export const LandlordMaintenanceChargeStatus = {
    /** Tenant paid the maintainer; landlord owes this amount. To be deducted from next rent. */
    PENDING: 'PENDING',
    /** Already applied as a credit to the tenant's next rent payment. */
    APPLIED: 'APPLIED',
    /** Cancelled (e.g. admin reversed in conflict). */
    CANCELLED: 'CANCELLED',
} as const;

export type LandlordMaintenanceChargeStatusType =
    (typeof LandlordMaintenanceChargeStatus)[keyof typeof LandlordMaintenanceChargeStatus];

// ─── Model ───────────────────────────────────────────────────────────────────

/**
 * When a maintenance request is the landlord's responsibility per the contract,
 * the tenant still pays the maintainer up-front from their wallet, and the amount
 * is logged here so it can be deducted from the next rent payment to the landlord.
 */
export class LandlordMaintenanceCharge extends Model<
    InferAttributes<LandlordMaintenanceCharge>,
    InferCreationAttributes<LandlordMaintenanceCharge>
> {
    declare id: CreationOptional<string>;
    declare request_id: ForeignKey<string>;
    declare contract_id: ForeignKey<string>;
    declare landlord_id: ForeignKey<string>;
    declare tenant_id: ForeignKey<string>;
    declare amount: number;
    declare status: CreationOptional<LandlordMaintenanceChargeStatusType>;
    declare applied_at: Date | null;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

LandlordMaintenanceCharge.init(
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
        contract_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'contracts', key: 'id' },
        },
        landlord_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        tenant_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(LandlordMaintenanceChargeStatus)),
            allowNull: false,
            defaultValue: LandlordMaintenanceChargeStatus.PENDING,
        },
        applied_at: {
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
        tableName: 'landlord_maintenance_charges',
        modelName: 'LandlordMaintenanceCharge',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['contract_id', 'status'] },
            { fields: ['landlord_id'] },
            { fields: ['tenant_id'] },
        ],
    }
);

export default LandlordMaintenanceCharge;
