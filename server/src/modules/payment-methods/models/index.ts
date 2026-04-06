import { User } from '../../auth/models/User.js';
import {
    PaymentMethod,
    PaymentProvider,
    type PaymentProviderType,
} from './PaymentMethod.js';

User.hasMany(PaymentMethod, {
    foreignKey: 'user_id',
    as: 'paymentMethods',
    onDelete: 'CASCADE',
});

PaymentMethod.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
});

export {
    PaymentMethod,
    PaymentProvider,
    User,
};

export type {
    PaymentProviderType,
};

export default {
    PaymentMethod,
};
