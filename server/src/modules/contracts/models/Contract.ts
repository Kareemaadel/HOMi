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

export const ContractStatus = {
    PENDING_LANDLORD: 'PENDING_LANDLORD',
    PENDING_TENANT: 'PENDING_TENANT',
    ACTIVE: 'ACTIVE',
    TERMINATED: 'TERMINATED',
    EXPIRED: 'EXPIRED',
} as const;

export type ContractStatusType = (typeof ContractStatus)[keyof typeof ContractStatus];

export const PaymentSchedule = {
    MONTHLY: 'MONTHLY',
    QUARTERLY: 'QUARTERLY',
    ANNUALLY: 'ANNUALLY',
} as const;

export type PaymentScheduleType = (typeof PaymentSchedule)[keyof typeof PaymentSchedule];

export const RentDueDate = {
    FIRST_OF_MONTH: '1ST_OF_MONTH',
    FIFTH_OF_MONTH: '5TH_OF_MONTH',
    LAST_DAY_OF_MONTH: 'LAST_DAY_OF_MONTH',
} as const;

export type RentDueDateType = (typeof RentDueDate)[keyof typeof RentDueDate];

// ─── Forward declarations ──────────────────────────────────────────────────
import type { User } from '../../auth/models/User.js';
import type { Property } from '../../properties/models/Property.js';
import type { RentalRequest } from '../../rental-requests/models/RentalRequest.js';
import type { ContractMaintenanceResponsibility } from './ContractMaintenanceResponsibility.js';

export class Contract extends Model<
    InferAttributes<Contract>,
    InferCreationAttributes<Contract>
> {
    // Primary key
    declare id: CreationOptional<string>;

    // Readable identifiers
    declare contract_id: string;
    declare lease_id: CreationOptional<string | null>;

    // Foreign keys
    declare rental_request_id: ForeignKey<string>;
    declare property_id: ForeignKey<string>;
    declare landlord_id: ForeignKey<string>;
    declare tenant_id: ForeignKey<string>;

    // Status
    declare status: CreationOptional<ContractStatusType>;

    // Financial terms (set by landlord in step 1)
    declare rent_amount: CreationOptional<number | null>;
    declare security_deposit: CreationOptional<number | null>;
    declare service_fee: CreationOptional<number>;
    declare payment_schedule: CreationOptional<PaymentScheduleType>;
    declare rent_due_date: CreationOptional<RentDueDateType | null>;
    declare late_fee_amount: CreationOptional<number | null>;

    // Occupancy rules (set by landlord in step 1)
    declare max_occupants: CreationOptional<number | null>;

    // Lease dates
    declare move_in_date: Date;
    declare lease_duration_months: number;

    // Landlord identity (step 2)
    declare landlord_national_id: CreationOptional<string | null>;

    // Property ownership (step 3)
    declare property_registration_number: CreationOptional<string | null>;

    // Landlord signature (step 5)
    declare landlord_signature_url: CreationOptional<string | null>;
    declare landlord_signed_at: CreationOptional<Date | null>;

    // Tenant identity (step 2)
    declare tenant_national_id: CreationOptional<string | null>;
    declare tenant_emergency_contact_name: CreationOptional<string | null>;
    declare tenant_emergency_phone: CreationOptional<string | null>;

    // Tenant signature (step 4)
    declare tenant_signature_url: CreationOptional<string | null>;
    declare tenant_signed_at: CreationOptional<Date | null>;
    declare tenant_agreed_terms: CreationOptional<boolean>;

    // Timestamps
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    // Associations
    declare rentalRequest?: NonAttribute<RentalRequest>;
    declare property?: NonAttribute<Property>;
    declare landlord?: NonAttribute<User>;
    declare tenant?: NonAttribute<User>;
    declare maintenanceResponsibilities?: NonAttribute<ContractMaintenanceResponsibility[]>;
    declare static associations: {
        rentalRequest: Association<Contract, RentalRequest>;
        property: Association<Contract, Property>;
        landlord: Association<Contract, User>;
        tenant: Association<Contract, User>;
        maintenanceResponsibilities: Association<Contract, ContractMaintenanceResponsibility>;
    };
}

Contract.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        contract_id: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        lease_id: {
            type: DataTypes.STRING(20),
            allowNull: true,
            unique: true,
        },
        rental_request_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'rental_requests',
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
        landlord_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        tenant_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        status: {
            type: DataTypes.ENUM(...Object.values(ContractStatus)),
            allowNull: false,
            defaultValue: ContractStatus.PENDING_LANDLORD,
        },
        rent_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        security_deposit: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        service_fee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 10.00,
        },
        payment_schedule: {
            type: DataTypes.ENUM(...Object.values(PaymentSchedule)),
            allowNull: false,
            defaultValue: PaymentSchedule.MONTHLY,
        },
        rent_due_date: {
            type: DataTypes.ENUM(...Object.values(RentDueDate)),
            allowNull: true,
        },
        late_fee_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        max_occupants: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        move_in_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        lease_duration_months: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        landlord_national_id: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        property_registration_number: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        landlord_signature_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        landlord_signed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tenant_national_id: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        tenant_emergency_contact_name: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        tenant_emergency_phone: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        tenant_signature_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        tenant_signed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tenant_agreed_terms: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
        tableName: 'contracts',
        modelName: 'Contract',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['rental_request_id'] },
            { fields: ['property_id'] },
            { fields: ['landlord_id'] },
            { fields: ['tenant_id'] },
            { fields: ['status'] },
            {
                unique: true,
                fields: ['contract_id'],
                name: 'unique_contract_id',
            },
        ],
    }
);

export default Contract;
