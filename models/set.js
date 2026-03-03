// Copyright (c) 2018 Chandan B N. All rights reserved.

var fs = require('fs');
var extend = require('extend');
var path = require('path');

function decodeJsonPointerToken(token) {
    return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

function resolveSchemaRef(root, ref) {
    if (!root || !ref || typeof ref !== 'string' || ref.indexOf('#/') !== 0) {
        return null;
    }
    var parts = ref.substring(2).split('/');
    var node = root;
    for (var i = 0; i < parts.length; i++) {
        var part = decodeJsonPointerToken(parts[i]);
        if (!node || typeof node !== 'object' || !Object.prototype.hasOwnProperty.call(node, part)) {
            return null;
        }
        node = node[part];
    }
    return node;
}

function uniqueObjects(items) {
    var out = [];
    for (var i = 0; i < items.length; i++) {
        if (out.indexOf(items[i]) === -1) {
            out.push(items[i]);
        }
    }
    return out;
}

function markSeen(seen, node) {
    if (typeof WeakSet !== 'undefined') {
        if (seen.has(node)) {
            return false;
        }
        seen.add(node);
        return true;
    }
    if (seen.indexOf(node) !== -1) {
        return false;
    }
    seen.push(node);
    return true;
}

function expandSchemaNodes(root, node, out, seen, depth) {
    if (!node || typeof node !== 'object' || depth > 32) {
        return;
    }
    if (!markSeen(seen, node)) {
        return;
    }
    out.push(node);
    if (typeof node.$ref === 'string') {
        var refNode = resolveSchemaRef(root, node.$ref);
        if (refNode) {
            expandSchemaNodes(root, refNode, out, seen, depth + 1);
        }
    }
    for (var key of ['allOf', 'anyOf', 'oneOf']) {
        if (Array.isArray(node[key])) {
            for (var i = 0; i < node[key].length; i++) {
                expandSchemaNodes(root, node[key][i], out, seen, depth + 1);
            }
        }
    }
}

function collectNextSchemaNodes(root, node, segment, out, seen, depth) {
    if (!node || typeof node !== 'object' || depth > 32) {
        return;
    }
    if (!markSeen(seen, node)) {
        return;
    }

    if (typeof node.$ref === 'string') {
        var refNode = resolveSchemaRef(root, node.$ref);
        if (refNode) {
            collectNextSchemaNodes(root, refNode, segment, out, seen, depth + 1);
        }
    }
    for (var key of ['allOf', 'anyOf', 'oneOf']) {
        if (Array.isArray(node[key])) {
            for (var i = 0; i < node[key].length; i++) {
                collectNextSchemaNodes(root, node[key][i], segment, out, seen, depth + 1);
            }
        }
    }

    if (node.properties && Object.prototype.hasOwnProperty.call(node.properties, segment)) {
        out.push(node.properties[segment]);
    }

    if (Array.isArray(node.items)) {
        for (var j = 0; j < node.items.length; j++) {
            collectNextSchemaNodes(root, node.items[j], segment, out, seen, depth + 1);
        }
    } else if (node.items && typeof node.items === 'object') {
        collectNextSchemaNodes(root, node.items, segment, out, seen, depth + 1);
    }

    if (node.additionalProperties && typeof node.additionalProperties === 'object') {
        collectNextSchemaNodes(root, node.additionalProperties, segment, out, seen, depth + 1);
    }
}

function resolveSchemaPathNodes(schema, facetPath) {
    if (!schema || typeof schema !== 'object' || typeof facetPath !== 'string' || facetPath.length === 0) {
        return [];
    }
    var parts = facetPath.split('.').filter(function (x) { return x !== ''; });
    if (parts.length > 0 && parts[0] === 'body') {
        parts.shift();
    }
    if (parts.length === 0) {
        return [];
    }

    var nodes = [schema];
    for (var i = 0; i < parts.length; i++) {
        var next = [];
        for (var j = 0; j < nodes.length; j++) {
            var seen = (typeof WeakSet !== 'undefined') ? new WeakSet() : [];
            collectNextSchemaNodes(schema, nodes[j], parts[i], next, seen, 0);
        }
        nodes = uniqueObjects(next);
        if (nodes.length === 0) {
            return [];
        }
    }
    return nodes;
}

function schemaNodesExpanded(root, nodes) {
    var expanded = [];
    for (var i = 0; i < nodes.length; i++) {
        var seen = (typeof WeakSet !== 'undefined') ? new WeakSet() : [];
        expandSchemaNodes(root, nodes[i], expanded, seen, 0);
    }
    return uniqueObjects(expanded);
}

function pickSchemaMetaValue(expandedNodes, getter) {
    for (var i = 0; i < expandedNodes.length; i++) {
        var value = getter(expandedNodes[i]);
        if (value !== undefined) {
            return value;
        }
    }
    return undefined;
}

function normalizeSchemaType(typeValue) {
    var selected = typeValue;
    if (Array.isArray(selected)) {
        selected = selected.filter(function (t) { return t && t !== 'null'; })[0];
    }
    switch (selected) {
        case 'number':
        case 'integer':
            return [Number];
        case 'boolean':
            return [Boolean];
        case 'string':
            return [String];
        default:
            return undefined;
    }
}

function extractVgiClass(className) {
    if (typeof className !== 'string') {
        return undefined;
    }
    var matches = className.match(/\bvgi-[^\s]+\b/g);
    if (!matches || matches.length === 0) {
        return undefined;
    }
    return matches[0];
}

function enrichFacetFromSchema(conf) {
    if (!conf || !conf.facet || !conf.schema) {
        return;
    }
    for (var key in conf.facet) {
        var facet = conf.facet[key];
        if (!facet || !(facet.chart || facet.tabs || facet.bulk) || typeof facet.path !== 'string') {
            continue;
        }

        var resolvedNodes = resolveSchemaPathNodes(conf.schema, facet.path);
        if (!resolvedNodes.length) {
            continue;
        }
        var expandedNodes = schemaNodesExpanded(conf.schema, resolvedNodes);
        if (!expandedNodes.length) {
            continue;
        }

        var schemaType = pickSchemaMetaValue(expandedNodes, function (n) { return n.type; });
        var mappedType = normalizeSchemaType(schemaType);
        if (mappedType !== undefined) {
            facet.type = mappedType;
        }
        var enumValue = pickSchemaMetaValue(expandedNodes, function (n) { return n.enum; });
        if (enumValue !== undefined) {
            facet.enum = enumValue;
        }
        var patternValue = pickSchemaMetaValue(expandedNodes, function (n) { return n.pattern; });
        if (patternValue !== undefined) {
            facet.pattern = patternValue;
        }
        var placeholderValue = pickSchemaMetaValue(expandedNodes, function (n) {
            return n.options && n.options.inputAttributes && n.options.inputAttributes.placeholder;
        });
        if (placeholderValue !== undefined) {
            facet.placeholder = placeholderValue;
        }
        var iconsValue = pickSchemaMetaValue(expandedNodes, function (n) {
            return n.options && n.options.icons;
        });
        if (iconsValue !== undefined) {
            facet.icons = iconsValue;
        }

        var classWithIcon = pickSchemaMetaValue(expandedNodes, function (n) {
            return n.options && n.options.class;
        });
        var vgiClass = extractVgiClass(classWithIcon);
        if (vgiClass) {
            facet.icon = vgiClass;
        }
    }
}

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
    enrichFacetFromSchema(conf);
    var ret = extend(conf, result);
    //TODO: merge old script object with new file
    return ret;
}
