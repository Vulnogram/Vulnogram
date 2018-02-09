/* Copyright (c) 2017 Chandan B N. All rights reserved.

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

module.exports = {
    ID: {
        path: 'body.ID',
        regex: '[A-Z]*[0-9-]+'
    },
    CVE: {
        path: 'body.CVE_list.CVE'
    },
    date: {
        path: 'body.DATE_PUBLIC'
    },
    Title: {
        path: 'body.TITLE'
    },
    state: {
        path: 'body.STATE'
    },
    phase: {
        path: 'body.CNA_private.phase',
        tabs: true,
        hideColumn: true
    },
    ToDo: {
        path: 'body.CNA_private.todo'
    },
    ym: {
        path: 'body.CNA_private.publish.ym',
        chart: true,
        hideColumn: true,
        sort: -1
    },
    owner: {
        path: 'body.CNA_private.owner',
        chart: true
    }
}