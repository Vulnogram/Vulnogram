// Copyright (c) 2017 Chandan B N. All rights reserved.

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const flash = require('connect-flash');
const https = require('https');
const pug = require('pug');
// TODO: don't use express-session for large-scale production use
const session = require('express-session');

const passport = require('passport');
const crypto = require('crypto');
const compress = require('compression');

if (process.cwd() !== __dirname) {
    try {
        process.chdir(__dirname);
    } catch (err) {
        console.error('Failed to set working directory to app root:', err.message);
        process.exit(1);
    }
}

const dotenv = require('dotenv').config()
if (dotenv.error) {
    console.log(".env was not loaded.");
}

const conf = require('./config/conf');
const optSet = require('./models/set');
const mongo = require('./lib/mongo');

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
}

let db = null;

const app = express();

var rateLimit = require('express-rate-limit');
var limiter = rateLimit({
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
const useSecureCookie = process.env.VULNOGRAM_SECURE_COOKIE === 'true' || !!conf.httpsOptions;
if (process.env.VULNOGRAM_SECURE_COOKIE === 'true') {
    app.set('trust proxy', 1);
}
const sessionMiddleware = session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: useSecureCookie
    }
});
app.use(sessionMiddleware);

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
    if (mongo.isConnected()) {
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

async function bootstrap() {
    try {
        db = await mongo.connect(conf.database);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error(err.message);
        console.error('Check mongodb connection URL configuration. Ensure Mongodb server is running!');
        process.exit(1);
    }
    // set up routes
    let users = require('./routes/users');
    app.use('/users', users.public);
    app.use('/users', ensureAuthenticated, users.protected);

    let docs = require('./routes/doc');

    app.locals.confOpts = {};

    var sections = require('./models/sections.js')();

    for (var section of sections) {
        var s = optSet(section, ['default', 'custom']);
        //var s = conf.sections[section];
        if (s.facet && s.facet.ID) {
            app.locals.confOpts[section] = s;
            let r = docs(section, app.locals.confOpts[section]);
            app.use('/' + section, ensureAuthenticated, r.router);
        }
    }

    app.use('/home/stats', ensureAuthenticated, async function (req, res, next) {
        var sections = [];
        for (var section of conf.sections) {
            var s = {};
            var sectionOpts = app.locals.confOpts[section];
            var collectionName = sectionOpts && sectionOpts.conf && sectionOpts.conf.collectionName
                ? sectionOpts.conf.collectionName
                : section;
            try {
                s = await db.collection(collectionName).stats();
            } catch (e) {
            }

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

    if (conf.customRoutes) {
        for (var r of conf.customRoutes) {
            app.use(r.path, require(r.route));
        }
    }

    app.get('/', function (req, res, next) {
        res.redirect(conf.homepage ? conf.homepage : '/home');
    });

    const realtimeEnabled = !conf.realtime || conf.realtime.enabled !== false;
    const server = conf.httpsOptions ? https.createServer(conf.httpsOptions, app) : http.createServer(app);

    if (realtimeEnabled) {
        const { Server } = require('socket.io');
        const io = new Server(server, {
            maxHttpBufferSize: conf.realtime && conf.realtime.maxPatchBytes ? conf.realtime.maxPatchBytes * 2 : 1e6
        });
        require('./lib/realtime')(io, {
            sessionMiddleware: sessionMiddleware,
            passport: passport,
            conf: conf,
            confOpts: app.locals.confOpts
        });
    }

    server.listen(conf.serverPort, conf.serverHost, function () {
        console.log('Server started at ' + (conf.httpsOptions ? 'https://' : 'http://') + conf.serverHost + ':' + conf.serverPort);
    });
}

bootstrap();
