// Copyright (c) 2017 Chandan B N. All rights reserved.

const crypto = require('crypto');

const saltBytes = 16;
const hashBytes = 32;
const iterations = 100599;
const digest = 'sha512';
const version = 1;
const encoding = 'base64';
module.exports = {
    hash: function (password, callback) {
        crypto.randomBytes(saltBytes, function (err, salt) {
            if (err) {
                return callback(err);
            }
            crypto.pbkdf2(password, salt, iterations, hashBytes, digest,
                function (err, hash) {
                    if (err) {
                        return callback(err);
                    }
                    var result = new Buffer(12 + hash.length + salt.length);
                    // save version (4bytes) + salt length (4bytes) + iteration count (4bytes) + salt + hash.
                    result.writeUInt32BE(version, 0, true);
                    result.writeUInt32BE(salt.length, 4, true);
                    result.writeUInt32BE(iterations, 8, true);
                    salt.copy(result, 12);
                    hash.copy(result, salt.length + 12);
                    callback(null, result.toString(encoding));
                });
        });
    },
    compare: function (password, shadow, callback) {
        if (password && shadow) {
            hash = Buffer.from(shadow, encoding);
            var version = hash.readUInt32BE(0);
            var saltBytes = hash.readUInt32BE(4);
            var hashBytes = hash.length - saltBytes - 12;
            var iterations = hash.readUInt32BE(8);
            var salt = hash.slice(12, saltBytes + 12);
            var hash = hash.toString('binary', saltBytes + 12);
            // verify the salt and hash against the password
            crypto.pbkdf2(password, salt, iterations, hashBytes, digest, function (err, verify) {
                if (err) {
                    return callback(err, false);
                }
                callback(null, verify.toString('binary') === hash);
            });
        } else {
            // empty passwords or empty shadow == no login!
            callback(null, false);
        }
    }
}