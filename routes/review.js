// Copyright (c) 2017 Chandan B N. All rights reserved.

// a rudimentary way to share the draft entries with 'people who has a link'. For this feature to work 'reviewToken' option must be defined. It is undefined by default.

const conf = require('../config/conf.js');
const express = require('express');
const mongoose = require('mongoose');
const protected = express.Router();
const textUtil = require ('../public/js/util.js');
const nvd = require('./nvd');
const CVE = mongoose.model('cve');
//const SA = mongoose.model('sa');
const pug = require('pug');
const optSet = require('../models/set');

module.exports = {
    protected: protected
}

var cveOpts = optSet('cve');
//var saOpts = optSet('sa');
var slideTemplate = pug.compile(
`extends ./views/slides.pug

block prepend cveBlock
    include ` + cveOpts.render.substr(1) + `
`, {filename:'s'});

var draftsTemplate = pug.compile(
`extends ./views/drafts.pug

block prepend cveBlock
    include `+ cveOpts.render.substr(1) + `
`, {filename:'s'});

async function drafts(req, res) {
    try {
  var cveq = {
      "body.CVE_data_meta.STATE" : {
          "$in": ['REVIEW', 'READY']
      }
    };
    var cvef = {};
    if(req.query.e) {
        cvef["body.CNA_private.internal_comments"]=0;
    }
  var saq = {
      "body.STATE" : { "$in": ["REVIEW", "READY"] }
  };
  if(req.params.datePrefix) {
      saq["body.DATE_PUBLIC"] = cveq["body.CVE_data_meta.DATE_PUBLIC"] = {"$regex": "^" + req.params.datePrefix};
  }
  if(req.params.id) {
      saq["body.ID"] = cveq["body.CVE_data_meta.ID"] = req.params.id;
  }
/*    var saList= await SA.find(saq)
        .catch((e)=>console.log('SA.find ' + e));
    var idSet = textUtil.saCVESet(saList);
    var cveInfo = await CVE.find({'body.CVE_data_meta.ID': {"$in": Array.from(idSet)}})
        .catch((e)=>console.log('CVE.find ' + e))
    var cmap = textUtil.getCVEMap(cveInfo);
    
    for(var cveid in cmap) {
        idSet.delete(cveid);
    }
   if(idSet.size > 0) {
        var nvdCVEs = await nvd.getCVE(idSet);
        for(var e of nvdCVEs) {
            cmap[e.body.CVE_data_meta.ID] = e.body;
        }
    }
    var csumSet = textUtil.getCVESummarySet(saList, cmap);

    var saidx = textUtil.saIndex(saList, csumSet);*/

    var cveList = await CVE.find(cveq, cvef, { sort: { 'body.source.advisory': 1 } })
        .catch((e)=>console.log('CVE list .find ' + e));
    var tbd = 0;
  var idx = cveList.map(d=>({
            Advisory:d.body.source.advisory ? d.body.source.advisory : d.body.source.advisory = 'Draft-No-' + (++tbd),
            CVE:d.body.CVE_data_meta.ID,
            CVSS:d.body.impact.cvss.baseScore,
            Date:d.body.CVE_data_meta.DATE_PUBLIC,
            Title:d.body.CVE_data_meta.TITLE,
            Defect:d.body.source.defect
        }));
    //idx = saidx.concat(idx);
    var draftView = "drafts";
    var templateFunction = draftsTemplate;
    if(req.path.startsWith("/slides")) {
        draftView = "slides";
        templateFunction = slideTemplate;
    }
/*        saOpts.facet['Advisory']={link:"#"};
        saOpts.facet['CVE']={link:"#"};
        saOpts.facet['Defect']={link:"#"};*/
    res.send(templateFunction({
        //min: true,
        conf: conf,
        page: '/review/' + draftView,
        user: req.user,
        title: req.query.e ? conf.orgName + ' Advisory Review Drafts - Copyright © ' + conf.orgName  : conf.orgName + ' CONFIDENTIAL INTERNAL ONLY!', 
        idx: idx,
        messages: res.locals.messages,
        docs: cveList,
    //    sas: saList,
        textUtil: textUtil,
        ext: req.query.e,
     //   cmap: cmap,
        //confOpts: {},
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
       // csumSet: csumSet,
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
