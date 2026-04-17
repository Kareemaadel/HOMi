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
import type { Property } from './Property.js';
import type { User } from '../../auth/models/User.js';

export const PropertyReportReason = {
    SCAM_OR_FRAUD: 'SCAM_OR_FRAUD',
    MISLEADING_INFORMATION: 'MISLEADING_INFORMATION',
    FAKE_PHOTOS: 'FAKE_PHOTOS',
    DUPLICATE_LISTING: 'DUPLICATE_LISTING',
    OFFENSIVE_CONTENT: 'OFFENSIVE_CONTENT',
    UNAVAILABLE_OR_ALREADY_RENTED: 'UNAVAILABLE_OR_ALREADY_RENTED',
    OTHER: 'OTHER',
} as const;

export type PropertyReportReasonType = (typeof PropertyReportReason)[keyof typeof PropertyReportReason];

export const PropertyReportStatus = {
    OPEN: 'OPEN',
    REVIEWED: 'REVIEWED',
    ACTIONED: 'ACTIONED',
} as const;

export type PropertyReportStatusType = (typeof PropertyReportStatus)[keyof typeof PropertyReportStatus];

export class PropertyReport extends Model<
    InferAttributes<PropertyReport>,
    InferCreationAttributes<PropertyReport>
> {
    declare id: CreationOptional<string>;
    declare property_id: ForeignKey<string>;
    declare reporter_id: ForeignKey<string>;
    declare reason: PropertyReportReasonType;
    declare details: string;
    declare status: CreationOptional<PropertyReportStatusType>;
    declare snapshot_property_title: string | null;
    declare snapshot_property_address: string | null;
    declare snapshot_property_monthly_price: number | null;
    declare snapshot_property_thumbnail_url: string | null;
    declare snapshot_landlord_name: string | null;
    declare snapshot_landlord_email: string | null;
    declare reviewed_by_admin_id: ForeignKey<string> | null;
    declare reviewed_at: Date | null;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare property?: NonAttribute<Property>;
    declare reporter?: NonAttribute<User>;
    declare reviewedBy?: NonAttribute<User>;

    declare static associations: {
        property: Association<PropertyReport, Property>;
        reporter: Association<PropertyReport, User>;
        reviewedBy: Association<PropertyReport, User>;
    };
}

PropertyReport.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        property_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'properties', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        reporter_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        reason: {
            type: DataTypes.ENUM(...Object.values(PropertyReportReason)),
            allowNull: false,
        },
        details: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        snapshot_property_title: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        snapshot_property_address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        snapshot_property_monthly_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        snapshot_property_thumbnail_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        snapshot_landlord_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        snapshot_landlord_email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(PropertyReportStatus)),
            allowNull: false,
            defaultValue: PropertyReportStatus.OPEN,
        },
        reviewed_by_admin_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'users', key: 'id' },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        },
        reviewed_at: {
            type: DataTypes.DATE,
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
        tableName: 'property_reports',
        modelName: 'PropertyReport',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['property_id'] },
            { fields: ['reporter_id'] },
            { fields: ['status'] },
            { fields: ['created_at'] },
        ],
    }
);

export default PropertyReport;
