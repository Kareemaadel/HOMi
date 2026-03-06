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

export class HouseRule extends Model<
    InferAttributes<HouseRule>,
    InferCreationAttributes<HouseRule>
> {
    // Primary key
    declare id: CreationOptional<string>;

    // House rule details
    declare name: string;

    // Timestamps
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    // Associations
    declare properties?: NonAttribute<Property[]>;
    declare static associations: {
        properties: Association<HouseRule, Property>;
    };
}

HouseRule.init(
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
        tableName: 'house_rules',
        modelName: 'HouseRule',
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

export default HouseRule;
