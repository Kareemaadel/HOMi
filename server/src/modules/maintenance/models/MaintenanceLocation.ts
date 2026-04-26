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
 * Most recent live location of the provider for a particular maintenance job.
 * One row per (request_id, provider_id) — overwritten on every update.
 */
export class MaintenanceLocation extends Model<
    InferAttributes<MaintenanceLocation>,
    InferCreationAttributes<MaintenanceLocation>
> {
    declare id: CreationOptional<string>;
    declare request_id: ForeignKey<string>;
    declare provider_id: ForeignKey<string>;
    declare lat: number;
    declare lng: number;
    declare accuracy_m: number | null;
    declare heading: number | null;
    declare speed: number | null;
    declare reported_at: CreationOptional<Date>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

MaintenanceLocation.init(
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
        provider_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        lat: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        lng: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        accuracy_m: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        heading: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        speed: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        reported_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
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
        tableName: 'maintenance_locations',
        modelName: 'MaintenanceLocation',
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

export default MaintenanceLocation;
