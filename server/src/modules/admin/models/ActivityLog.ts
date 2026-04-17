import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
} from 'sequelize';
import sequelize from '../../../config/database.js';

export class ActivityLog extends Model<
    InferAttributes<ActivityLog>,
    InferCreationAttributes<ActivityLog>
> {
    declare id: CreationOptional<string>;
    declare actor_user_id: string | null;
    declare actor_role: string | null;
    declare actor_email: string | null;
    declare action: string;
    declare entity_type: string;
    declare entity_id: string | null;
    declare description: string;
    declare metadata: Record<string, any> | null;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

ActivityLog.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        actor_user_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        actor_role: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        actor_email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        action: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        entity_type: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        entity_id: {
            type: DataTypes.STRING(120),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
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
        tableName: 'activity_logs',
        modelName: 'ActivityLog',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['created_at'] },
            { fields: ['action'] },
            { fields: ['entity_type'] },
            { fields: ['actor_user_id'] },
        ],
    }
);

export default ActivityLog;
