// Copyright (c) 2017 Chandan B N. All rights reserved.

const mongoose = require('mongoose');

const cveSchema = mongoose.Schema({
  cve: {
    type: Object,
  },
  author: String
},
{
  timestamps: true
});

//ensure that CVE entries are searchable.
cveSchema.index({'$**': 'text'});

const CVE = module.exports = mongoose.model('CVE', cveSchema);