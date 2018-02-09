// Copyright (c) 2018 Chandan B N. All rights reserved.

var fs = require('fs');

// go through default and custom configurations and return them.
module.exports = function (set) {
    result = {}
    for (submod of ['facet', 'router']) {
        var s = null;
        try {
            s = require.resolve(submod, {
                paths: ['custom/' + set, 'default/' + set]
            });
        } catch (e) {

        }
        if (s) {
            result[submod] = require(s);
        }
    }
    if (fs.existsSync('custom/' + set + '/schema.js')) {
        result.schema = 'custom/' + set + '/schema.js';
    } else if (fs.existsSync('default/' + set + '/schema.js')) {
        result.schema = 'default/' + set + '/schema.js';
    }
    for (template of ['list', 'edit', 'render']) {
        if (fs.existsSync('custom/' + set + '/' + template + '.pug')) {
            result[template] = '../custom/' + set + '/' + template;
        } else if (fs.existsSync('default/' + set + '/' + template + '.pug')) {
            result[template] = '../default/' + set + '/' + template;
        } else {
            result[template] = template
        }
    }
    return result;
}