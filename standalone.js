// Copyright (c) 2017 Chandan B N. All rights reserved.

// Generate the standalone static Vulnogram client side only page
const fs = require('fs');
const pug = require('pug');
const conf = require('./config/conf-standalone');

// Compile the template to a function string
var cveEdit = pug.compileFile('views/cves/edit.pug', {compileDebug: false});

// Maybe you want to compile all of your templates to a templates.js file and serve it to the client
fs.writeFileSync("standalone/index.html",cveEdit({
    title: 'Vulnogram CVE Editor',
    min: true,
    doc: null,
    conf: conf
}));

var sa = fs.readFileSync('views/cves/'+ conf.advisoryTemplates +'/advisory.pug', "utf8");
var advisoryFunc = pug.compileClient(sa + "\n+page(locals)\n", {name: "advisoryTemplate", compileDebug: false});

var mitre = fs.readFileSync('views/cves/mitre.pug', "utf8");

var mitrewebFunc = pug.compileClient(mitre + "\n+page(locals)\n", {name:"mitrewebTemplate", compileDebug: false});

// Maybe you want to compile all of your templates to a templates.js file and serve it to the client
fs.writeFileSync("public/js/advisory.js", advisoryFunc +' ' + mitrewebFunc);