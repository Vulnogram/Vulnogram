// Copyright (c) 2018 Chandan B N. All rights reserved.

var fs = require('fs');
var pug = require('pug');
const conf = require ('../config/conf');
var optSet = require('../models/set');

for (setName of ['cve', 'sa', 'sir']) {
    var opts = optSet(setName);
    if (opts.render == 'render') {
        opts.render = '../views/render';
    }
    var pugRender = pug.compileFileClient(__dirname + '/' + opts.render + '.pug', {
        basedir: 'views',
        name: 'pugRender',
        compileDebug: false,
        inlineRuntimeFunctions: true
    });
    var jsDir = 'public/js/'+setName;
    if (!fs.existsSync(jsDir)) {
                fs.mkdirSync(jsDir); 
    }
    fs.writeFileSync('public/js/'+setName+ '/render.js', pugRender);
}
