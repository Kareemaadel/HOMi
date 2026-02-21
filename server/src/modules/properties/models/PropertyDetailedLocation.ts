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

export class PropertyDetailedLocation extends Model<
    InferAttributes<PropertyDetailedLocation>,
    InferCreationAttributes<PropertyDetailedLocation>
> {
    // Primary key
    declare id: CreationOptional<string>;

    // Foreign key
    declare property_id: ForeignKey<string>;

    // Location fields
    declare floor: number;
    declare city: string;
    declare area: string;
    declare street_name: string;
    declare building_number: string;
    declare unit_apt: string;

    // GPS coordinates 
    declare location_lat: number;
    declare location_long: number;

    // Timestamps
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    // Associations
    declare property?: NonAttribute<Property>;
    declare static associations: {
        property: Association<PropertyDetailedLocation, Property>;
    };
}

PropertyDetailedLocation.init(
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
        floor: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        area: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        street_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        building_number: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        unit_apt: {
            type: DataTypes.STRING(50),
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
        tableName: 'property_detailed_location',
        modelName: 'PropertyDetailedLocation',
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

export default PropertyDetailedLocation;
