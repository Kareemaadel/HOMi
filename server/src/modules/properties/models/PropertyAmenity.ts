import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../../../config/database.js';

export class PropertyAmenity extends Model<
    InferAttributes<PropertyAmenity>,
    InferCreationAttributes<PropertyAmenity>
> {
    // Foreign keys (composite PK)
    declare property_id: ForeignKey<string>;
    declare amenity_id: ForeignKey<string>;
}

PropertyAmenity.init(
    {
        property_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'properties',
                key: 'id',
            },
        },
        amenity_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'amenities',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        tableName: 'property_amenities',
        modelName: 'PropertyAmenity',
        timestamps: false,
        underscored: true,
        indexes: [
            { fields: ['property_id'] },
            { fields: ['amenity_id'] },
        ],
    }
);

export default PropertyAmenity;
