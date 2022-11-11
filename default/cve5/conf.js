var conf = require('../../config/conf');
var express = require('express')
var router = express.Router();
const csurf = require('csurf');
var csrfProtection = csurf();
var package = require('../../package.json');
var cve5 = require('./cve5.schema.json');
module.exports = {
    conf: {
        title: 'CVE: Common Vulnerabilities and Exposures',
        name: 'CVE 5.0',
        uri: '/cve5/',
        class: 'vgi-alert',
        order: 0.12, //Where to place the section on heading?
        shortcuts: [
            {
                label: 'My CVEs',
                href: function (g) {
                    return ('/cve/?state=RESERVED,DRAFT,REVIEW,READY&owner=' + g.user.username);
                },
                class: 'vgi-folder'
            },
           /* {
                label: 'Preview',
                href: '/review/drafts',
                class: 'vgi-eye',
                target: '_blank'
            },
            {
                label: 'Slides',
                href: '/review/slides',
                class: 'vgi-show',
                target: '_blank'
            }*/
        ]
    },
    icons: {
        'Platforms': 'stack',
        'References': 'ext',
        'Versions': 'versions',
        'Timeline': 'time',
        'Solution': 'safe',
        'ID': 'tag',
        'Tags': 'tag',
        'Advisory-ID':'tag',
        'ASSIGNER':'user',
        'ASSIGNER_SHORT_NAME':'user',
        'DATE_PUBLIC':'cal',
        'TITLE':'title',
        //'Assigner': 'user',
        'Published':'cal',
        'product_name':'package',
        'Found during': 'info',
        'CNA_private': 'lock',
        'TYPE': 'bucket',
        'unsure':'what',
        'no-vuln':'safe',
        'advisory':'alert',
        'no-advisory':'no',
        'doc':'text',
        'misc':'misc',
        'duplicate':'ext',
        'CVE_data_meta': 'info',
        'STATE': 'knob',
        'new': 'inbox',
        'closed': 'closed',
        'open': 'inbox1',
        'draft': 'text',
        'review': 'eye',
        'waiting': 'wait',
        'pending':'cal',
        'vectorString': 'title',
        'baseScore':'dial',
        'baseSeverity':'knob',
        'scenario':'text',
        'source': 'info',
        'descriptions': 'text',
        'affected':'impact',
        'Vendors':'factory',
        'references':'ext',
        'impacts': 'impact',
        'metrics':'dial',
        'Configuration':'cog',
        'Defect': 'bug',
        'INTERNAL':'hardhat',
        'EXTERNAL': 'hat',
        'USER':'cap',
        'UNKNOWN':'what'

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
            path: 'body.cveMetadata.cveId',
            regex: 'CVE-[a-zA-Z0-9\._-]+',
            showDistinct: true
        },
        title: {
            path: 'body.containers.cna.title',
            href: '/cve5/',
            xref: {
                href: 'ID'
            }
        },        
        state: {
            path: 'body.CNA_private.state',
            //chart: true,
            tabs: true,
            bulk: true,
            enum: cve5.definitions.CNA_private.properties.state.enum,
            class: 'nobr ',
            icons: {
                new: 'inbox',
                open: 'inbox1',
                draft: 'edit',
                review: 'eye',
                waiting: 'wait',
                pending: 'cal',
                closed: 'closed'
            }
        },
        type: {
            path: 'body.CNA_private.type',
            //chart: true,
            tabs: true,
            bulk: true,
            enum: cve5.definitions.CNA_private.properties.type.enum,
            class: 'nobr ',
            icons: {
                unsure: 'what',
                'no-vuln': 'safe',
                advisory: 'alert',
                'no-advisory': 'no',
                doc: 'text',
                misc: 'misc',
                duplicate: 'ext'
            }
        },
        cveState: {
            path: 'body.cveMetadata.state',
            //chart: true,
            tabs: true,
            enum: ["RESERVED", "PUBLISHED", "REJECTED"],
            class: 'nobr ',
            icons: {
                RESERVED: 'edit',
                PUBLISHED: 'globe',
                REJECTED: 'no'
            }
        },
        cvss: {
            path: 'body.containers.cna.metrics.cvssV3_1.baseScore',
        },
        severity: {
            path: 'body.containers.cna.metrics.cvssV3_1.baseSeverity',
            chart: true,
            hideColumn: true
        },
        discovery: {
            path: 'body.containers.cna.source.discovery',
            chart: true,
            bulk: true,
            enum: ['INTERNAL', 'EXTERNAL', 'USER', 'UNKNOWN'],
            icons: {
                INTERNAL: 'hardhat',
                EXTERNAL: 'hat',
                USER: 'cap',
                UNKNOWN: 'what'
            },
            class: 'nobr '
        },
        defect: {
            path: 'body.containers.cna.source.defect',
            href: conf.defectURL,
            showDistinct: true
        },
        /*        Advisory: {
                    path: 'body.containers.cna.source.advisory'
                },*/
        date: {
            path: 'body.containers.cna.datePublic',
            bulk: true
        },
        updated: {
            path: 'updatedAt'
        },
        product: {
            path: 'body.containers.cna.affected.product',
            chart: true,
            pipeline: [
                {
                    $unwind: "$body.containers.cna.affected"
                },
                {
                    $sortByCount: "$body.containers.cna.affected.product"
                }
            ]
        },
        ym: {
            path: 'body.CNA_private.publish.ym',
            chart: true,
            hideColumn: true,
            sort: -1
        },
        owner: {
            path: 'body.CNA_private.owner',
            chart: true,
            bulk: true,
            enum: ['example', 'team', 'memebers', 'change', 'in', 'conf.js'],
            class: 'nobr '
        },
        /*  'state!': {
              path: 'body.CVE_data_meta.STATE',
              chart: false,
              bulk: false,
              queryOperator: '$ne'
          }*/
    },
    schema: cve5,
    validators: [
        function (schema, value, path) {
            var errors = [];
            if (schema.id == "desc" && value.value == "") {
                value = {}
            }
            if(schema.id == "pE") {
                if((value.vendor != undefined && value.product != undefined) || (value.collectionURL != undefined && value.packageName != undefined)) {
                    // it is valid 
                } else {
                    if (value.vendor == undefined && value.product != undefined) {
                        errors.push({
                            path: path+'.vendor',
                            property: 'format',
                            message: 'Enter vendor name'
                        });
                    } else if (value.product == undefined && value.vendor != undefined) {
                        errors.push({
                            path: path+'.product',
                            property: 'format',
                            message: 'Enter product name'
                        });
                    } else if (value.collectionURL == undefined && value.packageName != undefined) {
                        errors.push({
                            path: path+'.collectionURL',
                            property: 'format',
                            message: 'Enter a URL for the package collection'
                        });
                    } else if (value.packageName == undefined && value.collectionURL != undefined) {
                        errors.push({
                            path: path+'.packageName',
                            property: 'format',
                            message: 'Enter package name'
                        });
                    } else {
                        errors.push({
                            path: path,
                            property: 'format',
                            message: 'Enter a vendor and product OR a package and a collection'
                        });
                    }
                }
                /* 
                p v c pkg
                0 0 0 0 = vendor or pkg needed
                0 0 0 1 = c needed
                0 0 1 0 = pkg needed
                0 0 1 1 = ok
                0 1 0 0 = prod needed
                0 1 0 1 = p or c needed
                0 1 1 0 = product or pkg needed
                0 1 1 1 = ok
                1 0 0 0 = vendor needed
                1 0 0 1 = vendor or collection url needed
                1 0 1 0 = v or pkg needed
                1 0 1 1 = ok
                1 1 0 0 = ok
                1 1 0 1 = ok
                1 1 1 0 = ok
                1 1 1 1 = ok
                */
            }
            if(schema.id == "vE") {
                if(value.lessThan != undefined && value.lessThanOrEqual != undefined) {
                    /*errors.push({
                        path: path+'.lessThan',
                        property: 'format',
                        message: 'Enter either lessThan or lessThanOrEqual, but not both'
                    });*/
                    errors.push({
                        path: path+'.lessThanOrEqual',
                        property: 'format',
                        message: 'Enter either < v or <= v, but not both'
                    });
                }
                if(value.version != undefined && (value.version == value.lessThan)) {
                    errors.push({
                        path: path+'.lessThan',
                        property: 'format',
                        message: 'End is same as the start'
                    });
                }
                if(value.version != undefined && (value.version == value.lessThanOrEqual)) {
                    errors.push({
                        path: path+'.lessThanOrEqual',
                        property: 'format',
                        message: 'End is same as the start'
                    });
                }
                if((value.lessThan != undefined || value.lessThanOrEqual != undefined) && value.versionType == undefined) {
                    errors.push({
                        path: path+'.versionType',
                        property: 'format',
                        message: 'Version type is required for ranges'
                    });
                }
                if(value.lessThan == undefined && value.lessThanOrEqual == undefined && value.version != undefined && value.versionType != undefined) {
                    errors.push({
                        path: path+'.versionType',
                        property: 'format',
                        message: 'Version type is used only for ranges. Clear this or define a range'
                    });
                }
                if(value.lessThan == undefined && value.lessThanOrEqual == undefined && value.version != undefined && value.changes != undefined) {
                    errors.push({
                        path: path+'.changes',
                        property: 'format',
                        message: 'Changes are used only for ranges. Clear this or define a range'
                    });
                }
            }
            if(schema.id == "xtag") {
                if(value && schema.items && schema.items.examples) {
                    for(i = 0; i < value.length; i++) {
                        if(value[i] && !schema.items.examples.includes(value[i]) && !value[i].match("^x_.*$")) {
                            errors.push({
                                path: path,
                                property: 'format',
                                message: 'Select from the suggested tags or enter custom tags starting with x_'
                            });
                            break;
                        }
                    }
                }
            }
            return errors;
        }
    ],
    /*errorFilter: function(errors) {
        if(errors && errors.length > 0) {
            var out = [];
            var oneIndex = {
                'PUBLISHED': 0,
                'RESERVED':1,
                'REJECTED':2
            }
            var state = oneIndex[docEditor.getValue().cveMetadata.state];
            for(i=0; i< errors.length; i++) {
                if(errors[i].path.indexOf("root.oneOf["+state+"]") == 0) {
                    errors[i].path = errors[i].path.substr(14);
                }
                out.push(errors[i]);
            }
            errors = out;
        }
        return errors;
    },*/
    router: router
}