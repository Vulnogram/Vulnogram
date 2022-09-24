// Copyright (c) 2017 Chandan B N. All rights reserved.

const mongoose = require('mongoose');

module.exports = function (name) {
    const docSchema = mongoose.Schema({
        author: String,
        body: Object,
        doc_id: String,
        parent_id: Object,
        slug: String,
        full_slug: String,
        comments: Array,
        files: Array
    }, {
        timestamps: true,
        strict: false
    });
    //ensure text search
    //TODO: index all facet fields.
    docSchema.index({
        '$**': 'text'
    });
    

    return mongoose.model(name, docSchema);
}