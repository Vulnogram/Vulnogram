const express = require('express');
const protected = express.Router();
const conf = require('../config/conf');
const csurf = require('csurf');
var request = require('request');
const email = require('./email.js');
//const doc = require('../routes/doc.js');
//const optSet = require('../models/set');

var csrfProtection = csurf();

protected.get('/', csrfProtection, async function(req,res) {
    req.flash('error',"Test");
    res.render('blank');
    console.log("sendemail");
    res.end();
});

protected.post('/', csrfProtection, async function(req,res) {
    var to1 = req.body.emailto1;
    var to2 = req.body.emailto2;
    var se1 = await email.sendemail({"from":"\""+req.user.name+"\" <"+req.user.email+">","to":to1,"replyTo":req.body.emailreplyto,"subject":req.body.emailsubject,"text":req.body.emailtext}).then( (x) => {  console.log("sent OSS notification mail "+x);});
    var se2 = await email.sendemail({"from":"\""+req.user.name+"\" <"+req.user.email+">","to":to2,"bcc":"security@khulnasoft.com","replyTo":req.body.emailreplyto,"subject":req.body.emailsubject,"text":req.body.emailtext}).then( (x) => {  console.log("sent KSF notification mail "+x);});    
    req.flash('error','Sent the emails!');
    res.render('blank');
    res.end();
});

module.exports = {
    protected: protected
};
