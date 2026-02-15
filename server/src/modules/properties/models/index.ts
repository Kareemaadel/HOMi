import sequelize from '../../../config/database.js';
import { User } from '../../auth/models/User.js';
import { Property, PropertyStatus, type PropertyStatusType } from './Property.js';
import { PropertyImage } from './PropertyImage.js';

// Define associations

// Property belongs to User (landlord)
Property.belongsTo(User, {
    foreignKey: 'landlord_id',
    as: 'landlord',
});

// User has many Properties
User.hasMany(Property, {
    foreignKey: 'landlord_id',
    as: 'properties',
});

// Property has many PropertyImages
Property.hasMany(PropertyImage, {
    foreignKey: 'property_id',
    as: 'images',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// PropertyImage belongs to Property
PropertyImage.belongsTo(Property, {
    foreignKey: 'property_id',
    as: 'property',
});

// Export all models and types
export {
    sequelize,
    Property,
    PropertyStatus,
    PropertyImage,
};

export type { PropertyStatusType };

// Export default as object with all models for convenience
export default {
    sequelize,
    Property,
    PropertyImage,
};
