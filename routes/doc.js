const express = require('express');
const fs = require('fs');
const ObjectID = require('mongodb').ObjectID;
const docModel = require('../models/doc');
const conf = require('../config/conf');
const querymw = require('../lib/querymw');
const package = require('../package.json');
const csurf = require('csurf');
var csrfProtection = csurf();
var querymen = require('querymen');
var qs = require('querystring');
const _ = require('lodash');
const path = require('path');
const mongoose = require('mongoose');

var queryMW;

module.exports = function (name, opts) {
    opts.schemaName = name;
    //todo make it configurable
    var idpath = opts.idpath = opts.facet.ID.path;
    if (undefined == opts.facet.ID.link) {
        opts.facet.ID.href = '/' + name + '/';
    }
    var jsonidpath = opts.jsonidpath = idpath.substr(5);
    var idpattern = opts.idpattern = opts.facet.ID.regex;
    //console.log('ID pattern' +idpattern);
    var project = {};
    var columns = [];
    var tabFacet = {};
    var bulkInput = {};
    var toIndex = {};
    var defaultSort = {};
    var lookups = [];
    var chartFacet = {
        count: [{
            $count: "total"
        }]
    };
    var chartCount = 0;

    for (key in opts.facet) {
        var options = opts.facet[key];
        //toIndex[options.path] = options.sort ? options.sort : 1;

        if (!options.hideColumn) {
            if (options.project) {
                project[key] = options.project;
            } else if (Array.isArray(options.path)) {
                project[key] = {
                    "$setUnion": [options.path.map(x => { return '$' + x })]
                }
            } else if (typeof options.path === 'string') {
                project[key] = '$' + options.path;
            } else if (Object.keys(options.path).length != 0) {
                project[key] = options.path;
            }
            columns.push(key);
        }
        if (options.tabs) {
            toIndex[options.path] = options.sort ? options.sort : 1;
            if (Array.isArray(options.pipeline)) {
                tabFacet[key] = options.pipeline;
            } else {
                tabFacet[key] = [{
                    $sortByCount: '$' + options.path
                }];
            }
            if (options.sort) {
                tabFacet[key].push({
                    $sort: {
                        _id: options.sort
                    }
                })
            }
        }
        if (options.chart) {
            chartCount++;
            toIndex[options.path] = options.sort ? options.sort : 1;
            if (Array.isArray(options.pipeline)) {
                chartFacet[key] = options.pipeline;
            } else {
                chartFacet[key] = [{
                    $sortByCount: '$' + options.path
                }];
            }
            if (options.sort) {
                chartFacet[key].push({
                    $sort: {
                        _id: options.sort
                    }
                })
            }
        }
        if (options.bulk) {
            if (options.enum) {
                bulkInput[key] = {
                    type: 'select',
                    enum: options.enum
                }
            } else {
                bulkInput[key] = {
                    type: 'input'
                }
            }
        }
        if (options.lookup) {
            //console.log('OL:'+JSON.stringify(options.lookup));
            lookups = lookups.concat(options.lookup);
        }
    }

    queryMW = querymw(opts.facet);

    var module = {};
    var Document = module.Document = docModel(name);

    //console.log(toIndex);
    for (var x in toIndex) {
        var o = {};
        o[x] = toIndex[x];
        delete o.createIndex;
        Document.collection.createIndex(o, { background: true }).catch(function(e){
            console.log('Error ensuring text index: ' + e.message)
        });
            
    }


    var router;
    if (opts.router) {
        router = opts.router;
    } else {
        router = express.Router();
    }

    router.get('*', function (req, res, next) {
        res.locals.schemaName = name;
        res.locals.page = req.baseUrl + req.path;
        next();
    });






    router.get('/json/:id', function (req, res) {
        var ids = req.params.id.match(RegExp(idpattern, 'img'));
        if (ids) {
            var searchSchema = Document;
            var q = {};
            q[idpath] = {
                "$in": ids
            };
            searchSchema.find(q, {
                //body: 1,
                _id: 0
            }, {}, function (err, docs) {
                if (err) {
                    res.json({
                        title: 'Error',
                        message: 'Query failed',
                        docs: []
                    });
                } else {
                    res.json(docs);
                }
            });
        } else {
            res.json([]);
        }
    });
    router.post('/json/', async function (req, res) {
        if (req.body.ids && req.body.ids.length > 0) {
            //console.log('REQ: ' + JSON.stringify(req.body.ids));
            var q = {};
            q[idpath] = {
                "$in": req.body.ids
            };
            var fields = {
                _id: 0
            };
            if (req.body.fields && req.body.fields.length > 0) {
                for (var f of req.body.fields) {
                    fields[f] = 1;
                }
            }
            var results = await Document.find(q, fields);
            res.json(results);
        } else {
            res.json([]);
        }
    });




    /*
        router.get('/comment/:id(' + idpattern + ')', async function (req, res) {
            var q = {};
            q[idpath] = req.params.id;
            var ret = await Document.findOne(q, {comments: 1}).exec();
            var emails = await Document.db.collection('mails').find({'$text':{'$search': '"' + req.params.id + '"'}},{'author':1,'subject':1,'body':1,'html':1,'createdAt':1,_id:0}).toArray();
            //res.json(ret ? ret.comments.sort(function(a, b) {return a.createdAt < b.createdAt;}) : []);
            //console.log(emails);
            res.json(unified);
        });
    */

    /*
    replaced with lodash get
        var deep_value = function (obj, path) {
            var ret = obj;
            for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
                ret = ret[path[i]];
                if (ret === undefined) {
                    break;
                }
            };
            //console.log(' = ' + ret);
            return ret;
        };
       */


    router.get('/list/',
        queryMW,
        async function (req, res) {
            var r = await Document.aggregate([
                { $match: req.querymen.query },
                { $project: project }
            ]);
            res.json(r);
        });

    router.get('/:t(examples|enum)/',
        queryMW,
        async function (req, res) {
            //console.log(JSON.stringify(req.querymen.query));
            var r = await Document.find(req.querymen.query).distinct(req.query.field);
            var ret = {};
            ret[req.params.t] = r;
            res.json(ret);
        });

    router.get('/agg/',
        queryMW,
        async function (req, res) {
            if (req.query.f) {
                var f = req.query.f;
                if (!Array.isArray(f)) {
                    f = [f];
                }

                var pipeLine = normalizeQuery(req.querymen.query);
                var prj = {};
                for (var k of f) {
                    var options = opts.facet[k];
                    if (options) {
                        if (Array.isArray(options.path)) {
                            prj[k] = { "$setUnion": [options.path.map(x => { return '$' + x })] }
                        } else if (typeof options.path === 'string') {
                            prj[k] = '$' + options.path;
                        } else if (Object.keys(options.path).length != 0) {
                            prj[k] = options.path;
                        }
                    }
                }
                if (Object.keys(prj).length > 0) {

                    var g = {},
                        gg = {},
                        sor = {};

                    if (typeof f !== 'string' && f.length == 1) {
                        g = '$' + f[0];
                    } else {
                        for (var k of f) {
                            g[k] = '$' + k;
                            sor[k] = 1;
                            gg[k] = '$_id.' + k;
                        }
                    }

                    pipeLine = pipeLine.concat([{
                        $project: prj
                    },
                    {
                        $group: {
                            _id: g,
                            t: {
                                $sum: 1
                            }
                        }
                    }
                    ]);
                    gg.t = '$t';
                    if (f[1] && !req.query.ungroup) {
                        var s = {};
                        s["_id." + f[1]] = 1;
                        pipeLine.push({
                            $sort: s
                        });
                        delete gg[f[0]];
                        pipeLine.push({
                            $group: {
                                _id: '$_id.' + f[0],
                                t: {
                                    $sum: '$t'
                                },
                                items: {
                                    $push: gg
                                }
                            }
                        })
                    }

                    if (req.querymen.cursor.sort) {
                        pipeLine.push({
                            $sort: {
                                '_id': 1
                            }
                        })
                    }
                    //console.log('pipeLine:' + JSON.stringify(pipeLine,2,2,2));
                    var ret = await Document.aggregate(pipeLine);

                    res.json(ret);
                } else {
                    res.json([{ "_id": "Error: Wrong field specification", "t": 404 }]);
                }
            } else {
                res.json([]);
            }
        });
    function normalizeQuery(q) {
        //console.log('GOT' + JSON.stringify(q,2,2,2));
        var pipeLine = [];
        if (q['$text']) {
            if (q['$text']['$in']) {
                var terms = "";
                for (var term of q['$text']['$in']) {
                    terms = terms + ' ' + term;
                }
                delete q['$text']['$in'];
                q['$text']['$search'] = terms;
            }
            if (q['$text']['$search']) {
                var ids = q['$text']['$search'].match(RegExp(idpattern, 'img'));
                if (ids && ids.length) {
                    var idq = {};
                    q[idpath] = { "$in": ids }
                    delete q['$text'];
                }
            }
        }
        // Translate queries for empty strings to match any of "", null, non-existant.
        for (var p in q) {
            if (q[p] && q[p]['$in'] && q[p]['$in'].includes('null')) {
                q[p]['$in'].push("");
                q[p]['$in'].push(null);
            }
            if (q[p] === '') {
                q[p] =
                {
                    "$not": {
                        "$exists": true,
                        "$nin": ['', null]
                    }
                };
                //{"$not":{"$exists": true, $ne: ""}}
                //q[p] = {"$in":["",null]};
            }
            if (q[p] === 'null') {
                //req.querymen.query[q] = {"$exists": false}
                q[p] = { "$in": ["", null] }
            }
        }
        var lookups = {};
        if (Array.isArray(opts.conf.lookup) && opts.conf.lookup.length > 0) {
            var lookupAsNames = {};
            for (var l of opts.conf.lookup) {
                lookupAsNames[l.$lookup.as] = true;
            }
            for (var p in q) {
                var a = p.split('.', 1)[0];
                if (lookupAsNames[a]) {
                    lookups[p] = q[p];
                    delete q[p];
                }
            }
            pipeLine = pipeLine.concat(opts.conf.lookup)
            if (Object.keys(lookups).length != 0) {
                pipeLine.push({ "$match": lookups });
            }
        }
        pipeLine.unshift({ "$match": q });
        //console.log('PIPEline' + JSON.stringify(pipeLine,2,2,2));
        return pipeLine;
    };
    /* The Main listing routine */
    router.get('/', csrfProtection, queryMW, async function (req, res) {
        try {

            var pipeLine = normalizeQuery(req.querymen.query);
            // to get the documents
            // get top level tabs aggregated counts
            var tabs = [];
            if (Object.keys(tabFacet).length != 0) {
                //console.log('QUERY:' + JSON.stringify(req.querymen.query,2,3,4));
                tabs = await Document.aggregate([{
                    $facet: tabFacet
                }]).exec();
            }

            // get the charts aggregated counts            
            var sort = {};
            if (req.querymen.cursor.sort) {
                for (var s in req.querymen.cursor.sort) {
                    if (opts.facet[s] && opts.facet[s].path) {
                        sort[opts.facet[s].path] = req.querymen.cursor.sort[s];
                    }
                }
            }

            var allQuery = [];
            if (opts.conf.unwind) {
                allQuery = [opts.conf.unwind];
            }
            if ((Object.keys(sort).length != 0)) {
                allQuery.push({
                    $sort: sort
                });
            }
            allQuery = allQuery.concat([
                {
                    $skip: req.querymen.cursor.skip
                },
                {
                    $limit: req.querymen.cursor.limit
                },
                {
                    $project: project
                }
            ]);

            //console.log('AllQuery:' + JSON.stringify(allQuery,1,1,1));
            var docs = [];
            var charts = [];
            var total = 0;
            var numCollation = { locale: "en_US", numericOrdering: true };
            if (chartCount > 0) {
                chartFacet.all = allQuery;
                pipeLine.push({
                    $facet: chartFacet
                });
                var agg = Document.aggregate(pipeLine).collation(numCollation);
                charts = await agg.exec();
                //console.log('Aggregation QUERY: ' + JSON.stringify(pipeLine, null, 3));
                docs = charts[0].all;
                delete charts[0].all;
                if (charts[0] && charts[0].count && charts[0].count[0]) {
                    total = charts[0].count[0].total;
                }
                //console.log('Facet:' + JSON.stringify(charts,null,1))
                delete charts[0].count;
            } else {
                //console.log('PROJE' + JSON.stringify(project));
                total = await Document.countDocuments(req.querymen.query).exec();
                var aggQuery = [
                    {
                        $match: req.querymen.query
                    }].concat(allQuery);
                //console.log('AGG QUERY' + JSON.stringify(aggQuery,1,1,1));
                docs = await Document.
                    aggregate(aggQuery).collation(numCollation).exec();
                //total = docs.length;
            }
            //console.log('Results'+ JSON.stringify(docs,1,1,1));

            var currentPage = 1;
            if (req.query.page) {
                currentPage = req.query.page;
            }

            //console.log('GOT TOTAL ' + total);
            var pages = Math.ceil(total / req.querymen.cursor.limit);
            //console.log(' PAGES = ' + currentPage)
            //if(charts) {
            //console.log('FACET:' + JSON.stringify(chartFacet, null, 2));
            //}
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Cache-Control', 'no-store, must-revalidate, max-age=0');
            res.locals.renderStartTime = Date.now();
            res.render(opts.list, {
                title: (opts.conf ? opts.conf.title + ' - ' : '') + package.name,
                docs: docs,
                opts: opts,
           //     textUtil: textUtil,
                qs: qs,
                focustab: 0,
                facet: charts,
                tfacet: tabs,
                fields: opts.facet,
                query: req.query,
                limit: req.querymen.cursor.limit,
                pages: pages,
                total: total,
                columns: columns,
                current: currentPage,
                csrfToken: req.csrfToken(),
                bulkInput: bulkInput
            });

        } catch (err) {
            //req.flash('error', err);
            res.render('blank', {
                title: 'Error',
                message: 'failed. ' + err.message
            });

        }
    });

    var onedoc = require('./onedoc')(Document, opts);
    var History = mongoose.models[opts.schemaName + '_history'] || docModel(opts.schemaName + '_history');
    //UPDATE many
    router.post('/update',
        csrfProtection,
        function (req, res, next) { req.query = req.body; next(); },
        queryMW,
        async function (req, res) {
            try {
                var q = req.querymen.query;

                var f = q[idpath];
                if (f) {
                    delete q[idpath];
                    for (k in q) {
                        if (q[k] === "") {
                            delete q[k]
                        }
                    }
                    if (Object.keys(q).length != 0) {

                        var d = new Date();
                        q.author = req.user.username;
                        q.updatedAt = d;
                        //console.log(q);
                        var fq = {};
                        fq[idpath] = f;
                        var docs = await Document.find(fq);
                        console.log(['Bulkd', Document])
                        var results = [];
                        for (var d of docs) {
                            var result = await Document.findByIdAndUpdate(
                                d._id, {
                                "$set": q,
                                "$inc": {
                                    __v: 1
                                }
                            }, {
                                "upsert": false,
                                "new": true
                            });
                            var r = onedoc.addModelHistory(History, d, result);
                            if (r) {
                                r.__v = r.__v + ' (' + _.get(result, idpath) + ')';
                                results.push(r);
                            }
                        }
                        res.render('changes', {
                            //textUtil: textUtil,
                            title: 'Bulk update results',
                            docs: results
                        });
                    } else {
                        res.render('blank', {
                            title: 'Error',
                            message: 'Error: No updates specified! Please select fields and values to update.'
                        });
                    }
                } else {
                    res.render('blank', {
                        title: 'Error',
                        message: 'Error: No items selected. Please select one or more items to update'
                    });
                }
            } catch (err) {
                req.flash('error', err);
                res.render('blank', {
                    title: 'Error',
                    message: 'failed bulk updates: ' + err.message
                });
            }
        });
    router.get('/render.js', function (req, res) {
        res.compile(opts.render, { cache: true });
    });

    if (opts.static) {
        //console.log('PATH: ' + path.join(__dirname, '/../', opts.static));
        router.use('/static', express.static(path.join(__dirname, '/../', opts.static)));
    }
    // ToDo eliminate, as it can be embedded
    if (opts.schema) {
        //console.log('PATH: ' + path.join(__dirname, '/../', opts.schema));
        //router.use('/schema.js', express.static(path.join(__dirname, '/../', opts.schema)));
        router.use('/schema.js', function (req, res) {
            res.setHeader('content-type', 'text/javascript');
            res.send('docSchema = ' + JSON.stringify(opts.schema));
        });
    }

    var comments = require('./comments');
    router.use(onedoc.router);
    if (opts.conf.files) {
        var attachment = require('./attachments');
        router.use(attachment(Document, opts));
    }
    router.use(comments(Document, opts));

    module.router = router;
    return module;
}