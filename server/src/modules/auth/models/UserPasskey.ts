import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../../../config/database.js';
import type { User } from './User.js';

export class UserPasskey extends Model<
    InferAttributes<UserPasskey>,
    InferCreationAttributes<UserPasskey>
> {
    declare id: CreationOptional<string>;
    declare user_id: ForeignKey<User['id']>;
    /** Base64URL credential id from WebAuthn */
    declare credential_id: string;
    /** COSE public key bytes stored as base64 */
    declare public_key: string;
    declare counter: CreationOptional<number>;
    declare transports: CreationOptional<string[] | null>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

UserPasskey.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE',
        },
        credential_id: {
            type: DataTypes.STRING(512),
            allowNull: false,
            unique: true,
        },
        public_key: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        counter: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        transports: {
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
        tableName: 'user_passkeys',
        modelName: 'UserPasskey',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [{ fields: ['user_id'] }],
    }
);

export default UserPasskey;
