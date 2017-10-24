// Copyright (c) 2017 Chandan B N. All rights reserved.

const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('./conf');
const pbkdf2 = require('../lib/pbkdf2.js');

module.exports = function (passport) {
    // Local strategy
    passport.use(new LocalStrategy(function (username, password, done) {
        User.findOne({username: username}, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {
                    message: 'No user found'
                });
            }
            pbkdf2.compare(password, user.password, function (err, same) {
                if (err) throw err;
                if (same) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Wrong password'
                    });
                }
            });
        });
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};