const express = require('express');
const csurf = require('csurf');
var csrfProtection = csurf();
const textUtil = require('../public/js/util.js');
var jsonpatch = require('json-patch-extended');
var _ = require('lodash');
const docModel = require('../models/doc');
var History;

module.addHistory = function addHistory(oldDoc, newDoc) {
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
    if (auditTrail.body.patch.length > 0) {
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
const querymw = require('../lib/querymw');

const {
    check,
    validationResult
} = require('express-validator/check');
const {
    matchedData,
    sanitize
} = require('express-validator/filter');
const validator = require('validator');


module.exports = function (Document, opts) {
    History = module.History = docModel(opts.schemaName + '_history');
    var router = express.Router();
    var queryMW = querymw(opts.facet);
    if (!opts.conf.readonly) {
        router.get('/new', csrfProtection, queryMW, async function (req, res) {
            var doc = null;
            if (req.querymen.query[opts.idpath]) {
                var fq = {};
                fq[opts.idpath] = req.querymen.query[opts.idpath];
                var doc = await Document.findOne(fq);
            }
            if (doc) {
                res.redirect(req.querymen.query[opts.idpath]);
            } else {
                var doc = {};
                for (a in req.querymen.query) {
                    _.set(doc, a, req.querymen.query[a]);
                };
                //console.log(JSON.stringify(req.querymen.query));
                res.render(opts.edit, {
                    title: 'New',
                    doc: doc,
                    opts: opts,
                    idpath: opts.jsonidpath,
                    textUtil: textUtil,
                    csrfToken: req.csrfToken(),
                    allowAjax: true
                });
            }
        });
    }
    var checkID = module.checkID =
        check(opts.jsonidpath)
            .exists()
            .custom((val, {
                req
            }) => {
                if (validator.matches(val, '^' + opts.idpattern + '$')) {
                    return true;
                }
                return false;
            })
            .withMessage('Document ID not valid. Expecting ' + opts.idpattern);

    var existCheck = module.existCheck = check(opts.jsonidpath)
        .exists()
        .custom((val, {
            req
        }) => {
            var q = {};
            q[opts.idpath] = val;
            return Document.findOne(q).then((doc) => {
                if (doc) {
                    throw new Error('Document ' + val + ' exists. Save with a different ID or Update the existing one');
                    return false;
                } else {
                    return true;
                }
            });
        });



    // CREATE // DELETE
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
                    to: _.get(doc, opts.idpath)
                });
                return;
            }
        });
        return;
    };

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
        let inputID = _.get(req, opts.idpath);
        let entry = {
            "body": req.body,
            "author": req.user.username
        };
        let queryNewID = {};
        let queryOldID = {};
        queryNewID[opts.idpath] = inputID;
        queryOldID[opts.idpath] = req.params.id;
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
    if (!opts.conf.readonly) {
        router.post(/\/(new)$/, csrfProtection, [checkID, existCheck], module.createDoc);

        // update or submit new Document ID 
        router.post('/:id(' + opts.idpattern + ')', csrfProtection, [checkID], module.upsertDoc);

        router.delete('/:id(' + opts.idpattern + ')', csrfProtection, function (req, res) {
            let query = {};
            query[opts.idpath] = req.params.id;

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


    // GET

    var getSubDocs = async function (subSchema, doc_id) {
        var q = {}
        q[opts.idpath] = doc_id;
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
    router.get('/log/:id', [checkID], function (req, res) {
        getSubDocs(History, req.params.id).then(r => {
            res.json(r);
        });
    });
    router.get('/comment/:id', [checkID], function (req, res) {
        getSubDocs(History, req.params.id).then(r => {
            res.json(r);
        });
    });
    router.get('/:id', csrfProtection, [checkID], function (req, res) {

        //console.log('Got GET ' + req.params.id);
        var q = {};
        q[opts.idpath] = req.params.id;
        Document.findOne(q, async function (err, doc) {
            if (!doc) {
                req.flash('error', 'ID not found: ' + req.params.id);
                //console.log('GOT doc/' + idpath + req.params.id + doc);
            }
            var ucomments = doc.comments;//await unifiedComments(req.params.id, doc ? doc.comments : []);
            res.locals.renderStartTime = Date.now();
            if (opts.conf.readonly) {
                if (doc && doc._doc) {
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
                    idpath: opts.jsonidpath,
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