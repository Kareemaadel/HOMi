import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type NonAttribute,
    type Association,
} from 'sequelize';
import sequelize from '../../../config/database.js';

// Forward declaration for Property import
import type { Property } from './Property.js';

export class Amenity extends Model<
    InferAttributes<Amenity>,
    InferCreationAttributes<Amenity>
> {
    // Primary key
    declare id: CreationOptional<string>;

    // Amenity details
    declare name: string;

    // Timestamps
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    // Associations
    declare properties?: NonAttribute<Property[]>;
    declare static associations: {
        properties: Association<Amenity, Property>;
    };
}

Amenity.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
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
        tableName: 'amenities',
        modelName: 'Amenity',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['name'],
            },
        ],
    }
);

export default Amenity;
