// Finding section: one security problem across the organization (type + key), with one
// Instance per repo or product where it occurs. Normalize and dedup live in finding.js;
// every change is kept in the finding_histories collection.
const finding = require('./finding.js');

const severityIcons = { Critical: 'run', High: 'walk', Medium: 'stand', Low: 'sit', Info: 'info' };
const typeIcons = { code: 'console', dependency: 'package', secret: 'key' };
const statusIcons = {
    'New': 'inbox1', 'Triaged': 'eye', 'Confirmed': 'tick', 'In remediation': 'bandage', 'Fixed': 'ok',
    'Verified': 'safe', 'Closed': 'closed', 'False positive': 'ghost', 'Not affected': 'no',
    'Accepted risk': 'avoid', 'Duplicate': 'copy'
};
// Charts of a value inside an array: count each element, not each combination.
function unwound(path) {
    return [{ $unwind: '$' + path }, { $sortByCount: '$' + path }];
}
// Charts of an Instance field: count each Finding once per value.
function byInstance(field) {
    return [
        { $unwind: '$body.instances' },
        { $group: { _id: { f: '$_id', v: '$body.instances.' + field } } },
        { $sortByCount: '$_id.v' }
    ];
}

module.exports = {
    conf: {
        title: 'Security findings',
        name: 'Findings',
        readonly: true,
        class: 'vgi-search',
        disableDrafts: true,
        uri: '/finding/?state=Open',
        collectionName: 'findings',
        order: 1.4
    },
    facet: {
        ID: {
            path: 'body.ID',
            regex: 'SEC-[0-9]{2}-[0-9]+',
            class: 'nobr'
        },
        state: {
            path: 'body.state',
            tabs: true,
            chart: true,
            icons: { Open: 'inbox1', Closed: 'closed' }
        },
        severity: {
            path: 'body.severity',
            chart: true,
            icons: severityIcons
        },
        type: {
            path: 'body.type',
            chart: true,
            tabs: true,
            icons: typeIcons
        },
        kev: {
            // yes: a CVE is in the CISA KEV catalog, or a secret is still active
            path: 'body.kev',
            chart: true,
            icons: { yes: 'bomb' }
        },
        title: {
            path: 'body.title',
            class: 'sgl'
        },
        source: {
            path: 'body.sources',
            chart: true,
            hideColumn: true,
            pipeline: unwound('body.sources')
        },
        key: {
            // Secrets (type:hmac) show the secret type and a fingerprint of the HMAC:
            // e.g. "aws access key 55..2a". Filters and sorting use the full key.
            path: 'body.key',
            class: 'sgl',
            project: {
                $cond: [{ $ne: ['$body.type', 'secret'] }, '$body.key', {
                    $let: {
                        vars: { parts: { $split: ['$body.key', ':'] } },
                        in: {
                            $let: {
                                vars: { t: { $arrayElemAt: ['$$parts', 0] }, h: { $arrayElemAt: ['$$parts', -1] } },
                                in: {
                                    $concat: [{ $replaceAll: { input: '$$t', find: '_', replacement: ' ' } }, ' ',
                                        { $substrCP: ['$$h', 0, 2] }, '..',
                                        { $substrCP: ['$$h', { $subtract: [{ $strLenCP: '$$h' }, 2] }, 2] }]
                                }
                            }
                        }
                    }
                }]
            }
        },
        where: {
            path: 'body.instances.name',
            hideColumn: true
        },
        open: {
            // open / total instances; sorts and filters by the open count
            path: 'body.openInstances',
            type: Number,
            project: { $concat: [{ $toString: '$body.openInstances' }, '/', { $toString: { $size: { $ifNull: ['$body.instances', []] } } }] }
        },
        bu: {
            path: 'body.instances.bu',
            chart: true,
            hideColumn: true,
            pipeline: byInstance('bu')
        },
        productGroup: {
            path: 'body.instances.productGroup',
            chart: true,
            hideColumn: true,
            pipeline: byInstance('productGroup')
        },
        owner: {
            path: 'body.instances.owner',
            chart: true,
            hideColumn: true,
            pipeline: byInstance('owner')
        },
        prodsecPartner: {
            path: 'body.instances.prodsecPartner',
            chart: true,
            pipeline: byInstance('prodsecPartner')
        },
        cwe: {
            path: 'body.cwe',
            hideColumn: true
        },
        cve: {
            path: 'body.cve',
            href: 'https://vulnogram.org/seaview/?',
            hideColumn: true
        },
        // Computed by finding.js refreshComputed(), outside body.
        createdQuarter: {
            path: 'computed.quarter',
            chart: true,
            sort: 1,
            icon: 'vgi-cal'
        },
        createdMonth: {
            path: 'computed.month',
            chart: true,
            sort: 1,
            hideColumn: true,
            icon: 'vgi-cal'
        },
        age: {
            path: 'computed.age',
            chart: true,
            icon: 'vgi-time'
        },
        updated: {
            path: 'updatedAt',
            isDate: true,
            sortDefault: '-updated'
        }
    },
    schema: {
        type: 'object',
        format: 'grid',
        required: ['ID', 'type', 'key', 'title'],
        properties: {
            ID: { type: 'string', pattern: '^SEC-[0-9]{2}-[0-9]+$', options: { grid_columns: 3, class: 'vgi-tag' } },
            type: { type: 'string', enum: ['code', 'dependency', 'secret'], format: 'radio', options: { grid_columns: 5, icons: typeIcons } },
            state: { type: 'string', enum: ['Open', 'Closed'], format: 'radio', readOnly: true, options: { grid_columns: 2 } },
            severity: { type: 'string', enum: finding.SEVERITIES, readOnly: true, options: { grid_columns: 2, icons: severityIcons } },
            title: { type: 'string', options: { grid_columns: 12, class: 'vgi-title' } },
            key: {
                type: 'string',
                description: 'Dedup key - code: function + param; dependency: name; secret: type + HMAC of the value',
                options: { grid_columns: 12, class: 'vgi-key' }
            },
            rules: { type: 'array', format: 'table', items: { type: 'string' }, options: { grid_columns: 4 } },
            cwe: { type: 'array', format: 'table', items: { type: 'string', pattern: '^CWE-[0-9]+$' }, options: { grid_columns: 2 } },
            cve: { type: 'array', format: 'table', items: { type: 'string', pattern: '^(CVE|GHSA)-' }, options: { grid_columns: 3 } },
            sources: { type: 'array', format: 'table', items: { type: 'string' }, options: { grid_columns: 3 } },
            openInstances: { type: 'integer', readOnly: true, options: { hidden: true } },
            kev: { type: 'string', enum: ['yes', 'no'], description: 'Known exploited CVE or active secret' },
            instances: {
                type: 'array',
                title: 'Instances',
                options: { grid_columns: 12, class: 'vgi-stack' },
                items: {
                    type: 'object',
                    title: 'Instance',
                    format: 'grid',
                    headerTemplate: '{{self.scope}} {{self.name}}: {{self.status}}',
                    required: ['scope', 'name', 'status'],
                    properties: {
                        scope: { type: 'string', enum: ['repo', 'product'], format: 'radio', options: { grid_columns: 3 } },
                        name: { type: 'string', options: { grid_columns: 5 } },
                        status: { type: 'string', enum: finding.OPEN.concat(finding.CLOSED), options: { grid_columns: 2, icons: statusIcons } },
                        severity: { type: 'string', enum: finding.SEVERITIES, options: { grid_columns: 2 } },
                        kev: { type: 'string', enum: ['yes', 'no'], options: { grid_columns: 2 } },
                        bu: { type: 'string', options: { grid_columns: 2 } },
                        productGroup: { type: 'string', options: { grid_columns: 2 } },
                        product: { type: 'string', options: { grid_columns: 2 } },
                        owner: { type: 'string', title: 'Owner team', options: { grid_columns: 2 } },
                        prodsecPartner: { type: 'string', title: 'ProdSec partner', options: { grid_columns: 2 } },
                        champion: { type: 'string', title: 'Security champion', options: { grid_columns: 2 } },
                        jira: { type: 'string', title: 'JIRA ticket', options: { grid_columns: 3 } },
                        files: { type: 'array', format: 'table', items: { type: 'string' }, options: { grid_columns: 5 } },
                        versions: { type: 'array', format: 'table', items: { type: 'string' }, options: { grid_columns: 4 } },
                        sources: {
                            type: 'array',
                            format: 'table',
                            options: { grid_columns: 12 },
                            items: {
                                type: 'object',
                                properties: {
                                    source: { type: 'string' },
                                    id: { type: 'string' },
                                    severity: { type: 'string', title: 'Original severity' },
                                    open: { type: 'boolean', format: 'checkbox' },
                                    kev: { type: 'boolean', format: 'checkbox', title: 'KEV or active secret' },
                                    url: { type: 'string', format: 'uri' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
