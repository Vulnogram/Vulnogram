// Copyright (c) 2017 Chandan B N. All rights reserved.

var fs = require('fs');
var pug = require('pug');
const conf = require ('./config/conf');

// Compile the template to a function string, for rendering a template on client side

var sa = fs.readFileSync('views/cves/'+ conf.advisoryTemplates +'/advisory.pug', "utf8");
var advisoryFunc = pug.compileClient(sa + "\n+page(locals)\n", {name: "advisoryTemplate", compileDebug: false});

var mitre = fs.readFileSync('views/cves/mitre.pug', "utf8");

var mitrewebFunc = pug.compileClient(mitre + "\n+page(locals)\n", {name:"mitrewebTemplate", compileDebug: false});

// Maybe you want to compile all of your templates to a templates.js file and serve it to the client
fs.writeFileSync("public/js/advisory.js", advisoryFunc +' ' + mitrewebFunc);
