// Copyright (c) 2017 Chandan B N. All rights reserved.

// Generate the standalone static Vulnogram client side only page
const fs = require('fs');
const pug = require('pug');
const conf = require('../config/conf-standalone');

// Compile the template to a function string
var cveEdit = pug.compileFile('default/cve/edit.pug', {compileDebug: false});

// Maybe you want to compile all of your templates to a templates.js file and serve it to the client
fs.writeFileSync("standalone/index.html",cveEdit({
    title: 'Vulnogram CVE Editor',
    idpath: 'CVE_data_meta.ID',
    min: true,
    doc: null,
    conf: conf,
    schemaName: ''
}));

var pugRender = pug.compileFileClient('default/cve/render.pug', {
        basedir: 'views',
        name: 'pugRender',
        compileDebug: false,
        inlineRuntimeFunctions: true 
});
var jsDir = 'standalone';
    if (!fs.existsSync(jsDir)) {
                fs.mkdirSync(jsDir); 
    }
fs.writeFileSync("public/js/render.js", pugRender);
