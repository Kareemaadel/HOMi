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

// Forward declaration for Property import
import type { Property } from './Property.js';

export class PropertyImage extends Model<
    InferAttributes<PropertyImage>,
    InferCreationAttributes<PropertyImage>
> {
    // Primary key
    declare id: CreationOptional<string>;

    // Foreign keys
    declare property_id: ForeignKey<string>;

    // Image details
    declare image_url: string;
    declare is_main: CreationOptional<boolean>;

    // Timestamps
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    // Associations
    declare property?: NonAttribute<Property>;
    declare static associations: {
        property: Association<PropertyImage, Property>;
    };
}

PropertyImage.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        property_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'properties',
                key: 'id',
            },
        },
        image_url: {
            type: DataTypes.STRING(500),
            allowNull: false,
            validate: {
                isUrl: true,
            },
        },
        is_main: {
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
        tableName: 'property_images',
        modelName: 'PropertyImage',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['property_id'],
            },
            {
                fields: ['is_main'],
            },
        ],
    }
);

export default PropertyImage;
