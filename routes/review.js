// Copyright (c) 2017 Chandan B N. All rights reserved.

// a rudimentary way to share the draft entries with 'people who has a link'. For this feature to work 'reviewToken' option must be defined. It is undefined by default.

const conf = require('../config/conf.js');
const express = require('express');
const mongoose = require('mongoose');
const protected = express.Router();
const textUtil = require('../public/js/util.js');
const CVE = mongoose.model('cve');
const NVD = mongoose.model('nvd');
const pug = require('pug');
const optSet = require('../models/set');

module.exports = {
    protected: protected
}

var cveOpts = optSet('cve');
var slideTemplate = pug.compile(
    `extends ./views/slides.pug

block prepend cveBlock
    include ` + cveOpts.render.substr(1) + `
`, {
        filename: 's'
    });

var draftsTemplate = pug.compile(
    `extends ./views/drafts.pug

block prepend cveBlock
    include ` + cveOpts.render.substr(1) + `
`, {
        filename: 's'
    });

async function drafts(req, res) {
    try {
        var cveq = {
            "body.CVE_data_meta.STATE": {
                "$in": ['REVIEW', 'READY']
            }
        };
        var cvef = {
            body: 1
        };
        if (req.query.e) {
         //   cvef["body.CNA_private.internal_comments"] = 0;
        }
        if (req.params.datePrefix) {
            saq["body.DATE_PUBLIC"] = cveq["body.CVE_data_meta.DATE_PUBLIC"] = {
                "$regex": "^" + req.params.datePrefix
            };
        }
        if (req.params.id) {
            saq["body.ID"] = cveq["body.CVE_data_meta.ID"] = req.params.id;
        }
        var cveList = await CVE.find(cveq, cvef, {
                sort: {
                    'body.source.advisory': 1
                }
            })
            .catch((e) => console.log('CVE list .find ' + e));
        var tbd = 0;
        var cveMap = {};
        for (var d of cveList) {
            var cve_list = textUtil.deep_value(d, 'body.CNA_private.CVE_list');
            if (cve_list && cve_list.length > 0) {
                var cSet = new Set();
                var cMap = {};
                for (var dc of cve_list) {
                    if (dc.CVE) {
                        for (var x of dc.CVE.match(/CVE-\d{4}-[a-zA-Z\d\._-]{4,}/igm)) {
                            cSet.add(x);
                            cMap[x] = {
                                impact: '',
                                summary: dc.summary
                            }
                        }
                    }
                }
                if (cSet.size > 0) {
                var r = await NVD.find({'cve.CVE_data_meta.ID': {'$in':Array.from(cSet)}},['cve.CVE_data_meta', 'cve.description', 'impact']);
                for (var c of r) {
                    c = c.toObject();
                    var cveid = textUtil.deep_value(c, 'cve.CVE_data_meta.ID');
                    if (textUtil.deep_value(c,'impact.baseMetricV3.cvssV3')) {
                        cMap[cveid].impact = {cvss:c.impact.baseMetricV3.cvssV3};
                    } else if (textUtil.deep_value(c,'impact.baseMetricV2.cvssV2')) {
                        cMap[cveid].impact = {cvss:c.impact.baseMetricV2.cvssV2};
                    }
                    if(!cMap[cveid].summary) {
                        var title = textUtil.deep_value(c, 'cve.CVE_data_meta.TITLE');
                        cMap[cveid].summary = title ? title : textUtil.deep_value(c, 'cve.description.description_data')[0].value;
                    }
                    cSet.delete(cveid);
                }
                if (cSet.size > 0) {
                    var nr = await CVE.find({'body.CVE_data_meta.ID': {'$in':Array.from(cSet)}},['body.CVE_data_meta','body.impact', 'body.description']);
                    for (c of nr) {
                        c = c.toObject();
                        var cveid = textUtil.deep_value(c, 'body.CVE_data_meta.ID');
                        if (textUtil.deep_value(c, 'body.impact.cvss')) {
                            cMap[cveid].impact = c.body.impact;
                        }
                        if(!cMap[cveid].summary) {
                            var desc = textUtil.deep_value(c, 'body.description.description_data')[0].value;
                            cMap[cveid].summary = desc ? desc : textUtil.deep_value(c, 'body.CVE_data_meta.TITLE') ;
                        }
                    }
                }                    
                }
                cveMap[d.body.CVE_data_meta.ID] = cMap;
            }
        }
             
        var idx = cveList.map(d => ({
            Advisory: d.body.source.advisory ? d.body.source.advisory : d.body.source.advisory = 'draft-' + (d.body.source.defect[0] ? d.body.source.defect[0] : ++tbd),
            CVE: d.body.CVE_data_meta.ID,
            CVSS: d.body.impact.cvss.baseScore,
            Date: d.body.CVE_data_meta.DATE_PUBLIC,
            Title: d.body.CVE_data_meta.TITLE,
            Defect: d.body.source.defect
        }));
        var draftView = "drafts";
        var templateFunction = draftsTemplate;
        if (req.path.startsWith("/slides")) {
            draftView = "slides";
            templateFunction = slideTemplate;
        }

        res.send(templateFunction({
            //min: true,
            conf: conf,
            page: '/review/' + draftView,
            user: req.user,
            title: req.query.e ? conf.orgName + ' Advisory Review Drafts - Copyright © ' + conf.orgName : conf.orgName + ' CONFIDENTIAL INTERNAL ONLY!',
            idx: idx,
            messages: res.locals.messages,
            docs: cveList,
            cveMap: cveMap,
            textUtil: textUtil,
            ext: req.query.e,
            cveOpts: cveOpts,
            fields: {
                'Advisory': {
                    href: '#'
                },
                'CVE': {
                    //   href:"/review/drafts/"
                },
                Defect: {
                    href: conf.defectURL,
                    showDistinct: true
                }
            },
            schemaName: 'cve',
            defectURL: conf.publicDefectURL
        }));
    } catch (e) {
        req.flash('error', e);
        res.render('blank');
    }
};

protected.get('/drafts/:datePrefix([0-9-]+)?', drafts);
protected.get('/slides/:datePrefix([0-9-]+)?', drafts);

if (conf.reviewToken) {
    const public = express.Router();
    public.get(conf.basedir + conf.reviewToken + '/:id?', drafts);
    module.exports.public = public;
}