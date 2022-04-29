// Copyright (c) 2018 Chandan B N. All rights reserved.

var fs = require('fs');
var extend = require('extend');

// go through default and custom configurations and return them.
module.exports = function (setName, paths) {
    var result  = {
        list: 'list',
        edit: 'edit',
        render: 'render'
    };
    var conf = {};
    if (!paths) 
        paths = ['default','custom'];
    for (p in paths) {
        path=paths[p];
        if(fs.existsSync(path + '/' + setName + '/conf.js')) {
            var temp = require('../' + path + '/' + setName + '/conf.js');
            conf = extend(true, conf, temp);
        }
        if(!conf.style && fs.existsSync(path + '/' + setName + '/style.css')) {
            result.style = fs.readFileSync(path + '/' + setName + '/style.css', 'utf8');
        }
        for (template of ['list', 'edit', 'render']) {
            if (fs.existsSync(path + '/' + setName + '/' + template + '.pug')) {
                result[template] = '../' + path + '/' + setName + '/' + template;
            }
        }
    }
    return extend(conf, result);
}