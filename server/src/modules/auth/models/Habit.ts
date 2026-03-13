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

// Forward declaration for User import
import type { User } from './User.js';

export class Habit extends Model<
    InferAttributes<Habit>,
    InferCreationAttributes<Habit>
> {
    // Primary key
    declare id: CreationOptional<string>;

    // Habit details
    declare name: string;

    // Timestamps
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    // Associations
    declare users?: NonAttribute<User[]>;
    declare static associations: {
        users: Association<Habit, User>;
    };
}

Habit.init(
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
        tableName: 'habits',
        modelName: 'Habit',
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

export default Habit;
