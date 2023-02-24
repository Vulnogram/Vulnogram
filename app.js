// Copyright (c) 2017 Chandan B N. All rights reserved.

const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const https = require('https');
const pug = require('pug');
// TODO: don't use express-session for large-scale production use
const session = require('express-session');

const passport = require('passport');
const crypto = require('crypto');
const compress = require('compression');

const dotenv = require('dotenv').config()
if (dotenv.error) {
    console.log(".env was not loaded.");
}

const conf = require('./config/conf');
const optSet = require('./models/set');

if(!process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
}

mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);
mongoose.connect(conf.database, {
    keepAlive: true,
}).catch(function(e){
    console.log("Error"+e.message);
});
const db = mongoose.connection;

//Check connection
db.once('open', function () {
    console.log('Connected to MongoDB');
});

//Check for db errors
db.on('error', function (err) {
   console.error(err.message);
   console.error('Check mongodb connection URL configuration. Ensure Mongodb server is running!');
});

const app = express();

var RateLimit = require('express-rate-limit');
var limiter = new RateLimit({
  windowMs: 1*60*1000, // 1 minute
  max: 200
});
// apply rate limiter to all requests
app.use(limiter);

app.disable('x-powered-by');

// enable compression
app.use(compress());

app.set('env', 'production');
// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// make conf available for pug
app.locals.conf = conf;
app.locals.pugLib = pug;

// parse urlencoded forms
app.use(express.urlencoded({
    extended: true
}));

// parse application/json
app.use(express.json({limit:'16mb'}));

// serve files under public freely
app.use(express.static('public'));

// Express Session middleware
app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: true,
    saveUninitialized: false
}));

// Passport config
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

// Express Messages Middleware
// This shows error messages on the client
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.user = req.user || null;
    res.locals.startTime = Date.now();
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// add this to route for authenticating before certain requests.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.session.returnTo = req.originalUrl;
        res.redirect('/users/login')
    }
}

function ensureConnected(req, res, next) {
    if (mongoose.connection.readyState == 1) {
        return next();
    } else {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Database error! Ensure mongod is up and check the settings on the server.')
        res.status(500);
        res.render('splash', {
            title: 'Vulnogram'
        });
    }
}

app.use(ensureConnected);

//delete return redirect path
app.use(function (req, res, next) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader("Access-Control-Allow-Origin", "*");// XXX investigate
    res.setHeader("Access-Control-Request-Headers", "cve-api-cna,cve-api-secret,cve-api-submitter");

    if (req.path != '/users/login' && req.session.returnTo) {
        delete req.session.returnTo
    }
    next()
})

// set up routes
let users = require('./routes/users');
app.use('/users', users.public);
app.use('/users', ensureAuthenticated, users.protected);

let docs = require('./routes/doc');

app.locals.confOpts = {};

var sections = require('./models/sections.js')();

for(section of sections) {
    var s = optSet(section, ['default', 'custom']);
    //var s = conf.sections[section];
    if(s.facet && s.facet.ID) {
        app.locals.confOpts[section] = s;
        let r = docs(section, app.locals.confOpts[section]);
        app.use('/' + section, ensureAuthenticated, r.router);
    }
}

app.use('/home/stats', ensureAuthenticated, async function(req, res, next){
    var sections = [];
    for(section of conf.sections){
        var s = {};
        try {
            var s = await db.collection(section+'s').stats();
        } catch (e){

        };
        if (s === {}) {
        try {
            var s = await db.collection(section).stats();
        } catch (e){

        };
        };

        sections.push({
            name: section,
            items: s.count,
            size: s.size,
            avgSize: s.avgObjSize
        });
    }
    res.render('list',
    {
        docs: sections,
        columns: ['name', 'items', 'size', 'avgSize'],
        fields: {
            'name': {
                className: 'icn'
            }
        }
    })
});

app.use(function (req, res, next) {
    res.locals.confOpts = app.locals.confOpts;
    next();
});

//Configuring a reviewToken in conf file allows sharing drafts with 'people who have a link containing the configurable token'
let review = require('./routes/review');

if (review.public) {
    app.use('/review', express.static('public'));
    app.use('/review', review.public);
}

app.use('/review', ensureAuthenticated, review.protected);

if(conf.customRoutes) {
    for(r of conf.customRoutes) {
        app.use(r.path, require(r.route));
    }
}

app.get('/', function (req, res, next) {
    res.redirect(conf.homepage? conf.homepage : '/home');
});

if(conf.httpsOptions) {
    https.createServer(conf.httpsOptions, app).listen(conf.serverPort, conf.serverHost, function () {
        console.log('Server started at https://' + conf.serverHost + ':' + conf.serverPort);
    });
} else {
    app.listen(conf.serverPort, conf.serverHost, function () {
        console.log('Server started at http://' + conf.serverHost + ':' + conf.serverPort);
    });
}
