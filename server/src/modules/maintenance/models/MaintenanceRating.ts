import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../../../config/database.js';

/**
 * Tenant's review of a maintainer after a completed job.
 * One row per request — set when tenant confirms the job is solved.
 */
export class MaintenanceRating extends Model<
    InferAttributes<MaintenanceRating>,
    InferCreationAttributes<MaintenanceRating>
> {
    declare id: CreationOptional<string>;
    declare request_id: ForeignKey<string>;
    declare tenant_id: ForeignKey<string>;
    declare provider_id: ForeignKey<string>;
    declare rating: number; // 1..5
    declare comment: string | null;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

MaintenanceRating.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        request_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'maintenance_requests', key: 'id' },
            onDelete: 'CASCADE',
        },
        tenant_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        provider_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        comment: {
            type: DataTypes.TEXT,
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
        tableName: 'maintenance_ratings',
        modelName: 'MaintenanceRating',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { unique: true, fields: ['request_id'] },
            { fields: ['provider_id'] },
        ],
    }
);

export default MaintenanceRating;
