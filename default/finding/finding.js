// Shared normalize and dedup module for the Finding section.
//
// Redux-script interface: a reducer (one per input type: SARIF, GHAS, SBOM, JIRA...)
// turns a source record into one or more reduced records of this shape:
//   {
//     type:     'code' | 'dependency' | 'secret',
//     key:      code: function + param (firmware: binary + symbol), dependency: name as reported,
//               secret: secretKey(type, value, hmacKey) - never the secret value itself,
//     scope:    'repo' | 'product',
//     name:     repo full name or product name (one Instance per scope + name),
//     title, severity (any source scale), rule, cwe [], cve [], file, version,
//     source, sourceId, url, open (true while open in the source tool), detected (date, optional),
//     kev (true when a CVE is in the CISA KEV catalog), active (true when a secret is still valid),
//     owner, prodsecPartner, champion, product, productGroup, bu   (ownership, when known)
//   }
// merge() folds a reduced record into the Finding with the same type + key (the dedup key):
// one Finding per problem, one Instance per repo or product where it occurs.
// Findings are named SEC-YY-n: the year they were created and a sequence number within it.

const crypto = require('crypto');

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'Info'];
const OPEN = ['New', 'Triaged', 'Confirmed', 'In remediation'];
const CLOSED = ['Fixed', 'Verified', 'Closed', 'False positive', 'Not affected', 'Accepted risk', 'Duplicate'];
const SEVERITY_MAP = {
    critical: 'Critical', high: 'High', error: 'High', medium: 'Medium', moderate: 'Medium', warning: 'Medium',
    low: 'Low', note: 'Low', info: 'Info', informational: 'Info', none: 'Info'
};

// One severity scale: Critical/High/Medium/Low/Info. A number is read as a CVSS score.
function normalizeSeverity(s) {
    if (/^\s*\d+(\.\d+)?\s*$/.test(s)) s = parseFloat(s);
    if (typeof s === 'number') return s >= 9 ? 'Critical' : s >= 7 ? 'High' : s >= 4 ? 'Medium' : s > 0 ? 'Low' : 'Info';
    return SEVERITY_MAP[String(s || '').trim().toLowerCase()] || 'Info';
}

function worst(a, b) {
    return SEVERITIES.indexOf(a) <= SEVERITIES.indexOf(b) ? a : b;
}

// Dedup key of a secret: its type plus an HMAC of the value, so the value is never stored.
function secretKey(type, value, hmacKey) {
    return type + ':' + crypto.createHmac('sha256', hmacKey).update(String(value)).digest('hex');
}

function union(list, values) {
    [].concat(values || []).forEach(function (v) {
        if (v && list.indexOf(v) < 0) list.push(v);
    });
    return list;
}

function isOpen(status) {
    return OPEN.indexOf(status) >= 0;
}

function check(rec) {
    rec.key = String(rec.key || '').trim();
    if (['code', 'dependency', 'secret'].indexOf(rec.type) < 0 || !rec.key || !rec.name || !rec.source) {
        throw new Error('Invalid reduced record: type, key, name and source are required');
    }
    return rec;
}

// Folds a reduced record into a Finding body (null for a new Finding, which gets no ID here).
// Returns the new body.
function merge(body, rec) {
    check(rec);
    var f = body ? JSON.parse(JSON.stringify(body)) : {
        type: rec.type, key: rec.key, title: rec.title || rec.key,
        rules: [], cwe: [], cve: [], sources: [], instances: []
    };
    var scope = rec.scope === 'product' ? 'product' : 'repo';
    var inst = f.instances.find(function (i) { return i.scope === scope && i.name === rec.name; });
    if (!inst) {
        inst = { scope: scope, name: rec.name, status: 'New', files: [], versions: [], sources: [] };
        f.instances.push(inst);
    }
    ['owner', 'prodsecPartner', 'champion', 'product', 'productGroup', 'bu'].forEach(function (k) {
        if (rec[k]) inst[k] = rec[k];
    });
    union(inst.files, rec.file);
    union(inst.versions, rec.version);

    var severity = normalizeSeverity(rec.severity);
    var src = inst.sources.find(function (s) { return s.source === rec.source && s.id === String(rec.sourceId); });
    if (!src) {
        src = { source: rec.source, id: String(rec.sourceId || '') };
        inst.sources.push(src);
    }
    src.severity = rec.severity === undefined ? severity : String(rec.severity); // original severity kept
    src.open = rec.open !== false;
    src.kev = !!(rec.kev || rec.active); // per source item, so it clears when the source says so
    if (rec.url) src.url = rec.url;

    // Closure sync: the Instance is fixed when every source closed it, and reopens when one reopens it.
    var anyOpen = inst.sources.some(function (s) { return s.open; });
    if (!anyOpen && isOpen(inst.status)) inst.status = 'Fixed';
    else if (anyOpen && ['Fixed', 'Verified', 'Closed'].indexOf(inst.status) >= 0) inst.status = 'New';
    inst.kev = inst.sources.some(function (s) { return s.kev; }) ? 'yes' : 'no';
    inst.severity = inst.sources.reduce(function (w, s) { return worst(w, normalizeSeverity(s.severity)); }, 'Info');

    union(f.rules, rec.rule);
    union(f.cwe, rec.cwe);
    union(f.cve, rec.cve);
    union(f.sources, rec.source);
    // The Finding: highest open severity, open while any Instance is open.
    var open = f.instances.filter(function (i) { return isOpen(i.status); });
    f.state = open.length ? 'Open' : 'Closed';
    f.severity = (open.length ? open : f.instances).reduce(function (w, i) { return worst(w, i.severity); }, 'Info');
    f.openInstances = open.length;
    // Known exploited CVE or active secret anywhere.
    f.kev = f.instances.some(function (i) { return i.kev === 'yes'; }) ? 'yes' : 'no';
    return f;
}

// Computed fields kept outside body (not edited, not in history), refreshed for every Finding:
// created quarter (YY-Qn), created month (YY-MM) and age bucket (months from creation to now).
async function refreshComputed(Document) {
    var months = { $dateDiff: { startDate: '$createdAt', endDate: '$$NOW', unit: 'month' } };
    var yy = { $substrCP: [{ $dateToString: { date: '$createdAt', format: '%Y' } }, 2, 2] };
    await Document.updateMany({}, [{
        $set: {
            computed: {
                quarter: { $concat: [yy, '-Q', { $toString: { $ceil: { $divide: [{ $month: '$createdAt' }, 3] } } }] },
                month: { $concat: [yy, { $dateToString: { date: '$createdAt', format: '-%m' } }] },
                age: { $switch: { branches: [
                    { case: { $lt: [months, 3] }, then: '0-3m' },
                    { case: { $lt: [months, 6] }, then: '3-6m' },
                    { case: { $lt: [months, 12] }, then: '6-12m' }
                ], default: '1y+' } }
            }
        }
    }]);
}

// Next SEC-YY-n number for a two-digit year.
async function nextNumber(Document, yy) {
    var top = await Document.aggregate([
        { $match: { 'body.ID': { $regex: '^SEC-' + yy + '-[0-9]+$' } } },
        { $group: { _id: null, n: { $max: { $toInt: { $substrCP: ['$body.ID', 7, 12] } } } } }
    ]).toArray();
    return (top.length ? top[0].n : 0) + 1;
}

// Merges reduced records into the collection, recording every change in the history collection.
async function upsert(Document, History, recs, author) {
    var history = require('../../lib/history');
    var byKey = {};
    recs.forEach(function (r) {
        check(r);
        (byKey[r.type + '\n' + r.key] = byKey[r.type + '\n' + r.key] || []).push(r);
    });
    var counts = { created: 0, updated: 0 };
    var next = {};
    for (var k of Object.keys(byKey)) {
        var group = byKey[k];
        var old = await Document.findOne({ 'body.type': group[0].type, 'body.key': group[0].key });
        var body = group.reduce(merge, old ? old.body : null);
        var now = new Date();
        var doc = { body: body, author: author, updatedAt: now };
        if (old) {
            if (!history.addModelHistory(History, old, Object.assign({}, old, doc, { __v: old.__v + 1 }))) continue;
            await Document.updateOne({ _id: old._id }, { $set: doc, $inc: { __v: 1 } });
            counts.updated++;
        } else {
            // Created when first detected in a source, else now.
            var created = group.reduce(function (d, r) {
                var t = r.detected ? new Date(r.detected) : now;
                return isNaN(t) || t > d ? d : t;
            }, now);
            var yy = String(created.getUTCFullYear()).slice(2);
            next[yy] = next[yy] || await nextNumber(Document, yy);
            body.ID = 'SEC-' + yy + '-' + next[yy]++;
            doc.body = Object.assign({ ID: body.ID }, body);
            doc.__v = 0;
            doc.createdAt = created;
            var r = await Document.insertOne(doc);
            history.addModelHistory(History, null, Object.assign({ _id: r.insertedId }, doc));
            counts.created++;
        }
    }
    await refreshComputed(Document);
    return counts;
}

module.exports = { SEVERITIES, OPEN, CLOSED, normalizeSeverity, secretKey, merge, upsert, refreshComputed };
