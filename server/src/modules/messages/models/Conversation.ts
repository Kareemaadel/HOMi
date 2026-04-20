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
import type { Message } from './Message.js';

export class Conversation extends Model<
    InferAttributes<Conversation>,
    InferCreationAttributes<Conversation>
> {
    declare id: CreationOptional<string>;

    declare participant_one_id: ForeignKey<string>;
    declare participant_two_id: ForeignKey<string>;
    declare property_id: ForeignKey<string | null>;

    declare last_message_at: CreationOptional<Date | null>;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
    declare deleted_at: CreationOptional<Date | null>;

    declare participantOne?: NonAttribute<User>;
    declare participantTwo?: NonAttribute<User>;
    declare property?: NonAttribute<Property>;
    declare messages?: NonAttribute<Message[]>;

    declare static readonly associations: {
        participantOne: Association<Conversation, User>;
        participantTwo: Association<Conversation, User>;
        property: Association<Conversation, Property>;
        messages: Association<Conversation, Message>;
    };
}

Conversation.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        participant_one_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        participant_two_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        property_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'properties',
                key: 'id',
            },
        },
        last_message_at: {
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
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'conversations',
        modelName: 'Conversation',
        timestamps: true,
        paranoid: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
            {
                fields: ['participant_one_id'],
            },
            {
                fields: ['participant_two_id'],
            },
            {
                fields: ['last_message_at'],
            },
        ],
    }
);

export default Conversation;
