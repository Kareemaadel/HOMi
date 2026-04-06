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
import type { Property } from '../../properties/models/Property.js';

export class SavedProperty extends Model<
    InferAttributes<SavedProperty>,
    InferCreationAttributes<SavedProperty>
> {
    declare id: CreationOptional<string>;
    declare user_id: ForeignKey<string>;
    declare property_id: ForeignKey<string>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare user?: NonAttribute<User>;
    declare property?: NonAttribute<Property>;
    declare static associations: {
        user: Association<SavedProperty, User>;
        property: Association<SavedProperty, Property>;
    };
}

SavedProperty.init(
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
        property_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'properties',
                key: 'id',
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
        tableName: 'saved_properties',
        modelName: 'SavedProperty',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['property_id'] },
            { unique: true, fields: ['user_id', 'property_id'] },
        ],
    }
);

export default SavedProperty;
