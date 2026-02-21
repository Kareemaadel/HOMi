import sequelize from '../../../config/database.js';
import { User } from '../../auth/models/User.js';
import {
    Property,
    PropertyStatus,
    FurnishingStatus,
    PropertyType,
    TargetTenant,
    type PropertyStatusType,
    type FurnishingStatusType,
    type PropertyTypeType,
    type TargetTenantType,
} from './Property.js';
import { PropertyImage } from './PropertyImage.js';
import { Amenity } from './Amenity.js';
import { PropertyAmenity } from './PropertyAmenity.js';
import { PropertySpecifications } from './PropertySpecifications.js';
import { PropertyDetailedLocation } from './PropertyDetailedLocation.js';
import { HouseRule } from './HouseRule.js';
import { PropertyHouseRule } from './PropertyHouseRule.js';

// ─── Associations ─────────────────────────────────────────────────────────────

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

// Property has one PropertySpecifications (one-to-one)
Property.hasOne(PropertySpecifications, {
    foreignKey: 'property_id',
    as: 'specifications',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// PropertySpecifications belongs to Property
PropertySpecifications.belongsTo(Property, {
    foreignKey: 'property_id',
    as: 'property',
});

// Property has one PropertyDetailedLocation (one-to-one)
Property.hasOne(PropertyDetailedLocation, {
    foreignKey: 'property_id',
    as: 'detailedLocation',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// PropertyDetailedLocation belongs to Property
PropertyDetailedLocation.belongsTo(Property, {
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

// Property <-> HouseRule many-to-many through PropertyHouseRule
Property.belongsToMany(HouseRule, {
    through: PropertyHouseRule,
    foreignKey: 'property_id',
    otherKey: 'house_rule_id',
    as: 'houseRules',
});

HouseRule.belongsToMany(Property, {
    through: PropertyHouseRule,
    foreignKey: 'house_rule_id',
    otherKey: 'property_id',
    as: 'properties',
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
    sequelize,
    Property,
    PropertyStatus,
    FurnishingStatus,
    PropertyType,
    TargetTenant,
    PropertyImage,
    Amenity,
    PropertyAmenity,
    PropertySpecifications,
    PropertyDetailedLocation,
    HouseRule,
    PropertyHouseRule,
};

export type { PropertyStatusType, FurnishingStatusType, PropertyTypeType, TargetTenantType };

export default {
    sequelize,
    Property,
    PropertyImage,
    Amenity,
    PropertyAmenity,
    PropertySpecifications,
    PropertyDetailedLocation,
    HouseRule,
    PropertyHouseRule,
};
