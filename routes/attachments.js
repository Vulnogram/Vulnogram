const express = require('express');
const csurf = require('csurf');
var csrfProtection = csurf();
const path = require('path');
const os = require('os');
const Busboy = require('busboy');
const fs = require('fs');
// input doc, opts

module.exports = function (Document, opts) {
    var router = express.Router();
    // SAVE a file.
    router.post('/:id(' + opts.idpattern + ')/file', csrfProtection, async function (req, res) {
        var fq = {};
        fq[opts.idpath] = req.params.id;
        var doc = await Document.findOne(fq);
        if (doc) {
            var fcount = 0;
            var comment;
            var busboy = new Busboy({
                headers: req.headers
            });
            busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
                if (fieldname == 'comment') {
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

                    w.on('finish', async function () {
                        var fileq = {};
                        fileq[opts.idpath] = req.params.id;
                        fileq['files.name'] = filename;
                        //console.log('Update query'+ JSON.stringify(fileq));
                        var [ftype, fsubtype] = mimetype ? mimetype.split('/', 2) : ['unknown', 'unknown'];
                        ; var nf = {
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
                        if (ret === null) {
                            var ret = await Document.findOneAndUpdate(fq, {
                                $push: {
                                    files: nf
                                }
                            }, {
                                new: true
                            }).exec();
                        }

                        if (x == (fcount - 1)) {
                            if (busboy._done) {
                                res.json({
                                    ok: '1',
                                    //flist: flist
                                })
                            } else {
                                busboy.on('finish', function () {
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

    //GET file contents
    router.get('/:id(' + opts.idpattern + ')/file/:filename',
        async function (req, res, next) {
            res.setHeader("Content-Security-Policy", "default-src 'none'; connect-src 'none'");
            return next();
        },
        express.static(path.join(opts.conf.files))
    );

    // delete file
    router.delete('/:id(' + opts.idpattern + ')/file/:filename', csrfProtection, async function (req, res) {
        var fq = {};
        fq[idpath] = req.params.id;
        try {
            var ret = await Document.update(fq, { $pull: { files: { name: req.params.filename } } });
            res.json({ ok: ret.ok, n: ret.n });
        } catch (e) {
            res.json(e);
        }
    });

    // file listing in JSON format
    router.get('/files/:id(' + opts.idpattern + ')',
        async function (req, res, next) {
            res.setHeader("Content-Security-Policy", "default-src 'none'; connect-src 'none'");
            return next();
        },

        async function (req, res) {
            var fq = {};
            fq[opts.idpath] = req.params.id;
            var doc = await Document.findOne(fq, { files: 1 });
            res.json(doc.files);
        });

    // Directory listing
    router.get('/:id(' + opts.idpattern + ')/file/', function (req, res) {

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

    return router;
}
