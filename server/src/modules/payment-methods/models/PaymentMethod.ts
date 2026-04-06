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

export const PaymentProvider = {
    PAYMOB: 'PAYMOB',
    STRIPE: 'STRIPE',
} as const;

export type PaymentProviderType = (typeof PaymentProvider)[keyof typeof PaymentProvider];

export class PaymentMethod extends Model<
    InferAttributes<PaymentMethod>,
    InferCreationAttributes<PaymentMethod>
> {
    declare id: CreationOptional<string>;
    declare user_id: ForeignKey<string>;
    declare provider: PaymentProviderType;
    declare provider_payment_token: string;
    declare brand: string;
    declare last4: string;
    declare exp_month: number;
    declare exp_year: number;
    declare cardholder_name: string;
    declare is_default: CreationOptional<boolean>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare user?: NonAttribute<User>;
    declare static associations: {
        user: Association<PaymentMethod, User>;
    };
}

PaymentMethod.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        provider: {
            type: DataTypes.ENUM(...Object.values(PaymentProvider)),
            allowNull: false,
            defaultValue: PaymentProvider.PAYMOB,
        },
        provider_payment_token: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        brand: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        last4: {
            type: DataTypes.STRING(4),
            allowNull: false,
        },
        exp_month: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 12,
            },
        },
        exp_year: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 2024,
                max: 2100,
            },
        },
        cardholder_name: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        is_default: {
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
        tableName: 'payment_methods',
        modelName: 'PaymentMethod',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['user_id', 'is_default'] },
        ],
    }
);

export default PaymentMethod;
