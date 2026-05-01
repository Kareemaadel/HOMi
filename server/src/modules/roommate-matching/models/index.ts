import sequelize from '../../../config/database.js';
import { User } from '../../auth/models/User.js';
import { Contract } from '../../contracts/models/Contract.js';
import { RoommateRequest } from './RoommateRequest.js';
import { RoommateMatch } from './RoommateMatch.js';

// User <-> RoommateRequest
User.hasMany(RoommateRequest, {
    foreignKey: 'user_id',
    as: 'roommateRequests',
});

RoommateRequest.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
});

// Contract <-> RoommateRequest
Contract.hasMany(RoommateRequest, {
    foreignKey: 'contract_id',
    as: 'roommateRequests',
});

RoommateRequest.belongsTo(Contract, {
    foreignKey: 'contract_id',
    as: 'contract',
});

// RoommateRequest <-> RoommateMatch
RoommateRequest.hasMany(RoommateMatch, {
    foreignKey: 'request_id',
    as: 'matches',
});

RoommateMatch.belongsTo(RoommateRequest, {
    foreignKey: 'request_id',
    as: 'request',
});

RoommateRequest.hasMany(RoommateMatch, {
    foreignKey: 'matched_request_id',
    as: 'reverseMatches',
});

RoommateMatch.belongsTo(RoommateRequest, {
    foreignKey: 'matched_request_id',
    as: 'matchedRequest',
});

// User <-> RoommateMatch
User.hasMany(RoommateMatch, {
    foreignKey: 'requester_id',
    as: 'initiatedMatches',
});

RoommateMatch.belongsTo(User, {
    foreignKey: 'requester_id',
    as: 'requester',
});

User.hasMany(RoommateMatch, {
    foreignKey: 'matched_user_id',
    as: 'receivedMatches',
});

RoommateMatch.belongsTo(User, {
    foreignKey: 'matched_user_id',
    as: 'matchedUser',
});

export {
    sequelize,
    RoommateRequest,
    RoommateMatch,
};

export default {
    sequelize,
    RoommateRequest,
    RoommateMatch,
};
