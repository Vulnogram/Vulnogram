var conf = require('../../config/conf');
var express = require('express')
var router = express.Router();
const csurf = require('csurf');
var csrfProtection = csurf();
var package = require('../../package.json');
var cvss = require('./cvss4.json');
module.exports = {
    conf: {
        title: 'Common Vulnerability Scoring System',
        name: 'CVSS 4.0',
        uri: '/cvss4/',
        class: 'vgi-cvss-logo',
        order: 0.12, //Where to place the section on heading?
    },
    /*
    Configure important query and aggregation parameters for index page

    This JSON is used to build querymen schema and a Mongo facet query
    used mainly for index page which also lets query/filter the list of items. 

    The key ID is important. It tells where to find the unique identifer for the document.

    path: the path of an element in JSON document body
    regex: for user input for validation
    tabs: if true, show a top level tabs with aggregated counts of documents
    chart: if true, shows a small histogram/bar chart of aggregation
    hideColumn: if true, hides the column from the listing table
    sort: defult sort order for mongo queries
    pipeline: addtional mongo pipeline operations (useful for unwinding arrays)

    */
    facet: {
        ID: {
            path: 'body.vectorString',
            regex: 'CVSS[a-zA-Z0-9\._-]+',
            showDistinct: true
        },
    },
    schema: cvss,
    validators: [
    ],
    router: router
}