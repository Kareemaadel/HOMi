import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type NonAttribute,
    type Association,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../../../config/database.js';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const RentalRequestDuration = {
    SIX_MONTHS: '6_MONTHS',
    TWELVE_MONTHS: '12_MONTHS',
    TWENTY_FOUR_MONTHS: '24_MONTHS',
} as const;

// Supports 1 to 120 months (up to 10 years) while preserving legacy values.
export const RentalRequestDurationValues = Array.from(
    { length: 120 },
    (_, index) => `${index + 1}_MONTHS`
);

export type RentalRequestDurationType = `${number}_MONTHS`;

export const LivingSituation = {
    SINGLE: 'SINGLE',
    FAMILY: 'FAMILY',
    MARRIED: 'MARRIED',
    STUDENTS: 'STUDENTS',
} as const;

export type LivingSituationType = (typeof LivingSituation)[keyof typeof LivingSituation];

export const RentalRequestStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    DECLINED: 'DECLINED',
} as const;

export type RentalRequestStatusType = (typeof RentalRequestStatus)[keyof typeof RentalRequestStatus];

// ─── Forward declarations ──────────────────────────────────────────────────
import type { User } from '../../auth/models/User.js';
import type { Property } from '../../properties/models/Property.js';

export class RentalRequest extends Model<
    InferAttributes<RentalRequest>,
    InferCreationAttributes<RentalRequest>
> {
    // Primary key
    declare id: CreationOptional<string>;

    // Foreign keys
    declare tenant_id: ForeignKey<string>;
    declare property_id: ForeignKey<string>;

    // Form fields
    declare move_in_date: Date;
    declare duration: RentalRequestDurationType;
    declare occupants: number;
    declare living_situation: LivingSituationType;
    declare message: CreationOptional<string | null>;

    // Status
    declare status: CreationOptional<RentalRequestStatusType>;

    // Timestamps
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    // Associations
    declare tenant?: NonAttribute<User>;
    declare property?: NonAttribute<Property>;
    declare static associations: {
        tenant: Association<RentalRequest, User>;
        property: Association<RentalRequest, Property>;
    };
}

RentalRequest.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tenant_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        property_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'properties',
                key: 'id',
            },
        },
        move_in_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        duration: {
            type: DataTypes.ENUM(...RentalRequestDurationValues),
            allowNull: false,
        },
        occupants: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
            },
        },
        living_situation: {
            type: DataTypes.ENUM(...Object.values(LivingSituation)),
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(RentalRequestStatus)),
            allowNull: false,
            defaultValue: RentalRequestStatus.PENDING,
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
        tableName: 'rental_requests',
        modelName: 'RentalRequest',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['tenant_id'] },
            { fields: ['property_id'] },
            { fields: ['status'] },
            {
                unique: true,
                fields: ['tenant_id', 'property_id'],
                name: 'unique_tenant_property_request',
            },
        ],
    }
);

export default RentalRequest;
