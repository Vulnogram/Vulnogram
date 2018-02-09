// Copyright (c) 2017 Chandan B N. All rights reserved.

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const flash = require('connect-flash');

// TODO: don't use express-session for large-scale production use
const session = require('express-session');

const passport = require('passport');
const crypto = require('crypto');
const compress = require('compression');
const conf = require('./config/conf');

mongoose.Promise = global.Promise;
mongoose.connect(conf.database, {
    useMongoClient: true,
    keepAlive: true,
});
const db = mongoose.connection;

//Check connection
db.once('open', function () {
    console.log('Connected to MongoDB');
});

//Check for db errors
db.on('error', function (err) {
    console.error(err);
});

const app = express();

app.disable('x-powered-by');

// enable compression
app.use(compress());

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// make conf available for pug
app.locals.conf = conf;

// parse urlencoded forms
app.use(express.urlencoded({
    extended: true
}));

// parse application/json
app.use(express.json());

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
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// make user information available
app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

app.post('*', function (req, res, next) {
    res.locals.user = req.user || null;
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

//delete return redirect path
app.use(function (req, res, next) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    if (req.path != '/users/login' && req.session.returnTo) {
        delete req.session.returnTo
    }
    next()
})

// set up routes
let users = require('./routes/users');

app.use('/users', users.public);

app.use('/users', ensureAuthenticated, users.protected);

let nvd = require('./routes/nvd');

app.use('/nvd', ensureAuthenticated, nvd.router);

let docs = require('./routes/doc');

let cveRoute = docs('cve');
app.use('/cve', ensureAuthenticated, cveRoute.router);

let saRoute = docs('sa');
app.use('/sa', ensureAuthenticated, saRoute.router);

//Configuring a reviewToken in conf file allows sharing drafts with 'people who have a link containing the configurable token' 
let review = require('./routes/review');

if (review.public) {
    app.use('/review', express.static('public'));
    app.use('/review', review.public);
}

app.use('/review', ensureAuthenticated, review.protected);

app.get('/', function (req, res, next) {
    res.redirect('/cve/?phase=Current');
});

app.listen(conf.serverPort, function () {
    console.log('Server started on port ' + conf.serverPort);
});