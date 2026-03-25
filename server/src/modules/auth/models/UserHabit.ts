import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../../../config/database.js';

export class UserHabit extends Model<
    InferAttributes<UserHabit>,
    InferCreationAttributes<UserHabit>
> {
    // Foreign keys (composite PK)
    declare user_id: ForeignKey<string>;
    declare habit_id: ForeignKey<string>;
}

UserHabit.init(
    {
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        habit_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'habits',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        tableName: 'user_habits',
        modelName: 'UserHabit',
        timestamps: false,
        underscored: true,
        indexes: [
            { fields: ['user_id'] },
            { fields: ['habit_id'] },
        ],
    }
);

export default UserHabit;
