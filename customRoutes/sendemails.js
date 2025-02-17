const express = require('express');
const protectedRouter = express.Router();
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

protectedRouter.post('/', csrfProtection, async function(req, res) {
    try {
        // Validate input
        const { emailto1, emailto2, emailreplyto, emailsubject, emailtext } = req.body;
        if (!emailto1 || !emailto2 || !emailsubject || !emailtext) {
            throw new Error('Missing required fields');
        }
        const config = require('../config/conf');
        const baseEmailInfo = {
            from: `"${req.user.name}" <${req.user.email}>`,
            replyTo: emailreplyto,
            subject: emailsubject,
            text: emailtext
        };
        // Send emails
        await Promise.all([
            email.sendemail({ ...baseEmailInfo, to: emailto1 }),
            email.sendemail({
                ...baseEmailInfo,
                to: emailto2,
                bcc: config.securityEmail || 'security@khulnasoft.com'
            })
        ]);
        req.flash('success', 'Emails sent successfully!');
    } catch (error) {
        console.error('Failed to send emails:', error);
        req.flash('error', 'Failed to send emails: ' + error.message);
    }
    res.render('blank');
});

module.exports = {
    protectedRouter: protectedRouter
};
