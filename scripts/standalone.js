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
    cve: optSet('cve5', ['default'].concat(process.argv.slice(2)))
}
//console.log(confOpts.cve.render);
confOpts.cve.conf.uri = '.';
var cveProps = confOpts.cve.schema.properties;
if (cveProps && cveProps.CNA_private) {
    delete cveProps.CNA_private;
}
/*
cveProps.CVE_data_meta.properties.STATE.enum = 
 cveProps.CVE_data_meta.properties.STATE.enum.filter(x => !['DRAFT','REVIEW', 'READY'].includes(x));
*/
fs.writeFileSync("standalone/index.html", cveEdit({
    title: 'Vulnogram CVE Editor',
    idpath: 'cveMetadata.id',
    min: true,
    doc: null,
    pugLib: pug,
    conf: conf,
    confOpts: confOpts,
    opts: confOpts.cve,
    schemaName: 'cve',
    allowAjax: false,
}));
