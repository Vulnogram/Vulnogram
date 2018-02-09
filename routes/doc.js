const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const ObjectID = require('mongodb').ObjectID;
const docModel = require('../models/doc');
const optSet = require('../models/set');
const textUtil = require('../public/js/util.js');
const conf = require('../config/conf');
const csurf = require('csurf');
var csrfProtection = csurf();
var querymen = require('querymen');
var qs = require('querystring');
var jsonpatch = require('json-patch-extended');

const path = require('path');
const os = require('os');
const Busboy = require('busboy');

const {
    check,
    validationResult
} = require('express-validator/check');
const {
    matchedData,
    sanitize
} = require('express-validator/filter');
const validator = require('validator');

module.exports = function (name) {
    var opts = optSet(name);
    var idpath = opts.facet.ID.path;
    var jsonidpath = idpath.substr(5);
    var idpattern = opts.facet.ID.regex;
    //idpath, idpattern, querySchema, facetSchema, qProject, tFacet) {
    var queryDef = {
        q: {
            normalize: false,
            type: String,
            default: null,
            paths: ["$text"],
            operator: "$search",
            formatter: function (txt, v, p) {
                return v.replace(/([A-Z]+-[0-9A-Za-z-]+)/g, "\"$1\"");
            }

        },
        sort: {
            default: idpath
        },
        limit: {
            default: 200,
            max: 22000
        }
    };
    var project = {};
    var columns = [];
    var tabFacet = {};
    var chartFacet = {
        count: [{
            $count: "total"
        }]
    };
    for (key in opts.facet) {
        var options = opts.facet[key];
        queryDef[key] = {
            type: [String],
            paths: [options.path]
        }
        if (options.type) {
            queryDef[key].type = options.type;
        }
        if (options.queryOperator) {
            queryDef[key].operator = options.queryOperator;
        }
        if (!options.hideColumn) {
            project[key] = '$' + options.path;
            columns.push(key);
        }
        if (options.tabs) {
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
    }
    var qSchema = new querymen.Schema(queryDef);
    qSchema.formatter('escape', function (escape, value, param) {
        if (escape && value) {
            value = value.replace(/([A-Z]+-[0-9A-Za-z-]+)/g, "\"$1\"")
        }
        return value;
    });
    /*   qSchema.formatter('numeric', function(escape, value, param){
           if(escape && escape) {
               value = value.replace(/[^0-9-]/g, "");
           }
           return "^" + value;
       });*/
    qSchema.param('q').option('escape', true);


    var module = {};
    var Document = module.Document = docModel(name);
    var History = module.History = docModel(name + '_history');
    var Comment = module.Comment = docModel(name + '_comments');

    module.createDoc = function (req, res) {
        let errors = validationResult(req).array();
        if (errors.length > 0) {
            var msg = 'Error: ';
            for (var e of errors) {
                msg += e.param + ': ' + e.msg + ' ';
            }
            res.json({
                type: 'err',
                msg: msg
            });
            return;
        }

        let entry = new Document({
            "body": req.body,
            "author": req.user.username
        });
        entry.save(function (err, doc) {
            if (err) {
                res.json({
                    type: 'err',
                    msg: 'Error ' + err
                });
                return;
            } else {
                module.addHistory(null, doc);
                res.json({
                    type: 'go',
                    to: deep_value(doc, idpath)
                });
                return;
            }
        });
    };

    module.addHistory = function (oldDoc, newDoc) {

        if (oldDoc === null) {
            oldDoc = {
                __v: -1,
                _id: newDoc._id,
                author: newDoc.author,
                updatedAt: newDoc.updatedAt,
                body: {}
            }
        }
        var auditTrail = {
            parent_id: oldDoc._id,
            updatedAt: newDoc.updatedAt,
            author: newDoc.author,
            __v: oldDoc.__v + 1,
            body: {
                old_version: oldDoc.__v,
                old_author: oldDoc.author,
                old_date: oldDoc.updatedAt,
                patch: jsonpatch.compare(oldDoc.body, newDoc.body),
            },
        };
        //console.log(JSON.stringify(auditTrail));
        //todo: eliminate mongoose and call InsertOne directly
        History.bulkWrite([{
            insertOne: {
                document: auditTrail
            }
        }], function (err, d) {
            if (err) {
                console.log('Error: saving history ' + err);
            }
        });
    }
    module.upsertDoc = function (req, res) {
        let errors = validationResult(req).array();
        if (errors.length > 0) {
            var msg = 'Error: ';
            for (var e of errors) {
                msg += e.param + ': ' + e.msg + ' ';
            }
            res.json({
                type: 'err',
                msg: msg
            });
            return;
        }

        //let doc = req.body;
        let inputID = deep_value(req, idpath);
        let entry = {
            "body": req.body,
            "author": req.user.username
        };
        let queryNewID = {};
        let queryOldID = {};
        queryNewID[idpath] = inputID;
        queryOldID[idpath] = req.params.id;
        var renaming = (req.params.id != inputID);
        //console.log('req.params.id = ' + req.params.id + ' == ' + inputID)
        Document.findOne(queryNewID).then((existingDoc) => {
            if (existingDoc) {
                // check Document ID is being renamed.
                if (renaming) {
                    res.json({
                        type: 'err',
                        msg: 'Not saved. Document ' + inputID + ' exists. Save with a different ID or update the existing one.'
                    });
                    return;
                }
            }
            var d = new Date();
            newDoc = {
                body: req.body,
                author: req.user.username,
                updatedAt: d
            };
            Document.findAndModify(
                queryOldID, [], {
                    "$set": newDoc,
                    "$inc": {
                        __v: 1
                    },
                    "$setOnInsert": {
                        createdAt: d
                    }
                }, {
                    "upsert": true
                },
                function (err, doc) {
                    if (doc && doc.value) {
                        module.addHistory(doc.value, newDoc);
                    } else {
                        module.addHistory(null, newDoc);
                    }
                    if (err) {
                        res.json({
                            type: 'err',
                            msg: 'Error! Document not Updated, ' + err
                        });
                    } else {
                        if (renaming) {
                            res.json({
                                type: 'go',
                                to: inputID
                            });
                        } else {
                            res.json({
                                type: 'saved'
                            });
                        }
                    }
                    return;
                });
        });
        return;
    };
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

    router.get('/schema.js', function (req, res) {
        res.sendFile(path.join(__dirname, '/../', opts.schema));
    });

    router.get('/render.js', function (req, res) {
        res.compile(opts.render);
    });

    router.get('/new', csrfProtection, function (req, res) {
        res.render(opts.edit, {
            title: 'New',
            doc: null,
            idpath: jsonidpath,
            textUtil: textUtil,
            csrfToken: req.csrfToken()
        });
    });

    router.get('/json/:id/:ver([0-9]+)?', function (req, res) {
        var ids = req.params.id.match(RegExp(idpattern, 'img'));
        if (ids) {
            var searchSchema = Document;
            var q = {};
            q[idpath] = {
                "$in": ids
            };
            if (req.params.ver) {
                searchSchema = History;
                q.__v = req.params.ver + 0;
            }

            searchSchema.find(q, {
                body: 1,
                _id: 0
            }, {}, function (err, docs) {
                if (err) {
                    res.json({
                        title: 'Error',
                        message: 'Query failed',
                        docs: []
                    });
                } else {
                    res.json({
                        q: q,
                        ids: ids,
                        docs: docs
                    });
                }
            });
        } else {
            res.json({
                title: 'Error',
                message: 'No valid id'
            });
        }
    });

    var checkID = module.checkID =
        check(jsonidpath)
        .exists()
        .custom((val, {
            req
        }) => {
            if (validator.matches(val, '^' + idpattern + '$')) {
                return true;
            }
            return false;
        })
        .withMessage('Document ID not valid');

    var existCheck = module.existCheck = check(jsonidpath)
        .exists()
        .custom((val, {
            req
        }) => {
            var q = {};
            q[idpath] = val;
            return Document.findOne(q).then((doc) => {
                if (doc) {
                    throw new Error('Document ' + val + ' exists. Save with a different ID or Update the existing one');
                    return false;
                } else {
                    return true;
                }
            });
        });

    var random_slug = function () {
        return crypto.randomBytes(13).toString('base64').replace(/[\+\/\=]/g, '-');
    }

    var addComment = async function (doc_id, username, text, parent_slug) {
        try {

            //var posted = new Date();
            var slug = random_slug();
            var q = {};
            q[idpath] = doc_id;
            //console.log('Commenting on ' + doc_id + 'q=' + JSON.stringify(q))
            var commentDoc = await Document.findOne(q, {
                _id: 1
            }).exec();
            if (commentDoc && commentDoc._id) {
                var ret = await Comment.create({
                    doc_id: doc_id,
                    parent_id: ObjectID(commentDoc._id),
                    slug: slug,
                    author: username,
                    body: text
                });
                return ({
                    ok: 1
                });
            } else {
                return ({
                    msg: 'Error: No parent document found'
                });
            }
        } catch (e) {
            console.log(e);
            return ({
                msg: e
            });
        }
    }

    var updateComment = async function (doc_id, username, text, slug, date) {
        try {
            var q = {};
            q[idpath] = doc_id;
            //console.log('Commenting on ' + doc_id)
            parentDoc = await Document.findOne(q).exec();
            if (parentDoc && parentDoc._id) {
                //console.log('Updating on ' + commentDoc._id);
                var q = {
                    parent_id: parentDoc._id,
                    slug: slug //,
                    // createdAt: new ISODate(date);
                }
                var doc = await Comment.findOne(q).exec();
                //console.log('\nGot exisingt comment!' + doc + ' for querry ' + JSON.stringify(q));
                if (doc) {
                    doc.body = text;
                    ret = await doc.save();
                } else {
                    q.body = text;
                    q.doc_id = doc_id;
                    q.author = username;
                    ret = await Comment.create(q);
                }
                //console.log('Retunring '+ret);
                return ({
                    ok: 1
                });
            } else {
                return ({
                    msg: 'Error: No parent document'
                });
            }
        } catch (e) {
            //console.log(e);
            return ({
                msg: e
            });
        }
    }

    var getComment = async function (doc_id, slug) {
        var q = {};
        q[idpath] = doc_id;
        //console.log('getting comments for ' + doc_id )
        parentDoc = await Document.findOne(q).exec();
        if (parentDoc) {
            //console.log('getting comments for ' + commentDoc._id )
            var cq = {
                parent_id: parentDoc._id
            };
            if (slug) {
                cq.slug = slug;
            }
            var ret = await Comment.find(cq, {
                _id: 0,
                parent_id: 0
            }).exec();
            //console.log('returning ' + ret);
            return (ret);
        } else {
            return {
                'message': 'No parent document'
            };
        }
    }

    router.post('/comment', csrfProtection, async function (req, res) {
        if (req.body.slug) {
            var r = await updateComment(req.body.id, req.user.username, req.body.text, req.body.slug, req.body.date);
            //console.log('Sending: ' + r);
            res.json(r);
        } else {
            addComment(req.body.id, req.user.username, req.body.text).then(r => {
                res.json(r);
            })
        }
    });

    var getSubDocs = async function (subSchema, doc_id) {
        var q = {}
        q[idpath] = doc_id;
        //console.log('looking for ' + doc_id)
        parentDoc = await Document.findOne(q).exec();
        if (parentDoc) {
            var subq = {
                parent_id: parentDoc._id
            }
            var ret = await subSchema.find(subq, {
                _id: 0,
                parent_id: 0
            }).sort({
                updatedAt: -1
            }).exec();
            //console.log('returning ' + ret);
            return (ret);
        } else {
            return {
                'message': 'No parent document'
            };
        }
    }

    router.get('/comment/:id', function (req, res) {
        getSubDocs(Comment, req.params.id).then(r => {
            res.json(r);
        });
    });

    router.get('/log/:id', function (req, res) {
        getSubDocs(History, req.params.id).then(r => {
            res.json(r);
        });
    });

    var deep_value = function (obj, path) {
        //console.log(' need ' + path + ' from ' + obj);
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
    //check if Document ID exists, insert, then redirect to Document ID page
    router.post(/\/(new)$/, csrfProtection, [checkID, existCheck], module.createDoc);

    // update or submit new Document ID 
    router.post('/:id(' + idpattern + ')', csrfProtection, [checkID], module.upsertDoc);

    router.post('/:id(' + idpattern + ')/file', csrfProtection, function (req, res) {

        var busboy = new Busboy({
            headers: req.headers
        });
        busboy.on('file', async function (fieldname, file, filename, encoding, mimetype) {

            console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
            var base = '/tmp';
            var collectionDir = path.join(base, req.baseUrl);
            if (!fs.existsSync(collectionDir)) {
                fs.mkdirSync(collectionDir);
                console.log(' Created collection dir' + collectionDir);
            }
            var docDir = path.join(collectionDir, req.params.id);
            if (!fs.existsSync(docDir)) {
                fs.mkdirSync(docDir);
                console.log(' Created Doc dir' + docDir);
            }
            docDir = path.join(docDir, 'file');
            if (!fs.existsSync(docDir)) {
                fs.mkdirSync(docDir);
                console.log(' Created Doc dir' + docDir);
            }

            var saveTo = path.join(docDir, path.basename(filename));
            var pn = path.normalize(saveTo);
            if (pn.startsWith(docDir)) {
                file.pipe(fs.createWriteStream(pn));
            } else {
                res.json({
                    ok: 0,
                    msg: 'Invalid file path!'
                });
            }
        });

        busboy.on('finish', function () {
            res.json({
                ok: '1'
            })
        });
        req.pipe(busboy);
    });

    router.get('/:id(' + idpattern + ')/file/:filename',
        express.static(path.join('/tmp/sir/')));
    //    router.get('/:id(' + idpattern + ')/file/',
    //               serveIndex(path.join('/tmp/sir/'), {icons: true}));

    router.get('/:id(' + idpattern + ')/file/', function (req, res) {

        fs.readdir(path.join('/tmp/', req.baseUrl, req.params.id, 'file'), function (err, items) {
            res.render(opts.list, {
                title: req.params.id + ' files',
                docs: items ? items.map(x => {
                    return ({
                        'File': x,
                        'Filetype': x.substr(x.lastIndexOf('.') + 1)
                    })
                }) : [],
                columns: ['File', 'Filetype'],
                subtitle: 'Attachments for ' + req.params.id
            });
        });
    });


    // Delete post
    router.delete('/:id(' + idpattern + ')', csrfProtection, function (req, res) {
        let query = {};
        query[idpath] = req.params.id;

        Document.remove(query, function (err) {
            if (err) {
                res.send('Error Deleting');
                return;
            } else {
                res.send('Deleted');
            }
        });
    });

    // Home page/Index/Filter
    // Display a listing of Document IDs in the database
    // load Document editor form
    router.get('/:id(' + idpattern + ')', csrfProtection, function (req, res) {
        var q = {};
        q[idpath] = req.params.id;
        Document.findOne(q, function (err, doc) {
            //todo: if can't find it in the database, get from git repo
            if (!doc) {
                req.flash('error', 'ID not found: ' + req.params.id);
            }
            res.render(opts.edit, {
                title: req.params.id,
                doc_id: req.params.id,
                idpath: jsonidpath,
                doc: doc,
                textUtil: textUtil,
                csrfToken: req.csrfToken()
            });
        });
    });


    router.get('/', querymen.middleware(qSchema), async function (req, res) {
        try {

            chartFacet.all = [
                {
                    $project: project
            },
                {
                    $skip: req.querymen.cursor.skip
            },
                {
                    $limit: req.querymen.cursor.limit
            },
        ];

            //console.log('QUERY:' + JSON.stringify(req.querymen.query));
            var tabs = await Document.aggregate([{
                    $facet: tabFacet
            }
            ]).exec();

            var charts = await Document.aggregate([
                {
                    "$match": req.querymen.query
            },
                {
                    $sort: req.querymen.cursor.sort
            },
                {
                    $facet: chartFacet
            }
        ]).exec();

            var docs = charts[0].all;
            delete charts[0].all;

            var currentPage = 1;
            if (req.query.page) {
                currentPage = req.query.page;
            }
            var total = 0;
            if (charts[0] && charts[0].count && charts[0].count[0]) {
                total = charts[0].count[0].total;
            }

            delete charts[0].count;
            //console.log('GOT TOTAL ' + total);
            var pages = Math.ceil(total / req.querymen.cursor.limit);
            //console.log(' PAGES = ' + currentPage)
            //if(charts) {
            //console.log('FACET:' + JSON.stringify(chartFacet, null, 2));
            //}
            res.render(opts.list, {
                title: conf.appName,
                docs: docs,
                textUtil: textUtil,
                qs: qs,
                focustab: 0,
                facet: charts,
                tfacet: tabs,
                query: req.query,
                limit: req.querymen.cursor.limit,
                pages: pages,
                total: total,
                columns: columns,
                current: currentPage
            });

        } catch (err) {
            req.flash('error', err);
            res.render('blank', {
                title: 'Error',
                message: 'failed. ' + err.message
            });

        }
    });
    module.router = router;
    return module;
}