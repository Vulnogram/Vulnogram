const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const ObjectID = require('mongodb').ObjectID;
const docModel = require('../models/doc');
const textUtil = require('../public/js/util.js');
const conf = require('../config/conf');
const package = require('../package.json');
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

module.exports = function (name, opts) {
    //todo make it configurable
    var idpath = opts.facet.ID.path;
    if(undefined == opts.facet.ID.link) {
        opts.facet.ID.href = '/' +name+ '/';
    }
    var jsonidpath = idpath.substr(5);
    var idpattern = opts.facet.ID.regex;
    //idpath, idpattern, querySchema, facetSchema, qProject, tFacet) {
    var queryDef = {
        q: {
            normalize: false,
            type: [String],
            default: null,
            escape: true,
            paths: ["$text"],
            operator: "$search",
            /*formatter: function (txt, v, p) {
                return v.replace(/([A-Z]+-[0-9A-Za-z-]+)/g, "\"$1\"");
            }*/

        },
        sort: {
            default: 'ID'
        },
        limit: {
            default: 100,
            max: 22000
        }
    };
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
        queryDef[key] = {
            type: [String],
            paths: [options.path]
        }
        if (options.type) {
            queryDef[key].type = options.type;
        }
        if (options.hasOwnProperty('default')) {
            queryDef[key].default = options.default;
        }
        if (options.queryOperator) {
            queryDef[key].operator = options.queryOperator;
        }
        if (!options.hideColumn) {
            if (Array.isArray(options.path)) {
                project[key] = { "$setUnion": [options.path.map(x => {return '$' + x})]
                               }
            } else if (typeof options.path === 'string') {
                project[key] = '$' + options.path;
            } else if(Object.keys(options.path).length != 0) {
                project[key] = options.path;
            }
            columns.push(key);
        }
        if(options.sortDefault) {
            queryDef.sort.default = options.sortDefault;
        }
        //toIndex[options.path] = options.sort ? options.sort : 1;
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
        if(options.bulk) {
            if(options.enum) {
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
        if(options.lookup) {
            //console.log('OL:'+JSON.stringify(options.lookup));
            lookups = lookups.concat(options.lookup);
        }
    }

    function phraseSplit(searchString) {
        var s1 = searchString.match(/\\?.|^$/g).reduce((p, c) => {
        if(c === '"'){
            p.quote ^= 1;
        }else if(!p.quote && c === ' '){
            p.a.push('');
        }else{
            p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
        }
        return  p;
    }, {a: ['']}).a;
        return(s1);
    }
    
    var qSchema = new querymen.Schema(queryDef);
    
    qSchema.formatter('escape', function (escape, value, param) {
        var r = [];
        if (escape) {
            if(typeof value == 'string') {
                r = phraseSplit(value);
            } else if (Array.isArray(value)) {
                for(v in value) {
                    r.push(v.phraseSplit(value));
                }
            }
        }
        var terms = "";
        for(var term of r) {
            terms = terms + ' "' + term + '" ';
        }
        return terms;
    });
/*    qSchema.formatter('nullify', function(escape, value, param){
        console.log("NULLIFY CALLED!");
        if (value === "null") {
            return {$exists:false};
        }
    });
    if(opts.facet.severity) {
        qSchema.param('severity').option('nullify', true);
    }*/
    qSchema.param('q').option('escape', true);


    var module = {};
    var Document = module.Document = docModel(name);
    var History = module.History = docModel(name + '_history');
    //console.log(toIndex);
    for(var x in toIndex) {
        var o = {};
        o[x] = toIndex[x];
        delete o.createIndex;
        //console.log(name + ' createIndex('+JSON.stringify(o)+')');
        Document.collection.createIndex(o, {background: true});
    }
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
        return;
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
        if(auditTrail.body.patch.length > 0) {
            History.bulkWrite([{
                insertOne: {
                    document: auditTrail
                }
            }], function (err, d) {
                if (err) {
                    console.log('Error: saving history ' + err);
                } else {
                }
            });
            return auditTrail;
        } else {
            return null;
        }
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
    
/*    if (opts.style) {
        //console.log('PATH: ' + path.join(__dirname, '/../', opts.schema));
        router.use('/style.css', express.static(path.join(__dirname, '/../', opts.style)));
    }*/
    // ToDo eliminate, as it can be embedded
    if (opts.schema) {
        //console.log('PATH: ' + path.join(__dirname, '/../', opts.schema));
        //router.use('/schema.js', express.static(path.join(__dirname, '/../', opts.schema)));
        router.use('/schema.js', function(req, res){
            res.send('docSchema = ' + JSON.stringify(opts.schema));
        });
    }

    router.get('/render.js', function (req, res) {
        res.compile(opts.render, {cache: true});
    });

    if (!opts.conf.readonly) {
        router.get('/new', csrfProtection, function (req, res) {
            res.render(opts.edit, {
                title: 'New',
                doc: null,
                opts: opts,
                idpath: jsonidpath,
                textUtil: textUtil,
                csrfToken: req.csrfToken(),
                allowAjax: true
            });
        });
    }

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
            if(req.body.fields && req.body.fields.length > 0) {
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
        .withMessage('Document ID not valid. Expecting ' + idpattern);

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
    var matchingEmail = async function (doc_id) {
        try{
        return await Document.db.collection('mails').find({
            '$text': {
                '$search': '"' + doc_id + '"'
            }
        }, {
            'author': 1,
            'subject': 1,
            'hypertext': 1,
           // 'html': 1,
            'createdAt': 1,
            _id: 1
        }).toArray();
        } catch(e) {
            return [];
        }
    };
    var unifiedComments = async function(doc_id, comments) {
        var emails = null;
        //var emails = await matchingEmail(doc_id);
        //console.log('GOT emails' + emails);
        var u = [];
        if(emails) {
            u = u.concat(emails);
        }
        if(comments) {
            u = u.concat(comments);
        }
        u.sort(function(a, b) {return b.createdAt - a.createdAt;});
        return u;
    }
    var addComment = async function (doc_id, username, text, parent_slug) {
        try {

            //var posted = new Date();
            var slug = random_slug();
            var q = {};
            q[idpath] = doc_id;
            //console.log('Commenting on ' + doc_id + ' q=' + JSON.stringify(q))
            var dt = new Date();
            var ret = await Document.findOneAndUpdate(
                q, {
                    $push: {
                        comments: {$each: [{
                            createdAt: dt,
                            updatedAt: dt,
                            author: username,
                            slug: slug,
                            hypertext: text,
                        }], $position: 0
                                  }
                    }
                }, {new: true}).exec();
            
            return ({
                    ok: 1,
                    ret: await unifiedComments(doc_id, ret ? ret.comments :[]),
            });            
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
            q['comments.slug'] = slug;
            q['comments.author'] = username;
            var ret = await Document.findOneAndUpdate(q, {
                '$set': {
                    "comments.$.hypertext": text,
                    "comments.$.updatedAt": date
                }
            }, {
                new: true
            }).exec();                 
            return ({
                    ok: 1,
                ret: await unifiedComments(doc_id, ret ? ret.comments : [])
            });
        } catch (e) {
            //console.log(e);
            return ({
                msg: e
            });
        }
    }

    router.post('/comment', csrfProtection, async function (req, res) {
        if (req.body.slug) {
            var r = await updateComment(req.body.id, req.user.username, req.body.text, req.body.slug, new Date());
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
            return (ret);
        } else {
            return {
                'message': 'No parent document'
            };
        }
    }
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
    router.get('/log/:id(' + idpattern + ')', function (req, res) {
        getSubDocs(History, req.params.id).then(r => {
            res.json(r);
        });
    });

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
    
    if(opts.conf.files) {
        router.post('/:id(' + idpattern + ')/file', csrfProtection, async function (req, res) {
            var fq = {};
            fq[idpath] = req.params.id;
            var doc = await Document.findOne(fq);
            if(doc) {
                var fcount = 0;
                var comment;
                var busboy = new Busboy({
                    headers: req.headers
                });
                busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
                    if (fieldname=='comment') {
                        comment = val;
                    }
                });
                busboy.on('file', async function (fieldname, file, filename, encoding, mimetype) {
                    var x = fcount++;
                    //console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype + ' COMMENT: '+ comment);
                    //var base = opts.conf.files;
                    var collectionDir = opts.conf.files; //path.join(base, req.baseUrl);
                    if (!fs.existsSync(collectionDir)) {
                        fs.mkdirSync(collectionDir);
                        //console.log(' Created collection dir' + collectionDir);
                    }
                    var docDir = path.join(collectionDir, req.params.id);
                    if (!fs.existsSync(docDir)) {
                        fs.mkdirSync(docDir);
                        //console.log(' Created Doc dir' + docDir);
                    }
                    docDir = path.join(docDir, 'file');
                    if (!fs.existsSync(docDir)) {
                        fs.mkdirSync(docDir);
                        //console.log(' Created Doc dir' + docDir);
                    }

                    var saveTo = path.join(docDir, path.basename(filename));
                    var pn = path.normalize(saveTo);
                    if (pn.startsWith(docDir)) {
                        var w = await file.pipe(fs.createWriteStream(pn));
                        
                        w.on('finish', async function(){
                            var fileq = {};
                            fileq[idpath] = req.params.id;
                            fileq['files.name'] = filename;
                            //console.log('Update query'+ JSON.stringify(fileq));
                            var [ftype, fsubtype] = mimetype ? mimetype.split('/',2) : ['unknown','unknown'];
;                            var nf = {
                                    "name": filename,
                                    "updatedAt": new Date(),
                                    "size": w.bytesWritten,
                                    "comment": comment,
                                    "user": req.user.username,
                                    "type": ftype,
                                    "subtype": fsubtype
                            };
                            var ret = await Document.findOneAndUpdate(fileq, {
                                '$set': {
                                    "files.$": nf
                                }
                            }, {
                                new: true
                            }).exec(); 
                            if(ret === null) {
                                var ret = await Document.findOneAndUpdate(fq, {
                                    $push: {
                                        files: nf
                                    }
                                }, {
                                    new: true
                                }).exec();
                            }
                            
                            if(x==(fcount-1)) {
                                if(busboy._done) {
                                    res.json({
                                        ok: '1',
                                        //flist: flist
                                    })
                                } else {
                                    busboy.on('finish', function(){
                                        res.json({
                                            ok: '1',
                                            //flist: flist
                                        })
                                    });
                                }
                            }
                        });
                    } else {
                        res.json({
                            ok: 0,
                            msg: 'Invalid file path!'
                        });
                    }
                });

                /*busboy.on('finish', function () {
                    res.json({
                        ok: '1',
                        //flist: flist
                    })
                });*/
                req.pipe(busboy);
            } else {
                res.json({
                        ok: 0,
                        msg: 'Document not found!'
                    });
            }
        });
        
        router.get('/:id(' + idpattern + ')/file/:filename',
            async function(req, res, next) {
                res.setHeader("Content-Security-Policy", "default-src 'none'; connect-src 'none'");
                return next();
            },                   
            express.static(path.join(opts.conf.files))
        );

        router.delete('/:id(' + idpattern + ')/file/:filename',async function (req, res) {
            var fq = {};
            fq[idpath] = req.params.id;
            try {
                var ret = await Document.update(fq,{$pull: {files: {name: req.params.filename}}});
                res.json({ok:ret.ok, n:ret.n});
            } catch(e) {
                res.json(e);
            }
        });
        
        router.get('/files/:id(' + idpattern + ')', 
                   async function(req, res, next) {
            res.setHeader("Content-Security-Policy", "default-src 'none'; connect-src 'none'");
                          return next();
                    },
                   
                   async function (req, res) {
            var fq = {};
            fq[idpath] = req.params.id;
            var doc = await Document.findOne(fq,{files:1});
            res.json(doc.files);
        });

        router.get('/:id(' + idpattern + ')/file/', function (req, res) {

            fs.readdir(path.join(opts.conf.files, req.params.id, '/file/'), function (err, items) {
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
    }
    router.post('/update', 
                csrfProtection, 
                function(req, res, next) {req.query=req.body; next();},
                querymen.middleware(qSchema),
                async function (req, res) {
        try {
            var q = req.querymen.query;
            
            var f = q[idpath];
            if(f) {
                delete q[idpath];
                for(k in q) {
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
                    var results = [];
                    for(var d of docs) {
                        var result = await Document.findAndModify({
                            _id: d._id
                        }, [], {
                            "$set": q,
                            "$inc": {
                                __v: 1
                            }
                        }, {
                            "upsert": false,
                            "new": true
                        });
                        var r = module.addHistory(d, result.value);
                        if(r) {
                            r.__v = r.__v + ' ('+deep_value(result.value, idpath)+')';
                            results.push(r);
                        }
                        //results.push(deep_value(result.value, idpath));
                    }
                    //console.log(results);
                    res.render('changes', {
                       // renderTemplate: 'changes',
                        textUtil: textUtil,
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
    //check if Document ID exists, insert, then redirect to Document ID page
    if (!opts.conf.readonly) {
        router.post(/\/(new)$/, csrfProtection, [checkID, existCheck], module.createDoc);

        // update or submit new Document ID 
        router.post('/:id(' + idpattern + ')', csrfProtection, [checkID], module.upsertDoc);

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
        // load Document editor form
    }

    router.get('/list/', 
               querymen.middleware(qSchema),
               async function (req, res) {
        var r = await Document.aggregate([
            { $match: req.querymen.query },
            { $project: project }
        ]);
        res.json(r);
    });

    router.get('/examples/', 
               querymen.middleware(qSchema),
               async function (req, res) {
        //console.log(JSON.stringify(req.querymen.query));
        var r = await Document.find(req.querymen.query).distinct(req.query.field);
        res.json({examples:r});
    });
    
    router.get('/agg/', 
               querymen.middleware(qSchema),
               async function (req, res) {
        if (req.query.f) {
        var f = req.query.f;
        if (!Array.isArray(f)) {
            f = [f];
        }

        var pipeLine = normalizeQuery(req.querymen.query);
            
        var prj = {};
        for(var k of f) {
            var options = opts.facet[k];
            if(options) {
                if (Array.isArray(options.path)) {
                    prj[k] = { "$setUnion": [options.path.map(x => {return '$' + x})] }
                } else if (typeof options.path === 'string') {
                    prj[k] = '$' + options.path;
                } else if(Object.keys(options.path).length != 0) {
                    prj[k] = options.path;
                }
            }
        }
        if (Object.keys(prj).length > 0) {

            var g = {},
                gg = {};
            if (f.length == 1) {
                g = '$' + f[0];
            } else {
                for (var k of f) {
                    g[k] = '$' + k;
                    gg[k] = '$_id.' + k;
                }
            }

            pipeLine = pipeLine.concat([{
                    $project: prj
            }, {
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
            res.json([{"_id":"Error: Wrong field specification","t":404}]);
        }
        } else {
            res.json([]);
        }
    });
    function normalizeQuery(q) {
        //console.log('GOT' + JSON.stringify(q,2,2,2));
        var pipeLine = [];
        if(q['$text']) {
            if (q['$text']['$in']) {
                var terms = "";
                for(var term of q['$text']['$in']) {
                            terms = terms + ' ' + term;
                }
                delete q['$text']['$in'];
                q['$text']['$search'] = terms;
            }
        }
        // Translate queries for empty strings to match any of "", null, non-existant.
        for(var p in q) {
            if(q[p] && q[p]['$in'] && q[p]['$in'].includes('null')) {
                q[p]['$in'].push("");
                q[p]['$in'].push(null);
            }
            if(q[p] === '') {
                q[p] = 
                    {"$not":{
                        "$exists": true,
                        "$nin": ['',null]
                        }
                    };
                    //{"$not":{"$exists": true, $ne: ""}}
                //q[p] = {"$in":["",null]};
            }
            if(q[p] === 'null') {
                //req.querymen.query[q] = {"$exists": false}
                q[p] = {"$in":["",null]}
            }
        }
        var lookups = {};        
        if (Array.isArray(opts.conf.lookup) && opts.conf.lookup.length > 0) {
            var lookupAsNames = {};
            for(var l of opts.conf.lookup) {
               lookupAsNames[l.$lookup.as]=true;
            }
            for(var p in q) {
                var a = p.split('.',1)[0];
                if (lookupAsNames[a]) {
                    lookups[p] = q[p];
                    delete q[p];
                }
            }
            pipeLine = pipeLine.concat(opts.conf.lookup)
            if(Object.keys(lookups).length != 0) {
                pipeLine.push({"$match": lookups});
            }
        }
        pipeLine.unshift({"$match": q});
        //console.log('PIPEline' + JSON.stringify(pipeLine,2,2,2));
        return pipeLine;
    };
    /* The Main listing routine */
    router.get('/', csrfProtection, querymen.middleware(qSchema), async function (req, res) {
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
            if(req.querymen.cursor.sort) {
                for(var s in req.querymen.cursor.sort) {
                    if(opts.facet[s] && opts.facet[s].path) {
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
            
            //console.log('SORT:' + JSON.stringify(sort,1,1,1));
            var docs = [];
            var charts = [];
            var total = 0;

            if (chartCount > 0) {
                chartFacet.all = allQuery;
                pipeLine.push({
                        $facet: chartFacet
                });
                var agg = Document.aggregate(pipeLine);
                charts = await agg.exec();
                //console.log('Aggregation QUERY: ' + JSON.stringify(aggQuery, null, 3));
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
                        $match : req.querymen.query
                    }].concat(allQuery);
                //console.log('AGG QUERY' + JSON.stringify(aggQuery,1,1,1));
                docs = await Document.
                aggregate(aggQuery).exec();
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
                textUtil: textUtil,
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

    //console.log('/:id(' + idpattern + ')');
    router.get('/:id(' + idpattern + ')', csrfProtection, function (req, res) {
        //console.log('Got GET ' + req.params.id);
        var q = {};
        q[idpath] = req.params.id;
        Document.findOne(q, async function (err, doc) {
            if (!doc) {
                req.flash('error', 'ID not found: ' + req.params.id);
                //console.log('GOT doc/' + idpath + req.params.id + doc);
            }
            var ucomments = await unifiedComments(req.params.id, doc ? doc.comments : []);
            res.locals.renderStartTime = Date.now();
            if(opts.conf.readonly) {
                if(doc && doc._doc) {
                  delete doc._doc._id;  
                } 
                //console.log('READONLY view');
                res.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'none'; font-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'");
                res.render((opts.render == 'render' ? 'readonly' : opts.render), {
                    title: req.params.id,
                    doc: doc ? doc._doc : {},
                    textUtil: textUtil,
                    doc_id: req.params.id,
                    csrfToken: req.csrfToken(),
                    renderTemplate: 'default',
                    ucomments: ucomments
                });
            } else {
                res.render(opts.edit, {
                    title: req.params.id,
                    opts: opts,
                    doc_id: req.params.id,
                    idpath: jsonidpath,
                    doc: doc,
                    textUtil: textUtil,
                    csrfToken: req.csrfToken(),
                    allowAjax: true,
                    ucomments: ucomments
                });
            }
        });
    });
    
    module.router = router;
    return module;
}