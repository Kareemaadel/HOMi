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
import type { Conversation } from './Conversation.js';

export class Message extends Model<
    InferAttributes<Message>,
    InferCreationAttributes<Message>
> {
    declare id: CreationOptional<string>;

    declare conversation_id: ForeignKey<string>;
    declare sender_id: ForeignKey<string>;

    declare body: string;
    declare read_at: CreationOptional<Date | null>;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare sender?: NonAttribute<User>;
    declare conversation?: NonAttribute<Conversation>;

    declare static readonly associations: {
        sender: Association<Message, User>;
        conversation: Association<Message, Conversation>;
    };
}

Message.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        conversation_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'conversations',
                key: 'id',
            },
        },
        sender_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        read_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
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
        tableName: 'messages',
        modelName: 'Message',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['conversation_id', 'created_at'],
            },
            {
                fields: ['sender_id'],
            },
            {
                fields: ['conversation_id', 'read_at'],
            },
        ],
    }
);

export default Message;
