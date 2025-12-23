#!/usr/bin/env node
const fs = require('fs');

const file = process.argv[2] || 'cwec_v4.19.xml';
const xml = fs.readFileSync(file, 'utf8');

const hasMultipleUppercase = w => (w.match(/[A-Z]/g) || []).length > 1;
const toSentenceCase = s => s.split(' ').map((w, i) =>
    w === w.toUpperCase() || hasMultipleUppercase(w) ? w : (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())
).join(' ');

const results = [];
const weaknessRegex = /<Weakness\s+ID="(\d+)"\s+Name="([^"]+)"[^>]*>[\s\S]*?<\/Weakness>/g;
let match;

while ((match = weaknessRegex.exec(xml)) !== null) {
    const [block, id, name] = match;
    if (/<Usage>Allowed<\/Usage>/.test(block)) {
        results.push(`CWE-${id} ${toSentenceCase(name)}`);
    }
}

results.sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
fs.writeFileSync('cwe.json', JSON.stringify({ examples: results }, null, 0.1));
console.log(`Generated cwe.json with ${results.length} entries`);
