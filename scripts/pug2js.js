// Copyright (c) 2018 Chandan B N. All rights reserved.

var fs = require('fs');
var pug = require('pug');
const conf = require ('../config/conf');
var optSet = require('../models/set');
var cfc = pug.compileFileClient('views/subcontent.pug', {
    basedir: 'views',
    name: 'subdocRender',
    compileDebug: false,
    inlineRuntimeFunctions: true
});
fs.writeFileSync('public/js/subcontent.js', cfc);

for (section of conf.sections) {
    console.log('rendering ' + section);
    //var s = conf.sections[section];
    var opts = optSet(section);
    if (!opts.conf.readonly) {
        if (opts.render == 'render') {
            opts.render = '../views/render';
        }
        var pugRender = pug.compileFileClient(__dirname + '/' + opts.render + '.pug', {
            basedir: 'views',
            name: 'pugRender',
            compileDebug: false,
            inlineRuntimeFunctions: true
        });
        var jsDir = 'public/js/' + section;
        if (!fs.existsSync(jsDir)) {
            fs.mkdirSync(jsDir);
        }
        fs.writeFileSync('public/js/' + section + '/render.js', pugRender);
    }
}
