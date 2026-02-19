import sequelize from '../../../config/database.js';
import { User } from '../../auth/models/User.js';
import { Property, PropertyStatus, type PropertyStatusType } from './Property.js';
import { PropertyImage } from './PropertyImage.js';
import { Amenity } from './Amenity.js';
import { PropertyAmenity } from './PropertyAmenity.js';

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

// Property <-> Amenity many-to-many through PropertyAmenity
Property.belongsToMany(Amenity, {
    through: PropertyAmenity,
    foreignKey: 'property_id',
    otherKey: 'amenity_id',
    as: 'amenities',
});

Amenity.belongsToMany(Property, {
    through: PropertyAmenity,
    foreignKey: 'amenity_id',
    otherKey: 'property_id',
    as: 'properties',
});

// Export all models and types
export {
    sequelize,
    Property,
    PropertyStatus,
    PropertyImage,
    Amenity,
    PropertyAmenity,
};

export type { PropertyStatusType };

// Export default as object with all models for convenience
export default {
    sequelize,
    Property,
    PropertyImage,
    Amenity,
    PropertyAmenity,
};
