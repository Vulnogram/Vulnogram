// Minimal CSAF 2.1 (csaf_security_advisory profile) export of the CVE record in the editor.
// All exports are TLP:CLEAR.
//
// A CVE record does not carry the publisher. It comes from, in order:
//  - csafPublisher in config.js (name, namespace, category), when name and namespace are set;
//  - CVE Services (organization name), when logged in to the CVE Portal;
//  - the CVE website's CNA list (organization name, type, advisory site), found by the CNA short name,
//    which is looked up from the record's org id in the Vulnogram org index when the record has none;
//  - the CNA short name and the category 'vendor'.
var CSAF_CNA_LIST = 'https://raw.githubusercontent.com/CVEProject/cve-website/dev/src/assets/data/CNAsList.json';
var CSAF_ORG_INDEX = 'https://raw.githubusercontent.com/Vulnogram/cve-index/refs/heads/main/data/orgs.json'; // org id -> short name
var CSAF_CATEGORY = { 'CERT': 'coordinator', 'Bug Bounty Provider': 'coordinator', 'Researcher': 'discoverer' };

async function csafJson(url) {
    try {
        return await (await fetch(url)).json();
    } catch (e) {
        return null;
    }
}

async function csafPublisher(rec) {
    var cfg = window.csafConfig || {};
    if (cfg.name && cfg.namespace) return { category: cfg.category || 'vendor', name: cfg.name, namespace: cfg.namespace };

    var meta = rec.containers.cna.providerMetadata || {};
    var short = meta.shortName || rec.cveMetadata.assignerShortName;
    var name;
    try { // only works when logged in
        var org = await csClient.getOrgInfo();
        name = org.name;
        short = org.short_name || short;
    } catch (e) {}
    if (!short) short = ((await csafJson(CSAF_ORG_INDEX)) || {})[rec.cveMetadata.assignerOrgId || meta.orgId];
    var cna = ((await csafJson(CSAF_CNA_LIST)) || []).find(function (c) { return short && c.shortName.toLowerCase() === short.toLowerCase(); }) || {};
    var links = [].concat((cna.securityAdvisories || {}).advisories || [], cna.disclosurePolicy || []);
    var link = links.find(function (l) { return /^https?:\/\/[^\/\s]+/.test(l.url); });
    var pub = {
        category: cfg.category || CSAF_CATEGORY[(cna.CNA || { type: [] }).type[0]] || 'vendor',
        name: cfg.name || name || cna.organizationName || short,
        namespace: cfg.namespace || (link ? new URL(link.url).origin : 'https://www.cve.org/PartnerInformation/ListofPartners/partner/' + encodeURIComponent(short))
    };
    if (!pub.name) throw new Error('Cannot tell who the CSAF publisher is: set the CNA short name or a known org id in the record, log in to the CVE Portal, or set csafPublisher in config.js.');
    return pub;
}

// CVE JSON 5 timestamps may omit the time or the timezone (GMT is assumed); CSAF date-time requires both.
function csafDate(d) {
    d = /T/.test(d) ? d : d + 'T00:00:00';
    return /(Z|[+-]\d\d:\d\d)$/.test(d) ? d : d + 'Z';
}

// CVE reference URLs may hold characters (|, [, {, non-ASCII...) that are not valid in a CSAF (RFC 3986) URI.
function csafUri(u) {
    return encodeURI(u).replace(/%25([0-9A-F]{2})/gi, '%$1');
}

// Rows of a CVE list with a non-blank value (the editor lets blank rows through).
function csafRows(list, key) {
    return (list || []).filter(function (r) { return r && String(r[key] || '').trim(); });
}

// Product name / version text: CVE placeholders (n/a, 0, unspecified) are dropped next to real data.
function csafName(parts) {
    var real = parts.filter(function (s) { return s && !/^n\/a$/i.test(s); });
    return real.length ? real.join(' ') : parts.some(Boolean) ? 'n/a' : ''; // all unknown: keep a name
}

function csafVersion(v) {
    var from = ['0', 'unspecified', 'n/a'].indexOf(v.version) >= 0 ? '' : v.version;
    var to = v.lessThan ? 'before ' + v.lessThan : v.lessThanOrEqual ? 'through ' + v.lessThanOrEqual : '';
    return to ? csafName([from && 'from ' + from, to]) : csafName([from]);
}

// CWE catalog version of the editor's CWE list (see scripts/parse-cwe.js).
var CSAF_CWE_VERSION = '4.19';
var CSAF_STATUS = { affected: 'known_affected', unaffected: 'known_not_affected', unknown: 'under_investigation' };
var CSAF_CVSS = [['cvssV2_0', 'cvss_v2'], ['cvssV3_0', 'cvss_v3'], ['cvssV3_1', 'cvss_v3'], ['cvssV4_0', 'cvss_v4']];
var CSAF_SEVERITIES = ['critical', 'high', 'medium', 'low', 'none']; // most severe first
var CSAF_VULNOGRAM = 'https://vulnogram.org/';

// Keeps the most severe rating seen in ctx.severity (an index of CSAF_SEVERITIES).
function csafSeen(ctx, severity) {
    var i = CSAF_SEVERITIES.indexOf(String(severity).toLowerCase());
    if (i >= 0) ctx.severity = Math.min(ctx.severity, i);
}
// Affected-product fields with no CSAF counterpart: exported as a note on the product.
var CSAF_DETAILS = [['modules', 'Modules'], ['programFiles', 'Program files'], ['programRoutines', 'Program routines'],
    ['repo', 'Repository'], ['collectionURL', 'Collection URL'], ['packageName', 'Package name']];

// Maps the CNA container of one CVE JSON 5 record (ADP containers are ignored) to a CSAF vulnerability.
// ctx: products and known (the product tree shared by all vulnerabilities) and the release date of the document.
function csafVuln(rec, ctx) {
    var cna = rec && rec.containers && rec.containers.cna;
    if (!cna) throw new Error('Fix the errors in the CVE record before exporting.');
    if (rec.cveMetadata.state === 'REJECTED') throw new Error('A rejected CVE record has no vulnerability to export.');

    var id = rec.cveMetadata.cveId;
    var products = ctx.products;

    // Product tree: one product per affected version, version change and vulnerable CPE match.
    var status = {};
    var detailNotes = [];
    function product(name, group, helper) {
        var key = name + '|' + group + '|' + JSON.stringify(helper);
        var pid = ctx.known[key];
        if (!pid) {
            var p = { name: name, product_id: 'CSAFPID-' + String(products.length + 1).padStart(4, '0') };
            if (helper && Object.keys(helper).length) p.product_identification_helper = helper;
            products.push(p);
            pid = ctx.known[key] = p.product_id;
        }
        var list = (status[group] = status[group] || []);
        if (list.indexOf(pid) < 0) list.push(pid);
        return pid;
    }
    (cna.affected || []).forEach(function (a) {
        var base = csafName([a.vendor, a.product || a.packageName]);
        if (base && a.platforms && a.platforms.length) base += ' (' + a.platforms.join(', ') + ')';
        var helper = {};
        if (a.cpes && a.cpes.length === 1 && a.cpes[0].trim()) helper.cpe = a.cpes[0];
        var purl = /^pkg:[a-z][a-z0-9.\-]*\/\S+$/.test(a.packageURL || '');
        if (purl) helper.purls = [a.packageURL];
        var pids = [];
        // The editor adds an empty placeholder version to entries without versions.
        var versions = (a.versions || []).filter(function (v) { return v.version || v.lessThan || v.lessThanOrEqual; });
        (versions.length ? versions : [{ status: a.defaultStatus }]).forEach(function (v) {
            var name = csafName([base, csafVersion(v)]);
            if (!name) return; // empty placeholder entry of a new record
            pids.push(product(name, CSAF_STATUS[v.status] || 'under_investigation', helper));
            (v.changes || []).forEach(function (c) {
                var group = c.status === 'unaffected' ? 'first_fixed' : CSAF_STATUS[c.status] || 'under_investigation';
                pids.push(product(csafName([base, (c.status === 'affected' ? 'from ' : '') + c.at]), group, helper));
            });
        });
        // Only the fixed versions are listed: everything else is affected by default.
        if (base && versions.length && a.defaultStatus === 'affected' && !versions.some(function (v) { return v.status === 'affected'; })) {
            pids.push(product(base + ' (all versions not listed as unaffected)', 'known_affected', helper));
        }
        var lines = [];
        if (a.cpes && a.cpes.length > 1) lines.push('CPEs: ' + a.cpes.join(', '));
        CSAF_DETAILS.forEach(function (d) {
            if (a[d[0]] && a[d[0]].length) {
                lines.push(d[1] + ': ' + [].concat(a[d[0]]).map(function (x) { return x.name || x; }).join(', ')); // programRoutines are {name}
            }
        });
        if (a.packageURL && !purl) lines.push('Package URL: ' + a.packageURL);
        if (a.defaultStatus && a.defaultStatus !== 'unaffected') lines.push('Default status of versions not listed: ' + a.defaultStatus);
        if (pids.length && lines.length) {
            detailNotes.push({ category: 'details', title: 'Affected product details', text: lines.join('\n'), product_ids: pids });
        }
    });
    (cna.cpeApplicability || []).forEach(function (el) {
        (el.nodes || []).forEach(function (n) {
            (n.cpeMatch || []).forEach(function (m) {
                if (!m.vulnerable || n.negate || !m.criteria) return;
                var from = m.versionStartIncluding ? 'from ' + m.versionStartIncluding : m.versionStartExcluding ? 'after ' + m.versionStartExcluding : '';
                var to = m.versionEndExcluding ? 'before ' + m.versionEndExcluding : m.versionEndIncluding ? 'through ' + m.versionEndIncluding : '';
                product(csafName([m.criteria, from, to]), 'known_affected', { cpe: m.criteria });
            });
        });
    });
    if (!status.known_affected) throw new Error('Add at least one affected product version: CSAF requires one.');
    var affected = status.known_affected;

    var notes = [];
    function note(title, lines) {
        if (lines.length) notes.push({ category: 'other', title: title, text: lines.join('\n') });
    }
    csafRows(cna.descriptions, 'value').forEach(function (d) {
        var n = { category: 'description', text: d.value };
        if (d.lang && !/^en/i.test(d.lang)) n.title = 'Description (' + d.lang + ')';
        notes.push(n);
    });
    csafRows(cna.configurations, 'value').forEach(function (c) { notes.push({ category: 'other', title: 'Configuration', text: c.value }); });
    note('Timeline', csafRows(cna.timeline, 'value').map(function (t) { return csafDate(t.time) + ': ' + t.value; }));
    note('Tags', cna.tags && cna.tags.length ? [cna.tags.join(', ')] : []);
    note('Source', Object.keys(cna.source || {}).filter(function (k) { return cna.source[k] !== 'UNKNOWN'; }).map(function (k) { return k + ': ' + [].concat(cna.source[k]).join(', '); }));
    note('Taxonomy mappings', [].concat.apply([], (cna.taxonomyMappings || []).map(function (t) {
        return (t.taxonomyRelations || []).map(function (r) {
            return [t.taxonomyName, t.taxonomyVersion, r.taxonomyId, r.relationshipName, r.relationshipValue].filter(Boolean).join(' ');
        });
    })));

    // CWEs from the problem types; anything else is kept as a note.
    var cwes = [];
    var problems = [];
    (cna.problemTypes || []).forEach(function (p) {
        (p.descriptions || []).forEach(function (d) {
            var name = (d.description || '').replace(/^CWE-\d+[\s:\-]*/i, '').trim();
            if (/^CWE-[1-9]\d{0,5}$/.test(d.cweId) && name) {
                if (!cwes.some(function (c) { return c.id === d.cweId; })) {
                    cwes.push({ id: d.cweId, name: name, version: CSAF_CWE_VERSION });
                }
            } else if (d.description && d.description !== 'n/a') {
                problems.push((d.type && d.type !== 'text' ? d.type + ': ' : '') + d.description);
            }
        });
    });
    note('Problem types', problems);

    // Metrics: CVSS scores apply to every known affected product; one score per CVSS version.
    var metrics = [];
    var scored = {};
    var rating = '';
    (cna.metrics || []).forEach(function (m) {
        CSAF_CVSS.forEach(function (k) {
            var c = m[k[0]];
            if (!c) return;
            // CVSS v2 has no severity rating: use its NVD ranges.
            csafSeen(ctx, c.baseSeverity || (c.baseScore >= 7 ? 'high' : c.baseScore >= 4 ? 'medium' : 'low'));
            if (scored[k[1] + c.version]) return;
            scored[k[1] + c.version] = true;
            var content = {};
            content[k[1]] = c;
            metrics.push({ content: content, products: affected });
        });
        var o = m.other;
        if (o && o.content) {
            var sev = String(o.content.text || o.content.value || o.content.other || '').toLowerCase();
            if (!rating && /severity/i.test(o.type || '') && CSAF_SEVERITIES.indexOf(sev) >= 0) {
                rating = sev;
                csafSeen(ctx, sev);
            } else {
                note(o.type || 'Other metric', [JSON.stringify(o.content)]);
            }
        }
    });
    // CSAF forbids a qualitative rating next to CVSS from the same source.
    if (rating && metrics.length) note('Severity rating', [rating]);
    else if (rating) metrics.push({ content: { qualitative_severity_rating: rating }, products: affected });

    var threats = csafRows(cna.exploits, 'value').map(function (e) {
        return { category: 'exploit_status', details: e.value, product_ids: affected };
    });
    (cna.impacts || []).forEach(function (i) {
        csafRows(i.descriptions, 'value').forEach(function (d) {
            var capec = i.capecId && d.value.indexOf(i.capecId) < 0 ? i.capecId + ' ' : '';
            threats.push({ category: 'impact', details: capec + d.value, product_ids: affected });
        });
    });
    var remediations = csafRows(cna.solutions, 'value').map(function (s) {
        return { category: 'vendor_fix', details: s.value, product_ids: affected };
    }).concat(csafRows(cna.workarounds, 'value').map(function (w) {
        return { category: 'workaround', details: w.value, product_ids: affected };
    }));

    var vuln = { cve: id };
    if (cna.title) vuln.title = cna.title;
    // CSAF requires the disclosure date not to be later than the latest revision.
    var disclosed = cna.datePublic && csafDate(cna.datePublic);
    if (disclosed && Date.parse(disclosed) <= Date.parse(ctx.current)) vuln.disclosure_date = disclosed;
    function put(key, arr) { if (arr.length) vuln[key] = arr; }
    put('notes', notes.concat(detailNotes));
    put('cwes', cwes);
    put('metrics', metrics);
    put('threats', threats);
    put('remediations', remediations);
    put('acknowledgments', csafRows(cna.credits, 'value').map(function (c) {
        var a = { names: [c.value] };
        if (c.type) a.summary = c.type;
        return a;
    }));
    put('references', csafRows(cna.references, 'url').map(function (r) {
        return { url: csafUri(r.url), summary: (r.name || r.url) + (r.tags && r.tags.length ? ' [' + r.tags.join(', ') + ']' : '') };
    }).concat({ url: CSAF_VULNOGRAM + encodeURIComponent(id), summary: id + ' on Vulnogram' }));
    vuln.product_status = status;
    return vuln;
}

// Builds one CSAF 2.1 document with a vulnerability for each CVE record. With several records, the ones
// that cannot be exported are skipped and listed in skipped; with a single record the error is thrown.
function csafBuild(recs, skipped) {
    var now = new Date().toISOString();
    var meta = recs.map(function (r) { return (r && r.cveMetadata) || {}; });
    function dates(key) {
        return meta.map(function (m) { return m[key] && csafDate(m[key]); }).filter(Boolean)
            .sort(function (a, b) { return Date.parse(a) - Date.parse(b); });
    }
    var published = dates('datePublished')[0] || csafDate(now);
    var updated = dates('dateUpdated').pop() || published;
    var revisions = [{ date: published, number: '1', summary: 'Initial version.' }];
    if (Date.parse(updated) > Date.parse(published)) {
        revisions.push({ date: updated, number: '2', summary: 'Updated.' });
    }
    var current = revisions[revisions.length - 1];

    var ctx = { products: [], known: {}, current: current.date, severity: CSAF_SEVERITIES.length };
    var vulns = [];
    recs.forEach(function (rec, i) {
        try {
            vulns.push(csafVuln(rec, ctx));
        } catch (e) {
            if (recs.length === 1) throw e;
            skipped.push(meta[i].cveId + ': ' + e.message);
        }
    });
    if (!vulns.length) throw new Error('None of the selected CVEs can be exported:\n' + skipped.join('\n'));

    var ids = vulns.map(function (v) { return v.cve; });
    var title = ids.length === 1 ? vulns[0].title
        : ids.slice(0, 5).join(', ') + (ids.length > 5 ? ' and ' + (ids.length - 5) + ' more' : '');
    if (!title) throw new Error('Fill in the CNA title: CSAF requires a document title.');

    // Document references: the URLs that more than one of the CVEs refer to.
    var seen = {};
    var common = [];
    vulns.forEach(function (v) {
        (v.references || []).forEach(function (r) {
            var n = seen[r.url] = (seen[r.url] || 0) + 1;
            if (n === 2) common.push(r);
        });
    });

    var csaf = {
        $schema: 'https://docs.oasis-open.org/csaf/csaf/v2.1/schema/csaf.json',
        document: {
            category: 'csaf_security_advisory',
            csaf_version: '2.1',
            distribution: { tlp: { label: 'CLEAR' } },
            publisher: {}, // set by csafDownload
            title: title,
            tracking: {
                id: ids.length === 1 ? ids[0] : ids[0] + ' and ' + (ids.length - 1) + ' more',
                status: 'final',
                version: current.number,
                initial_release_date: published,
                current_release_date: current.date,
                revision_history: revisions,
                generator: { date: now, engine: { name: 'Vulnogram' } }
            }
        },
        product_tree: { full_product_names: ctx.products },
        vulnerabilities: vulns
    };
    var doc = csaf.document;
    // Aggregate severity: the most severe CVSS or qualitative rating of all the CVEs.
    if (ctx.severity < CSAF_SEVERITIES.length) {
        var sev = CSAF_SEVERITIES[ctx.severity];
        doc.aggregate_severity = { namespace: 'https://www.first.org/cvss/specification-document', text: sev[0].toUpperCase() + sev.slice(1) };
    }
    if (common.length) doc.references = common;
    return csaf;
}

// Downloads the CVE records (one or many) as a single CSAF file.
async function csafDownload(recs) {
    try {
        var skipped = [];
        var csaf = csafBuild(recs, skipped);
        csaf.document.publisher = await csafPublisher(recs.find(Boolean));
        var link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([JSON.stringify(csaf, null, 2)], { type: 'application/json' }));
        // CSAF file name: lowercase tracking id, only [+-a-z0-9_], .json
        link.download = csaf.document.tracking.id.toLowerCase().replace(/[^+\-a-z0-9]+/g, '_') + '.json';
        link.click();
        if (skipped.length) showAlert('Skipped ' + skipped.length + ' CVE(s) that cannot be exported:', skipped.join('\n'));
    } catch (e) {
        showAlert(e.message);
    }
}

// Editor: the CVE being edited.
function saveCSAF() {
    return csafDownload([mainTabGroup.getValue()]);
}

// List page: the selected rows.
async function saveCSAFSelected() {
    var ids = Array.from(document.querySelectorAll('#vgListTable .rowCheck:checked')).map(function (el) { return el.value; });
    if (!ids.length) return showAlert('Select one or more CVEs to export.');
    try {
        var response = await fetch('/' + schemaName + '/json/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'CSRF-Token': csrfToken },
            body: JSON.stringify({ ids: ids, fields: ['body'] })
        });
        if (!response.ok) throw new Error('Failed to load the selected CVEs: ' + response.statusText);
        var docs = (await response.json()).map(function (d) { return d.body; });
        docs.sort(function (a, b) { return a.cveMetadata.cveId < b.cveMetadata.cveId ? -1 : 1; });
        await csafDownload(docs);
    } catch (e) {
        showAlert(e.message);
    }
}
