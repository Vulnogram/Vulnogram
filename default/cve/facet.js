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
        path: 'body.CVE_data_meta.ID',
        regex: 'CVE-[a-zA-Z0-9\._-]+'
    },
    Defect: {
        path: 'body.source.defect'
    },
    CVSS: {
        path: 'body.impact.cvss.baseScore'
    },
    severity: {
        path: 'body.impact.cvss.baseSeverity',
        chart: true,
        hideColumn: true
    },
    advisory: {
        path: 'body.source.advisory'
    },
    date: {
        path: 'body.CVE_data_meta.DATE_PUBLIC'
    },
    product: {
        path: 'body.affects.vendor.vendor_data.product.product_data.product_name',
        chart: true,
        pipeline: [
            {
                $unwind: "$body.affects.vendor.vendor_data"
            }, {
                $unwind: "$body.affects.vendor.vendor_data.product.product_data"
            }, {
                 $sortByCount: "$body.affects.vendor.vendor_data.product.product_data.product_name"
            }
        ]
    },
    Title: {
        path: 'body.CVE_data_meta.TITLE'
    },
    state: {
        path: 'body.CVE_data_meta.STATE',
        chart: true    
    },
    phase: {
        path: 'body.CNA_private.phase',
        tabs: true,
        hideColumn: true,
        sort: 1
    },
    ToDo:{
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