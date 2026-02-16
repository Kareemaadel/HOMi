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

// Enums
export const PropertyStatus = {
    AVAILABLE: 'AVAILABLE',
    RENTED: 'RENTED',
    UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type PropertyStatusType = (typeof PropertyStatus)[keyof typeof PropertyStatus];

// Forward declaration for imports
import type { User } from '../../auth/models/User.js';
import type { PropertyImage } from './PropertyImage.js';

export class Property extends Model<
    InferAttributes<Property>,
    InferCreationAttributes<Property>
> {
    // Primary key
    declare id: CreationOptional<string>;

    // Foreign keys
    declare landlord_id: ForeignKey<string>;

    // Property details
    declare title: string;
    declare description: string;
    declare price: number;
    declare address: string;
    declare location_lat: number;
    declare location_long: number;
    declare status: PropertyStatusType;

    // Timestamps
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
    declare deleted_at: CreationOptional<Date | null>;

    // Associations
    declare landlord?: NonAttribute<User>;
    declare images?: NonAttribute<PropertyImage[]>;
    declare static associations: {
        landlord: Association<Property, User>;
        images: Association<Property, PropertyImage>;
    };
}

Property.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        landlord_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        location_lat: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: -90,
                max: 90,
            },
        },
        location_long: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: -180,
                max: 180,
            },
        },
        status: {
            type: DataTypes.ENUM(...Object.values(PropertyStatus)),
            allowNull: false,
            defaultValue: PropertyStatus.AVAILABLE,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'properties',
        modelName: 'Property',
        timestamps: true,
        paranoid: true, // Enables soft deletes
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
            {
                fields: ['landlord_id'],
            },
            {
                fields: ['status'],
            },
            {
                fields: ['price'],
            },
        ],
    }
);

export default Property;
