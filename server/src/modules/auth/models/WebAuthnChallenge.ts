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

export type WebAuthnChallengeKind = 'registration' | 'authentication';

export class WebAuthnChallenge extends Model<
    InferAttributes<WebAuthnChallenge>,
    InferCreationAttributes<WebAuthnChallenge>
> {
    declare id: CreationOptional<string>;
    declare user_id: ForeignKey<User['id']>;
    declare challenge: string;
    declare kind: WebAuthnChallengeKind;
    declare expires_at: Date;
    declare created_at: CreationOptional<Date>;
}

WebAuthnChallenge.init(
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
        challenge: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        kind: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'webauthn_challenges',
        modelName: 'WebAuthnChallenge',
        timestamps: false,
        underscored: true,
        indexes: [{ fields: ['user_id', 'kind'] }],
    }
);

export default WebAuthnChallenge;
