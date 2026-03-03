// Copyright (c) 2017 Chandan B N. All rights reserved.

const mongo = require('../lib/mongo');

module.exports = function (name) {
    return mongo.getCollection(name);
}
