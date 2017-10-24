// Copyright (c) 2017 Chandan B N. All rights reserved.

// a rudimentary way to share the draft entries with 'people who has a link'. For this feature to work 'reviewToken' option must be defined. It is undefined by default.

const conf = require('../config/conf.js');

if (conf.reviewToken) {
    const express = require('express');
    const router = express.Router();
    const CVE = require('../models/cve');
    const textUtil = require('../public/js/util.js');

    router.get(conf.basedir + conf.reviewToken + '/:id?', function (req, res) {
        var q = {
            "cve.CNA_private.state": {
                "$in": ['publish-ready', 'review-ready']
            }
        };
        if (req.params.id) {
            q._id = req.params.id;
        }
        CVE.find(q, [], {
            sort: {
                _id: 1
            }
        }, function (err, cves) {
            if (err) {
                console.error(err);
                res.status(500).send('Error');
            } else {
                res.render('cves/' + conf.advisoryTemplates + '/print', {
                    title: req.query.e ? conf.orgName + ' Advisory Review Drafts - Copyright © ' + conf.orgName : conf.orgName + ' CONFIDENTIAL INTERNAL ONLY!',
                    cves: cves,
                    textUtil: textUtil,
                    ext: req.query.e,
                    min: true
                });
            }
        });
    });
}
module.exports = router;