const express = require('express');
const router = express.Router();
const fs = require('fs');
const CVE = require('../models/cve');
const textUtil = require ('../public/js/util.js');
const conf = require ('../config/conf');
const csurf = require('csurf');
var csrfProtection = csurf();
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const validator = require('validator');

//Show search results
// todo paginate
router.get('/search', function (req, res) {
  var q = req.query.q;
  q = q.replace(/(CVE-[0-9A-Za-z-]+)/g, "\"$1\"");
  CVE.find({$text: {$search: q}}, [], {sort: {'cve.CVE_data_meta.ID':1}}, function(err, docs){
    if (err){
        req.flash('error', err);
        res.render('blank', {title: 'Error', message:'Text Search failed. '});
    } else {
      res.render('cves/index', {
        title: 'Search', 
        docs: docs,
          textUtil: textUtil,
          focustab: 0
      });
    }
  });
});

// Show draft of advisories based on CVE IDs.
router.get('/drafts/:date_public_re([0-9-]+)?', function (req, res) {
  var q = {
      "cve.CNA_private.state" : {
          "$in": ['publish-ready', 'review-ready']
      }
    };
  if(req.params.date_public_re) {
      q = {"cve.CVE_data_meta.DATE_PUBLIC": {"$regex": "^" + req.params.date_public_re}};
  }
  CVE.find(q, [], {sort: {'cve.CVE_data_meta.ID':1}}, function(err, docs){
    if(err){
      console.error(err);
        res.status(500).send('Error');
    } else {
      res.render('cves/' + conf.advisoryTemplates + '/print', {
        title: req.query.e ? conf.orgName + ' Advisory Review Drafts - Copyright © ' + conf.orgName  : conf.orgName + ' CONFIDENTIAL INTERNAL ONLY!', 
        docs: docs,
        textUtil: textUtil,
        ext: req.query.e
      });
    }
  });
});

// Show a page that can be used to create slideware
router.get('/slides', function (req, res) {
  CVE.find({
      "cve.CNA_private.state" : {
          "$in": ['publish-ready', 'review-ready']
      }
    }, [], {sort: {'cve.CVE_data_meta.ID':1}}, function(err, docs){
    if(err){
      console.error(err);
        res.status(500).send('Error');
    } else {
      res.render('cves/' + conf.advisoryTemplates + '/slide', {
        title: req.query.e ? conf.orgName + ' Advisory Review Slides - Copyright © ' + conf.orgName  : conf.orgName + ' CONFIDENTIAL INTERNAL ONLY!',
        docs: docs,
        textUtil: textUtil,
        ext: req.query.e          
      });
    }
  });
});

if(conf.newCVE) {
    router.get('/pr:pr', csrfProtection, conf.newCVE);
}

// load CVE editor form
router.get('/:id(' + conf.cveRegex + '|new)', csrfProtection, function(req, res) {
  CVE.findOne({'cve.CVE_data_meta.ID': req.params.id}, function(err, doc) {
    //todo: if can't find in database, get from git repo
    res.render('cves/edit', {
      title: req.params.id,
      doc: doc,
      textUtil: textUtil,
      csrfToken: req.csrfToken()
    });
  });
});

// load a CVE ID view page
router.get('/view/:id(' + conf.cveRegex + ')', function (req, res) {
    CVE.findOne({'cve.CVE_data_meta.ID': req.params.id}, function (err, doc) {
        if (!doc) {
            req.flash('error', err);
            res.render('blank', {title: 'Error', message:'No CVE found'});
        } else {
            res.render('cves/' + conf.advisoryTemplates + '/view', {
                title: req.params.id,
                doc: doc,
                textUtil: textUtil
            });
        }
    });
});

var checkID = 
        check('CVE_data_meta.ID')
            .exists()
            .custom((val, {req}) => {
                console.log('got' + val);
                if(validator.matches(val, /^CVE-[0-9]{4}-[a-zA-Z0-9]{4,}$/)) {
                    return true;
                }
                return false;
            })
            .withMessage('CVE ID contains extra characters');

var existCheck = check('CVE_data_meta.ID')
    .exists()
    .custom((val, {req}) => {
        return CVE.findOne({
            'cve.CVE_data_meta.ID': val
        }).then((doc) => {
            if (doc) {
                throw new Error('This CVE ID exists. Save with a different ID or Update the existing one');
                return false;
            } else {
                return true;
            }
        });
    });

//check if CVE ID exists, insert, then redirect to CVE ID page
router.post(/\/(new|pr.*)$/, csrfProtection, [checkID, existCheck], function(req, res) {
    let errors = validationResult(req).array();
    if (errors.length > 0) {
        var msg = 'Error: ';
        for (var e of errors) {
            msg += e.param + ': ' + e.msg + ' ';
        }
        res.json({
            type: 'err',
            msg: msg
        });
        return;
    }
    
    let entry = new CVE({"cve": req.body, "author": req.user.username});
    entry.save(function(err, doc){
        if(err) {
            res.json({
                type:'err',
                msg: 'Error ' + err
            });
            return;
        } else {
            //req.flash('info', 'new CVE entry saved!');
            res.json({
                type: 'go',
                to: doc.cve.CVE_data_meta.ID
            });
            return;
        }
    });
});

// update or submit new CVE ID 
// todo: save older versions revrting back
router.post('/:id(' + conf.cveRegex + ')', csrfProtection, [checkID], function (req, res) {
    let errors = validationResult(req).array();
    if (errors.length > 0) {
        var msg = 'Error: ';
        for (var e of errors) {
            msg += e.param + ': ' + e.msg + ' ';
        }
        res.json({
            type: 'err',
            msg: msg
        });
        return;
    }

    let cve = req.body;
    let entry = {
        "cve": cve,
        "author": req.user.username
    };
    let query = {
        'cve.CVE_data_meta.ID': cve.CVE_data_meta.ID
    };
    var renaming = (req.params.id != cve.CVE_data_meta.ID);
    CVE.findOne(query).then((existingDoc) => {
        if (existingDoc) {
            // check CVE ID is being renamed.
            if (renaming) {
                res.json({
                    type: 'err',
                    msg: 'Not saved. CVE '+ existingDoc.cve.CVE_data_meta.ID+' exists. Save with a different ID or update the existing one.'
                });
                return;
            }
        } else {
            existingDoc = {};
        }
        existingDoc.cve = cve;
        existingDoc.author = req.user.username;
        CVE.findOneAndUpdate(query, existingDoc, {
            upsert:true
        }, function (err, doc) {
            // to do save doc for versioning, undo, etc.,
            if (err) {
                res.json({
                    type: 'err',
                    msg: 'Error! CVE not Updated, ' + err
                });
            } else {
                if (renaming) {
                    res.json({
                        type: 'go',
                        to: cve.CVE_data_meta.ID
                    });
                } else {
                    res.json({
                        type: 'saved'
                    });
                }
            }
            return;
        });
    });
    return;
});

// Delete post
router.delete('/:id(' + conf.cveRegex + ')', csrfProtection, function(req, res){
  let query = {'cve.CVE_data_meta.ID': req.params.id};

  CVE.remove(query, function(err){
    if(err) {
      res.send('Error Deleting');
      return;
    } else {
      res.send('Deleted');
    }
  });
});

// Display a listing of CVE IDs in the database
router.get('/', function (req, res) {
  //todo need better sorting for CVE IDs
  CVE.find({}, [], {sort: {'cve.CVE_data_meta.ID':1}}, function(err, docs){
    if(err){
        res.status(500).send('Error');
    } else {
      res.render('cves/index', {
        title: conf.appName, 
        docs: docs,
          textUtil: textUtil,
          focustab: 0
      });
    }
  });
});

module.exports = router;