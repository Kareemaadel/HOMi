import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../../../config/database.js';

export class PropertyHouseRule extends Model<
    InferAttributes<PropertyHouseRule>,
    InferCreationAttributes<PropertyHouseRule>
> {
    // Foreign keys (composite PK)
    declare property_id: ForeignKey<string>;
    declare house_rule_id: ForeignKey<string>;
}

PropertyHouseRule.init(
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
        house_rule_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'house_rules',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        tableName: 'property_house_rules',
        modelName: 'PropertyHouseRule',
        timestamps: false,
        underscored: true,
        indexes: [
            { fields: ['property_id'] },
            { fields: ['house_rule_id'] },
        ],
    }
);

export default PropertyHouseRule;
