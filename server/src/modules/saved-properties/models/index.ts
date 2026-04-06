import { User } from '../../auth/models/User.js';
import { Property } from '../../properties/models/Property.js';
import { SavedProperty } from './SavedProperty.js';

User.hasMany(SavedProperty, {
    foreignKey: 'user_id',
    as: 'savedProperties',
    onDelete: 'CASCADE',
});

Property.hasMany(SavedProperty, {
    foreignKey: 'property_id',
    as: 'savedByUsers',
    onDelete: 'CASCADE',
});

SavedProperty.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
});

SavedProperty.belongsTo(Property, {
    foreignKey: 'property_id',
    as: 'property',
});

export {
    SavedProperty,
    User,
    Property,
};

export default {
    SavedProperty,
};
