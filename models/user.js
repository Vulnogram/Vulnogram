// Copyright (c) 2017 Chandan B N. All rights reserved.

const {
    ObjectId
} = require('mongodb');
const mongo = require('../lib/mongo');

const USERNAME_REGEX = /^[a-zA-Z0-9]{3,64}$/;
const NAME_REGEX = /[a-zA-Z0-9]{3,64}/;
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function collection() {
    return mongo.getCollection('users');
}

function toProjection(projection) {
    if (Array.isArray(projection)) {
        var out = {};
        for (var x of projection) {
            out[x] = 1;
        }
        return out;
    }
    return projection;
}

function normalizeUpdates(update) {
    var hasOperator = false;
    for (var k in update) {
        if (k[0] === '$') {
            hasOperator = true;
            break;
        }
    }
    if (hasOperator) {
        return update;
    }
    return {
        $set: update
    };
}

function normalizeUsernameForUpdate(update) {
    if (update.$set && typeof update.$set.username === 'string') {
        update.$set.username = update.$set.username.toLowerCase();
    }
    if (update.$setOnInsert && typeof update.$setOnInsert.username === 'string') {
        update.$setOnInsert.username = update.$setOnInsert.username.toLowerCase();
    }
    return update;
}

function validateUserDocument(user) {
    var issues = [];
    if (!user || typeof user !== 'object') {
        return new Error('User data is missing');
    }
    if (!user.name || !NAME_REGEX.test(user.name)) {
        issues.push('Need atleast three letters in a name');
    }
    if (!user.username || !USERNAME_REGEX.test(user.username)) {
        issues.push('Usernames should have atleast three alphanumeric characters');
    }
    if (!user.email || !EMAIL_REGEX.test(user.email)) {
        issues.push('Invalid email address');
    }
    if (!user.password || typeof user.password !== 'string') {
        issues.push('Password is required');
    }
    if (user.priv === undefined || user.priv === null || isNaN(Number(user.priv))) {
        issues.push('Privilege provided is invalid');
    }
    if (issues.length) {
        return new Error(issues.join('; '));
    }
    return null;
}

function findOne(query, cb) {
    var p = collection().findOne(query);
    if (typeof cb === 'function') {
        p.then(function (doc) {
            cb(null, doc);
        }).catch(function (err) {
            cb(err);
        });
        return;
    }
    return p;
}

function findById(id, cb) {
    var qid = null;
    try {
        qid = new ObjectId(id);
    } catch (e) {
        qid = null;
    }
    if (!qid) {
        if (typeof cb === 'function') {
            cb(null, null);
            return;
        }
        return Promise.resolve(null);
    }
    var p = collection().findOne({
        _id: qid
    });
    if (typeof cb === 'function') {
        p.then(function (doc) {
            cb(null, doc);
        }).catch(function (err) {
            cb(err);
        });
        return;
    }
    return p;
}

function find(query, projection, options, cb) {
    if (typeof projection === 'function') {
        cb = projection;
        projection = undefined;
        options = undefined;
    } else if (typeof options === 'function') {
        cb = options;
        options = undefined;
    }
    var findOptions = Object.assign({}, options || {});
    if (projection !== undefined) {
        findOptions.projection = toProjection(projection);
    }
    var p = collection().find(query || {}, findOptions).toArray();
    if (typeof cb === 'function') {
        p.then(function (docs) {
            cb(null, docs);
        }).catch(function (err) {
            cb(err);
        });
        return;
    }
    return p;
}

function findOneAndUpdate(query, updates, options, cb) {
    if (typeof options === 'function') {
        cb = options;
        options = undefined;
    }
    var update = normalizeUpdates(Object.assign({}, updates));
    update = normalizeUsernameForUpdate(update);
    var nativeOptions = {
        upsert: options && options.upsert ? true : false,
        returnDocument: options && options.new ? 'after' : 'before'
    };
    if (nativeOptions.upsert && options && options.setDefaultsOnInsert) {
        var hasPrivInSet = !!(update.$set && Object.prototype.hasOwnProperty.call(update.$set, 'priv'));
        update.$setOnInsert = Object.assign({}, update.$setOnInsert || {});
        if (hasPrivInSet) {
            delete update.$setOnInsert.priv;
        } else if (update.$setOnInsert.priv === undefined) {
            update.$setOnInsert.priv = 1;
        }
    }
    var p = collection().findOneAndUpdate(query, update, nativeOptions);
    if (typeof cb === 'function') {
        p.then(function (doc) {
            cb(null, doc);
        }).catch(function (err) {
            cb(err);
        });
        return;
    }
    return p;
}

module.exports = {
    find: find,
    findById: findById,
    findOne: findOne,
    findOneAndUpdate: findOneAndUpdate,
    validateUserDocument: validateUserDocument
};
