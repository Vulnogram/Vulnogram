const express = require('express');
const csurf = require('csurf');
var csrfProtection = csurf();
const crypto = require('crypto');

var random_slug = function () {
    return crypto.randomBytes(13).toString('base64').replace(/[\+\/\=]/g, '-');
}

/*
* if integrated with email, it shows emails with the same ID in the subject line

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
};*/


// input doc, opts
module.exports = function (Document, opts) {

    var unifiedComments = async function (doc_id, comments) {
        var emails = null;
        //var emails = await matchingEmail(doc_id);
        //console.log('GOT emails' + emails);
        var u = [];
        if (emails) {
            u = u.concat(emails);
        }
        if (comments) {
            u = u.concat(comments);
        }
        u.sort(function (a, b) { return b.createdAt - a.createdAt; });
        return u;
    }

    var addComment = async function (doc_id, username, text, parent_slug) {
        try {

            //var posted = new Date();
            var slug = random_slug();
            var q = {};
            q[opts.idpath] = doc_id;
            //console.log('Commenting on ' + doc_id + ' q=' + JSON.stringify(q))
            var dt = new Date();
            var ret = await Document.findOneAndUpdate(
                q, {
                $push: {
                    comments: {
                        $each: [{
                            createdAt: dt,
                            updatedAt: dt,
                            author: username,
                            slug: slug,
                            hypertext: text,
                        }], $position: 0
                    }
                }
            }, { new: true }).exec();

            return ({
                ok: 1,
                ret: await unifiedComments(doc_id, ret ? ret.comments : []),
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
            q[opts.idpath] = doc_id;
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
    router = express.Router();
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
    return router;
}
