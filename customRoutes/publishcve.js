const express = require('express');
const protected = express.Router();
const conf = require('../config/conf');
const csurf = require('csurf');
var request = require('request');
const email = require('./email.js');
const ksf =  require('../custom/ksf.js');
var csrfProtection = csurf();
var textUtil = require('../public/js/util.js');

// We have to duplicate this from custom/cve5/ksfpreload.js
global.getProductListNoVendor = function getProductListNoVendor(c) {
    var lines = [];
    for (var affected of c.containers.cna.affected) {
        lines.push(affected.product);
    }
    return lines.join(", ");
}

// Is the PMC allowed to do a live CVE.org push?
// Currently only if you are in security group or if you're listed in the config,
// or if the config allows all (*) but you're not listed as an exception

function allowedtopushlive(pmcsiamin, specificpmc) {
    if (pmcsiamin.includes(conf.admingroupname)) {
        return true;
    }
    if (!pmcsiamin.includes(specificpmc)) {
        return false; // they're messing with the form
    }
    return false;
    // This isn't implemented yet
    //
    if (conf.pmcstrustedascna.includes("*")) {
        if (conf.pmcstrustedascna.includes("-"+specificpmc)) {
            return false;
        }        
        return true;
    }    
    if (conf.pmcstrustedascna.includes(specificpmc)) {
        return true;
    }
    return false;
}

function getCveIdState(cveid, cb) {
    var opt = {
        'method' : 'GET',
        'url': conf.cveapiurl+'/cve-id/'+ cveid,
        'json': true,
        'headers': conf.cveapiheaders,
    };
    try {
        request(opt, (error, response, body) => {
            if (error) {
                console.warn(error);
                cb("");
            } else {
                cb(body.state);
            }
        });
    } catch (error) {
        console.warn(error);
        cb("");
    }
}

function publishCve(cveid, isupdate, container, cb) {
    var opt = {
        'method' : 'POST',
        'url': conf.cveapiurl+'/cve/'+ cveid +"/cna",
        'json': {"cnaContainer": container},
        'headers': conf.cveapiheaders,
    };
    if (isupdate) {
        opt['method'] = "PUT";
    }
    try {
        request(opt, (error, response, body) => {
            if (error) {
                console.warn(error);
                cb(error);
            } else if (body.error) {
                console.warn(body.error);
                cb(body.message);
            } else {
                console.log(body.message);
                cb();
            }
        });
    } catch (error) {
        console.warn(error);
        cb(error);
    }
}

protected.post('/', csrfProtection, async function(req,res) {
    var q = {};
    var opts = {"idpath":"body.cveMetadata.cveId"};
    console.log("publishcve", req.body.cve);
    q[opts.idpath] = req.body.cve;
    let Document = res.locals.docs.cve5.Document;
    var doc = await Document.findOne(q);
    if (!doc) {
        res.json({"body": req.body.cve+" not found"});
        res.end();
        return;
    }

    // We now have a loaded document for the given CVE ID
    
    var cvepmcowner  = doc.body.CNA_private.owner;
    if (!allowedtopushlive(req.user.pmcs,cvepmcowner)) {
        res.json({"body":"Sorry the PMC "+cvepmcowner+" has no push rights"});
        res.end();    
        return true;        
    }

    // We now know that the user trying to push it is allowed to do so
    j = textUtil.reduceJSON(doc.body);

    // We now have the document the same as the CVE-JSON tab had

    if (doc.body.CNA_private.state != "PUBLIC" && doc.body.CNA_private.state != "READY" ) {
        res.json({"body":req.body.cve+" is not in state PUBLIC or READY"});
        res.end();
        return true;
    }

    // We now have something we're allowed to push
    
    // portal.js does a getCveId(j.cveMetadata.cveId) and looks at the state so we know if
    // we're doing a first push or an update push

    var lateststate = await new Promise( res => { getCveIdState(req.body.cve, res)})
    //console.log("According to cve.org "+req.body.cve+" is state "+lateststate);

    if (j.cveMetadata.state == "PUBLISHED") {
        var isupdate = (lateststate != "RESERVED")
        var result = await new Promise( res => { publishCve(j.cveMetadata.cveId, isupdate, j.containers.cna, res)})
        if (!result) {
            res.json({"body":"Push to cve.org success."});
            
            var s2 = email.sendemail({"to":"security@khulnasoft.com",
                                      "subject":j.cveMetadata.cveId+" was pushed to cve.org",
                                      "text":"push by "+req.user.username+" success",
                                     }).then( (x) => {  console.log("sent CVE push mail "+x);});
        } else {
            res.json({"body":"Push to cve.org failed. "+result});

            var s2 = email.sendemail({"to":"security@khulnasoft.com",
                                      "subject":j.cveMetadata.cveId+" failed push to cve.org",
                                      "text":"push by "+req.user.username+" failed "+result,
                                     }).then( (x) => {  console.log("sent CVE push failed mail "+x);});
            
        }
        res.end();    
        return true;                    
    } else { // Rejected
        res.json({"body":"Push is authorised for you, but 'reject cve' not yet implemented."});
        res.end();    
        return true;                        
    }
});

module.exports = {
    protected: protected
};
