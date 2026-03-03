// Copyright (c) 2018 Chandan B N. All rights reserved.

var fs = require('fs');
var extend = require('extend');
var path = require('path');

// go through default and custom configurations and return them.
module.exports = function (setName, paths) {
    var result  = {
        list: 'list',
        edit: 'edit',
        render: 'render'
    };
    var conf = {};
    var projectRoot = path.resolve(__dirname, '..');
    if (!paths) 
        paths = ['default','custom'];
    for (var i = 0; i < paths.length; i++) {
        var basePath = paths[i];
        var setDir = path.join(projectRoot, basePath, setName);
        if (fs.existsSync(path.join(setDir, 'conf.js'))) {
            var temp = require(path.join(setDir, 'conf.js'));
            conf = extend(true, conf, temp);
        }
        if (fs.existsSync(path.join(setDir, 'static'))) {
            result.static = basePath + '/' + setName + '/static';
        }
        if (!conf.style && fs.existsSync(path.join(setDir, 'style.css'))) {
            result.style = fs.readFileSync(path.join(setDir, 'style.css'), 'utf8');
        }
        if (!conf.script && fs.existsSync(path.join(setDir, 'script.js'))) {
            result.script = (result.script ? result.script : '') + fs.readFileSync(path.join(setDir, 'script.js'), { encoding: 'utf8' });
        }
        for (var template of ['list', 'edit', 'render']) {
            if (fs.existsSync(path.join(setDir, template + '.pug'))) {
                result[template] = '../' + basePath + '/' + setName + '/' + template;
            }
        }
    }
    var ret = extend(conf, result);
    //TODO: merge old script object with new file
    return ret;
}
