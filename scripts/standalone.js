// Copyright (c) 2018 Chandan B N. All rights reserved.

// Generate the standalone static Vulnogram client side only page

// usage:
// $ node scripts/standalone.js

// to load a customized overide schema in 'custom/cve/conf.js': 
// $ node scripts/standalone.js custom

const fs = require('fs');
const pug = require('pug');
const conf = require('../config/conf-standalone');
const optSet = require('../models/set');
// Compile the template to a function string

var editTemplate = fs.existsSync('custom/cve5/edit.pug') ? 'custom/cve5/edit.pug' : 'default/cve5/edit.pug';
/*var renderTemplate = fs.existsSync('custom/cve/render.pug') ? 'custom/cve/render.pug' : 'default/cve/render.pug';*/

var cveEdit = pug.compileFile(editTemplate, {compileDebug: false});
confOpts = {
    cve: optSet('cve5', ['default'].concat(process.argv.slice(2))),
    cvss4: optSet('cvss4', ['default'].concat(process.argv.slice(2))),
    seaview: {conf:{
        uri:'https://www.vulnogram.org/seaview/',
        class:'vgi-search',
        title: 'Search and Display CVEs',
        name: 'Seaview - CVE Search',
    }}
}
confOpts.cve.conf.uri = '/';
confOpts.cve.conf.name = 'CVE';
confOpts.cvss4.conf.uri = '/cvss4';

var cd = confOpts.cve.schema?.definitions;
if (cd && cd.CNA_private) {
    delete cd.CNA_private;
}
cd = confOpts.cve.schema.oneOf[0]?.properties;
if (cd && cd.CNA_private) {
    delete cd.CNA_private;
}

fs.writeFileSync("standalone/index.html", cveEdit({
    title: 'Vulnogram CVE Editor',
    idpath: 'cveMetadata.cveId',
    min: true,
    doc: null,
    pugLib: pug,
    conf: conf,
    confOpts: confOpts,
    opts: confOpts.cve,
    schemaName: 'cve',
    allowAjax: true,
}));

fs.writeFileSync("standalone/cvss4.html", pug.compileFile('default/cvss4/edit.pug', {compileDebug: false})({
    title: 'Common Vulnerability Scoring System CVSS 4',
    idpath: 'vectorString',
    min: true,
    doc: null,
    pugLib: pug,
    conf: conf,
    confOpts: confOpts,
    opts: confOpts.cvss4,
    schemaName: 'cvss4',
    allowAjax: true,
}));
