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
var cveEdit = pug.compileFile('default/cve/edit.pug', {compileDebug: false});
confOpts = {
    cve: optSet('cve', ['default'].concat(process.argv.slice(2)))
}

confOpts.cve.conf.uri = '/';
var cveProps = confOpts.cve.schema.properties;
delete cveProps.CNA_private;
cveProps.CVE_data_meta.properties.STATE.enum = 
 cveProps.CVE_data_meta.properties.STATE.enum.filter(x => !['DRAFT','REVIEW', 'READY'].includes(x));

fs.writeFileSync("standalone/index.html", cveEdit({
    title: 'Vulnogram CVE Editor',
    idpath: 'CVE_data_meta.ID',
    min: true,
    doc: null,
    conf: conf,
    confOpts: confOpts,
    opts: confOpts.cve,
    schemaName: 'cve',
    allowAjax: false,
}));

var pugRender = pug.compileFileClient('default/cve/render.pug', {
        basedir: 'views',
        name: 'pugRender',
        compileDebug: false,
        inlineRuntimeFunctions: true,
});

for (jsDir of ['standalone', 'standalone/js', 'standalone/js/cve']) {
    if (!fs.existsSync(jsDir)) {
        fs.mkdirSync(jsDir); 
    }
}

fs.writeFileSync("standalone/js/cve/render.js", pugRender);
