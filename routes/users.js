// Copyright (c) 2017 Chandan B N. All rights reserved.

// user management.

const express = require('express');
const protected = express.Router();
const public = express.Router();
const crypto = require('crypto');
const passport = require('passport');
const pbkdf2 = require('../lib/pbkdf2.js');
const User = require('../models/user');
const conf = require('../config/conf');
const csurf = require('csurf');
const {
    matchedData,
    check,
    validationResult
} = require('express-validator');

const validator = require('validator');
var csrfProtection = csurf();

// If admin allow edits, otherwise display user
protected.get('/profile/:id(' + conf.usernameRegex + ')?', csrfProtection, function (req, res) {
    var admin = false;
    if (req.user.priv == 0) {
        admin = true;
    }
    if (req.params.id) {
        User.findOne({
            username: req.params.id
        }, function (err, user) {
            if (user) {
                //if Admin or self then present edit form
                if (admin || req.user.username == req.params.id) {
                    res.render('users/edit', {
                        title: 'Update profile: ' + user.username,
                        profile: user,
                        admin: admin,
                        page: 'users',
                        csrfToken: req.csrfToken()
                    });
                } else {
                    res.render('users/view', {
                        title: 'Profile: ' + user.username,
                        profile: user,
                        admin: admin,
                        page: 'users',
                        csrfToken: req.csrfToken()
                    });
                }
            } else {
                req.flash('error', 'User id not found');
                if (admin) {
                    res.redirect('/users/profile');
                } else {
                    res.render('blank');
                }
            }
        });
    } else {
        if (admin) {
            //new user form
            res.render('users/edit', {
                title: 'Add new user',
                profile: {},
                page: 'users',
                admin: admin,
                csrfToken: req.csrfToken()
            });
        } else {
            req.flash('error', 'Only administrators can add new users');
            res.render('blank');
        }
    }
});

// Register or update an user
protected.post('/profile/:id(' + conf.usernameRegex + ')?', csrfProtection, [
    check('name')
        .trim()
        .isLength({
        min: 2,
        max: undefined
    })
        .withMessage('Name too short')
        .isLength({
        min: 0,
        max: 64
    })
        .withMessage('Name too long'),
    check('emoji')
        .trim()
        .isLength({
        min: 0,
        max: 8
    })
        .withMessage('Long Emoji strings are not allowed'),
    check('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .isLength({
        min: 2,
        max: 256
    })
        .withMessage('User email is invalid'),
    check('password')
        .custom((value, {
        req
    }) => value === req.body.password2)
        .withMessage('Passwords do not match'),
    check('group')
        .trim()
        .normalizeEmail()
        .custom((value, {
        req
    }) => {
        // validate group only if it is a privileged user
        // group email from unprivileged users will be ignored
        if ((req.user.priv != 0) || validator.isEmail(value)) {
            return true;
        }
        return false;
    })
        .withMessage('Group email is invalid'),
    check('username')
        .trim()
        .custom((value, {
        req
    }) => {
        // validate username if it is a privileged user
        // username from unprivileged users will be ignored
        if ((req.user.priv != 0) || validator.matches(value, /^[a-zA-Z0-9]{3,128}$/)) {
            return true;
        }
        req.body.username = "";
        return false;
    })
        .withMessage('Username is invalid'),
    check('username')
        .custom((value, {
        req
    }) => {
        return User.findOne({
            username: value
        }).then((user) => {
            if ((!req.params.id || req.params.id != value) && user) {
                throw new Error('this username is already in use');
                return false;
            } else {
                return true;
            }
        });
    }),
    check('priv')
        .custom((value, {
        req
    }) => {
        // validate username if it is a privileged user
        // username from unprivileged users will be ignored
        if ((req.user.priv != 0) || validator.isIn(value, [0, 1, 2])) {
            return true;
        }
        return false;
    })
        .withMessage('Privilege provided is invalid')
], function (req, res) {
    if (req.isAuthenticated()) {
        var admin = false;
        if (req.user.priv == 0) {
            admin = true;
        }
        let errors = validationResult(req);
        let updates = matchedData(req);

        if (!errors.isEmpty()) {
            for (var e of errors.array()) {
                req.flash('error', 'Error: ' + e.msg);
            }
            // todo, clear invalid username or change form action uri
            res.render('users/edit', {
                title: 'User ' + req.body.username,
                profile: req.body,
                admin: admin,
                page: 'users',
                csrfToken: req.csrfToken()
            });

            //res.redirect('/users/profile/'+req.user.username);
        } else {
            if (!admin) {
                updates.username = req.user.username;
                updates.priv = req.user.priv;
                updates.group = req.user.group;
            }
            let query = {
                username: updates.username
            };
            let updateOptions = {
                upsert: true,
                setDefaultsOnInsert: true
            };
            var updateResponse = function (err, doc) {
                if (err) {
                    req.flash('error', err);
                    res.redirect('/users/profile/' + updates.username);
                } else {
                    var msg = 'New user ' + updates.username + ' created';
                    if (doc) {
                        msg = 'Updated ' + updates.username;
                    }
                    req.flash('success', msg);
                    res.redirect('/users/profile/' + updates.username);
                }
            };
            if (updates.password) {
                pbkdf2.hash(updates.password, function (err, hash) {
                    if (err) {
                        console.error(err);
                    }
                    updates.password = hash;
                    User.findOneAndUpdate(query, updates, updateOptions, updateResponse);
                });
            } else {
                delete updates.password;
                User.findOneAndUpdate(query, updates, updateOptions, updateResponse);
            }
        }
    } else {
        req.flash('error', 'Aunthentication required!');
        res.redirect('/users/login');
    }
});

protected.get('/delete/:id(' + conf.usernameRegex + ')', csrfProtection, function (req, res) {
    req.flash('warning', 'Deleteing users is not yet implemented. Fow now users can be deleted in the backend database.');
    res.render('blank');
});

// Login form
public.get('/login', csrfProtection, function (req, res) {
    res.render('users/login', {
        title: 'Vulnogram',
        csrfToken: req.csrfToken()
    });
});

// Login process
public.post('/login', csrfProtection, function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: req.session.returnTo || '/cve',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout form
public.get('/logout', function (req, res) {
    req.logout(function(err){
        if(err) {
            return next(err);
        }
        req.session.returnTo = null;
        req.flash('success', 'You are logged out');
        res.redirect('/users/login');
    });
});


//List users
protected.get('/list', function (req, res) {
    if (req.isAuthenticated()) {
        User.find({}, [], {
            sort: {
                _id: 1
            }
        }, function (err, users) {
            if (err) {
                res.status(500).send('Error');
            } else {
                res.render('users/index', {
                    users: users,
                    page: 'users'
                });
            }
        });
    } else {

    }
});

protected.get('/list/json', function (req, res) {
    if (req.isAuthenticated()) {
        User.find({group:req.user.group}, ['username','name','emoji'], {
            sort: {
                username: 1
            }
        }, function (err, users) {
            if (err) {
                res.status(500).send('Error');
            } else {
                res.json({
                default: req.user.username,
                enum: users.map(function(u) { return u.username;}),
                options: {enum_titles: users.map(function(u){return u.name})
                }});
            }
        });
    } else {

    }
});
protected.get('/list/css', function (req, res) {
    if (req.isAuthenticated()) {
        User.find({group:req.user.group}, ['username','name','emoji'], {
            sort: {
                username: 1
            }
        }, function (err, users) {
            if (err) {
                res.status(500).send('Error');
            } else {
                res.setHeader('Content-Type', 'text/css');
                for(u of users) {
                    res.write('input[value="'+u.username+'"] + .lbl:before, #vgListTable span[title="'+u.username+'"]:before, .vguser[title="'+u.username+'"]:before {content: "' + u.emoji + ' ";}\n');
                }
                res.end();
            }
        });
    } else {

    }
});
module.exports = {
    public: public,
    protected: protected
};