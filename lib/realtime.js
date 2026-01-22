const mongoose = require('mongoose');
const jsonpatch = require('json-patch-extended');
const docModel = require('../models/doc');

function getModel(name) {
    return mongoose.models[name] || docModel(name);
}

function addModelHistory(model, oldDoc, newDoc) {
    if (oldDoc === null) {
        oldDoc = {
            __v: -1,
            _id: newDoc._id,
            author: newDoc.author,
            updatedAt: newDoc.updatedAt,
            body: {}
        };
    }
    var patch = jsonpatch.compare(oldDoc.body || {}, newDoc.body || {});
    if (!patch.length) {
        return null;
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
            patch: patch
        }
    };
    model.bulkWrite([{
        insertOne: {
            document: auditTrail
        }
    }], function (err) {
        if (err) {
            console.log('Error: saving history ' + err);
        }
    });
    return auditTrail;
}

module.exports = function initRealtime(io, opts) {
    var conf = opts.conf || {};
    var confOpts = opts.confOpts || {};
    var sessionMiddleware = opts.sessionMiddleware;
    var passport = opts.passport;
    var realtimeConf = conf.realtime || {};
    var maxPatchBytes = realtimeConf.maxPatchBytes || 50000;
    var maxPatchOps = realtimeConf.maxPatchOps || 2000;
    var rateLimit = realtimeConf.rateLimit || { windowMs: 1000, max: 60 };

    function isAllowedCollection(collection) {
        return Object.prototype.hasOwnProperty.call(confOpts, collection);
    }

    function getDocConfig(collection) {
        if (!isAllowedCollection(collection)) {
            return null;
        }
        return confOpts[collection];
    }

    function buildRoom(collection, docId) {
        return 'doc:' + collection + ':' + docId;
    }

    function safeAck(ack, payload) {
        if (typeof ack === 'function') {
            ack(payload);
        }
    }

    function checkRateLimit(socket) {
        var now = Date.now();
        var rate = socket.data.realtimeRate || { count: 0, resetAt: now + rateLimit.windowMs };
        if (now > rate.resetAt) {
            rate.count = 0;
            rate.resetAt = now + rateLimit.windowMs;
        }
        rate.count += 1;
        socket.data.realtimeRate = rate;
        return rate.count <= rateLimit.max;
    }

    function emitViewerCount(room) {
        var roomInfo = io.sockets.adapter.rooms.get(room);
        var count = roomInfo ? roomInfo.size : 0;
        io.to(room).emit('doc:viewers', { count: count });
    }

    if (sessionMiddleware) {
        io.use(function (socket, next) {
            sessionMiddleware(socket.request, {}, next);
        });
    }
    if (passport) {
        io.use(function (socket, next) {
            passport.initialize()(socket.request, {}, next);
        });
        io.use(function (socket, next) {
            passport.session()(socket.request, {}, next);
        });
    }
    io.use(function (socket, next) {
        if (socket.request && socket.request.user) {
            socket.user = socket.request.user;
            return next();
        }
        return next(new Error('unauthorized'));
    });

    io.on('connection', function (socket) {
        socket.on('doc:join', async function (payload, ack) {
            try {
                if (!payload || !payload.collection || !payload.docId) {
                    safeAck(ack, { ok: false, reason: 'INVALID_REQUEST' });
                    return;
                }
                var collection = payload.collection;
                var docId = payload.docId;
                var cfg = getDocConfig(collection);
                if (!cfg) {
                    safeAck(ack, { ok: false, reason: 'INVALID_COLLECTION' });
                    return;
                }
                var idpattern = cfg.idpattern;
                if (idpattern && !(new RegExp('^' + idpattern + '$')).test(docId)) {
                    safeAck(ack, { ok: false, reason: 'INVALID_ID' });
                    return;
                }
                var room = buildRoom(collection, docId);
                if (socket.data.currentRoom && socket.data.currentRoom !== room) {
                    socket.leave(socket.data.currentRoom);
                    emitViewerCount(socket.data.currentRoom);
                }
                socket.data.currentRoom = room;

                var Document = getModel(collection);
                var query = {};
                var idpath = cfg.idpath || (cfg.facet && cfg.facet.ID ? cfg.facet.ID.path : null);
                if (!idpath) {
                    safeAck(ack, { ok: false, reason: 'INVALID_SCHEMA' });
                    return;
                }
                query[idpath] = docId;
                var doc = await Document.findOne(query, { body: 1, __v: 1 }).lean();
                if (!doc || !doc.body) {
                    safeAck(ack, { ok: false, reason: 'NOT_FOUND' });
                    return;
                }
                socket.join(room);
                emitViewerCount(room);
                safeAck(ack, { ok: true, doc: doc.body, version: doc.__v, viewers: (io.sockets.adapter.rooms.get(room) || new Set()).size });
            } catch (err) {
                safeAck(ack, { ok: false, reason: 'SERVER_ERROR' });
            }
        });

        socket.on('doc:patch', async function (payload, ack) {
            if (!checkRateLimit(socket)) {
                safeAck(ack, { ok: false, reason: 'RATE_LIMIT' });
                return;
            }
            try {
                if (!payload || !payload.collection || !payload.docId || !Array.isArray(payload.patch)) {
                    safeAck(ack, { ok: false, reason: 'INVALID_REQUEST' });
                    return;
                }
                if (payload.patch.length > maxPatchOps) {
                    safeAck(ack, { ok: false, reason: 'PATCH_TOO_LARGE' });
                    return;
                }
                var patchBytes = Buffer.byteLength(JSON.stringify(payload.patch), 'utf8');
                if (patchBytes > maxPatchBytes) {
                    safeAck(ack, { ok: false, reason: 'PATCH_TOO_LARGE' });
                    return;
                }

                var collection = payload.collection;
                var docId = payload.docId;
                var baseVersion = payload.baseVersion;
                var cfg = getDocConfig(collection);
                if (!cfg) {
                    safeAck(ack, { ok: false, reason: 'INVALID_COLLECTION' });
                    return;
                }
                if (cfg.conf && cfg.conf.readonly) {
                    safeAck(ack, { ok: false, reason: 'READONLY' });
                    return;
                }
                var idpattern = cfg.idpattern;
                if (idpattern && !(new RegExp('^' + idpattern + '$')).test(docId)) {
                    safeAck(ack, { ok: false, reason: 'INVALID_ID' });
                    return;
                }
                var Document = getModel(collection);
                var History = getModel(collection + '_history');
                var query = {};
                var idpath = cfg.idpath || (cfg.facet && cfg.facet.ID ? cfg.facet.ID.path : null);
                if (!idpath) {
                    safeAck(ack, { ok: false, reason: 'INVALID_SCHEMA' });
                    return;
                }
                query[idpath] = docId;
                var doc = await Document.findOne(query).lean();
                if (!doc || !doc.body) {
                    safeAck(ack, { ok: false, reason: 'NOT_FOUND' });
                    return;
                }
                if (typeof baseVersion !== 'number' || doc.__v !== baseVersion) {
                    safeAck(ack, { ok: false, reason: 'VERSION_MISMATCH', doc: doc.body, version: doc.__v });
                    return;
                }
                var validationError = jsonpatch.validate(payload.patch, doc.body);
                if (validationError) {
                    safeAck(ack, { ok: false, reason: 'PATCH_INVALID' });
                    return;
                }
                var nextBody = JSON.parse(JSON.stringify(doc.body));
                jsonpatch.apply(nextBody, payload.patch, true);

                var now = new Date();
                var update = {
                    body: nextBody,
                    author: socket.user ? socket.user.username : 'unknown',
                    updatedAt: now
                };
                var updated = await Document.findOneAndUpdate(
                    Object.assign({}, query, { __v: baseVersion }),
                    {
                        $set: update,
                        $inc: { __v: 1 },
                        $setOnInsert: { createdAt: now }
                    },
                    { new: true }
                );
                if (!updated) {
                    var latest = await Document.findOne(query).lean();
                    safeAck(ack, { ok: false, reason: 'VERSION_MISMATCH', doc: latest ? latest.body : {}, version: latest ? latest.__v : 0 });
                    return;
                }
                addModelHistory(History, doc, updated);

                var room = buildRoom(collection, docId);
                socket.to(room).emit('doc:patched', {
                    patch: payload.patch,
                    newVersion: updated.__v,
                    clientId: payload.clientId,
                    user: socket.user ? { username: socket.user.username, name: socket.user.name } : null
                });
                safeAck(ack, { ok: true, newVersion: updated.__v });
            } catch (err) {
                safeAck(ack, { ok: false, reason: 'SERVER_ERROR' });
            }
        });

        socket.on('disconnect', function () {
            if (socket.data.currentRoom) {
                var room = socket.data.currentRoom;
                setTimeout(function () {
                    emitViewerCount(room);
                }, 0);
            }
        });
    });
};
