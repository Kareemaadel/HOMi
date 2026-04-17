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

export class PropertyOwnershipDoc extends Model<
    InferAttributes<PropertyOwnershipDoc>,
    InferCreationAttributes<PropertyOwnershipDoc>
> {
    // Primary key
    declare id: CreationOptional<string>;

    // Foreign keys
    declare property_id: ForeignKey<string>;

    // Document details
    declare document_url: string;

    // Timestamps
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    // Associations
    declare property?: NonAttribute<Property>;
    declare static associations: {
        property: Association<PropertyOwnershipDoc, Property>;
    };
}

PropertyOwnershipDoc.init(
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
            onDelete: 'CASCADE',
        },
        document_url: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
            validate: {
                isValidDocumentInput(value: string) {
                    const isHttpUrl = /^https?:\/\/.+/i.test(value);
                    const isDataImage = /^data:(image|application\/pdf)\/[a-zA-Z0-9.+-]+;base64,/.test(value);
                    if (!isHttpUrl && !isDataImage) {
                        throw new Error('Document must be a valid URL or a base64 encoded document');
                    }
                },
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
        tableName: 'property_ownership_docs',
        modelName: 'PropertyOwnershipDoc',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['property_id'],
            },
        ],
    }
);

export default PropertyOwnershipDoc;
