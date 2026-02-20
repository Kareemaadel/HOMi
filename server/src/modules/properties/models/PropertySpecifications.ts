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

// Forward declaration
import type { Property } from './Property.js';

export class PropertySpecifications extends Model<
    InferAttributes<PropertySpecifications>,
    InferCreationAttributes<PropertySpecifications>
> {
    // Primary key
    declare id: CreationOptional<string>;

    // Foreign key
    declare property_id: ForeignKey<string>;

    // Specification fields
    declare bedrooms: number;
    declare bathrooms: number;
    declare floor: number;
    declare parking_spaces: number;
    declare area_sqft: number;
    declare detailed_location: string; // Full address / descriptive text

    // Timestamps
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    // Associations
    declare property?: NonAttribute<Property>;
    declare static associations: {
        property: Association<PropertySpecifications, Property>;
    };
}

PropertySpecifications.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        property_id: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true, // One-to-one
            references: {
                model: 'properties',
                key: 'id',
            },
        },
        bedrooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        bathrooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        floor: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        parking_spaces: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
            },
        },
        area_sqft: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        detailed_location: {
            type: DataTypes.TEXT,
            allowNull: false,
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
        tableName: 'property_specifications',
        modelName: 'PropertySpecifications',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['property_id'],
            },
        ],
    }
);

export default PropertySpecifications;
