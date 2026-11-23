// Generates dummy findings for development, tests and demos, and merges them into the
// findings collection through the same normalize/dedup path real importers use.
//   node default/finding/dummy.js [count]     (from the repo root; default 300 reduced records)
// Re-running updates the same Findings (stable keys), so history accumulates.
require('dotenv').config();
const conf = require('../../config/conf');
const mongo = require('../../lib/mongo');
const crypto = require('crypto');
const finding = require('./finding.js');

const N = parseInt(process.argv[2], 10) || 300;
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const repos = [
    ['acme/router-web', 'Router UI', 'Home WiFi', 'Home', 'team-web', 'alice', 'raj'],
    ['acme/cloud-api', 'Cloud Portal', 'Cloud', 'Enterprise', 'team-cloud', 'bob', 'mei'],
    ['acme/mobile-app', 'Mobile App', 'Apps', 'Home', 'team-mobile', 'alice', 'tom'],
    ['acme/switch-mgmt', 'Smart Switch', 'Switching', 'Enterprise', 'team-switch', 'carol', 'ana'],
    ['acme/billing', 'Cloud Portal', 'Cloud', 'Enterprise', 'team-billing', 'bob', 'li']
];
const products = [
    ['Acme Home Router', 'Home WiFi', 'Home', 'team-fw-home', 'alice', 'raj', ['1.0.2', '1.0.4', '1.1.0']],
    ['Acme Managed Switch', 'Switching', 'Enterprise', 'team-fw-switch', 'carol', 'ana', ['12.0.1', '12.0.3']],
    ['Acme Mesh Extender', 'Home WiFi', 'Home', 'team-fw-home', 'alice', 'raj', ['3.2.0', '3.3.1']]
];
const code = [
    ['js/sql-injection', 'CWE-89', 'SQL injection', 'high', 'db.query + id'],
    ['js/xss', 'CWE-79', 'Cross-site scripting', 'medium', 'render + name'],
    ['py/path-injection', 'CWE-22', 'Path traversal', 'high', 'open_file + path'],
    ['js/insecure-randomness', 'CWE-338', 'Insecure randomness', 'low', 'token + Math.random'],
    ['c/overflow-buffer', 'CWE-120', 'Buffer overflow', 'critical', 'httpd + parse_header'],
    ['c/command-line-injection', 'CWE-78', 'OS command injection', 'critical', 'cgi-bin/setup + ping_addr']
];
const deps = [
    ['openssl', ['CVE-2024-5535', 'CVE-2024-6119'], 9.1],
    ['busybox', ['CVE-2022-48174'], 9.8],
    ['lodash', ['CVE-2021-23337'], 7.2],
    ['dnsmasq', ['CVE-2023-28450'], 7.5],
    ['jquery', ['CVE-2020-11023'], 6.1]
];
const secrets = ['aws_access_key', 'github_token', 'private_key'];
const kevs = ['CVE-2020-11023']; // the dummy CVEs in the CISA KEV catalog
const sources = ['GHAS', 'Semgrep', 'Codex Security', 'Claude Security'];

function reduced() {
    var onProduct = Math.random() < 0.35;
    var r = onProduct ? pick(products) : pick(repos);
    var rec = onProduct
        ? { scope: 'product', name: r[0], product: r[0], productGroup: r[1], bu: r[2], owner: r[3], prodsecPartner: r[4], champion: r[5], version: pick(r[6]) }
        : { scope: 'repo', name: r[0], product: r[1], productGroup: r[2], bu: r[3], owner: r[4], prodsecPartner: r[5], champion: r[6] };
    var kind = Math.random();
    if (kind < 0.5) {
        var c = pick(code);
        var fn = c[4].split(' + ')[0];
        var key = c[4] + pick(['', '', '_2', '_v6', '_ext']);
        Object.assign(rec, { type: 'code', key: key, title: c[2] + ' in ' + fn, rule: c[0], cwe: c[1], severity: c[3],
            source: onProduct ? 'Firmware Scan' : pick(sources), file: onProduct ? '/usr/sbin/' + fn : 'src/' + fn.replace(/\W+/g, '_') + '.js' });
    } else if (kind < 0.85) {
        var d = pick(deps);
        Object.assign(rec, { type: 'dependency', key: d[0], title: 'Outdated ' + d[0], cve: d[1], severity: d[2],
            source: onProduct ? pick(['Partner SBOM', 'Firmware Scan', 'Finite State']) : 'GHAS',
            kev: d[1].some((c) => kevs.includes(c)) });
    } else {
        var s = pick(secrets);
        // Demo only: the HMAC of a fake value; real importers must never store the value.
        Object.assign(rec, { type: 'secret', key: finding.secretKey(s, 'demo-' + s + '-' + rec.name, 'dummy-hmac-key'),
            title: 'Exposed ' + s.replace(/_/g, ' '), cwe: 'CWE-798', severity: 'high', source: 'GHAS', file: '.env',
            active: Math.random() < 0.3 });
    }
    // Stable per source item, so a re-run updates it (and may close or reopen it) instead of adding one.
    var hash = crypto.createHash('sha256').update(rec.type + rec.key + rec.name).digest();
    rec.sourceId = rec.source.split(' ')[0].toLowerCase() + '-' + hash.toString('hex').slice(0, 6);
    rec.open = Math.random() < 0.75;
    rec.detected = new Date(Date.now() - hash.readUInt16BE(6) % 730 * 864e5); // stable, within 2 years
    return rec;
}

(async function () {
    var db = await mongo.connect(conf.database);
    var Document = db.collection('findings');
    await Document.createIndex({ 'body.ID': 1 }, { unique: true });
    await Document.createIndex({ 'body.type': 1, 'body.key': 1 }, { unique: true });
    var recs = Array.from({ length: N }, reduced);
    var counts = await finding.upsert(Document, db.collection('finding_histories'), recs, 'dummy');
    console.log('Merged ' + N + ' reduced records:', counts, 'findings now:', await Document.countDocuments());
    await new Promise((r) => setTimeout(r, 500)); // let history writes finish
    process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
