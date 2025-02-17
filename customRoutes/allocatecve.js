const express = require('express');
const protectedRouter = express.Router();
const conf = require('../config/conf');
const csurf = require('csurf');
var request = require('request');
const email = require('./email.js');
const doc = require('../routes/doc.js');
const ksf =  require('../custom/ksf.js');

var csrfProtection = csurf();

// Is the PMC allowed to do a live Mitre allocation?
// Currently only if you are in security group or if you're listed in the config,
// or if the config allows all (*) but you're not listed as an exception

function allowedtoallocatelive(pmcsiamin, specificpmc) {
    if (pmcsiamin.includes(conf.admingroupname)) {
        return true;
    }
    if (!pmcsiamin.includes(specificpmc)) {
        return false; // they're messing with the form
    }
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

// use 'number: 1' below if you want to allow more than one CVE to get alocated at once. probably not
// very useful/likely even though we do support it

// use 'year: thisyear' below if you want to allow the year to be specified.  This is really only useful
// perhaps at the end of the year when you know something isn't public until the next year, but really this
// isn't important.


protected.get('/', csrfProtection, function (req, res) {
    thisyear = new Date().getFullYear();
    var title = "This form will request a CVE direct from the CVE project.  It will create a new CVE document here and send an email with the CVE name to the security team and the PMC.";
    if (req.user.pmcs && req.user.pmcs.length == 1) {
        if (!allowedtoallocatelive(req.user.pmcs,req.user.pmcs[0])) {
            title = "This form will request a CVE from the KSF Security team by email.";
        }
    } else if (!req.user.pmcs || !req.user.pmcs.includes(conf.admingroupname)) {
        title = "This form will request a CVE either from the KSF Security team, or if your PMC is allowed, direct from the CVE project.  In either case an email will be sent to the security team and the PMC.";
    }
    res.render('../customRoutes/allocatecve', {
        title: title,
//        number: 1,
	cvetitle: "",
//        year: thisyear,
        csrfToken: req.csrfToken()
    });
});

// number, year, pm
protected.post('/', csrfProtection, async function(req,res) {
    if (!res.locals.docs) {
        console.log(res.locals);
        return;
    }
    var testmode =!conf.cveapiliveservice;
    var pmc = req.body.pmc.toLowerCase();

    var eto = ksf.getsecurityemailaddress(pmc);
    if (pmc =="security" || testmode) {
        eto = "security@khulnasoft.com";
    }
    
    let Document = res.locals.docs.cve5.Document;
    let html = "";

    if (!req.body.number) {
        req.body.number = 1;
    }
    if (!req.body.year) {
        req.body.year = new Date().getFullYear();
    }
    if (!req.body.cvetitle || req.body.cvetitle == "") {
        req.flash('error',"description can not be blank");
        res.render('blank');
        return;
    }
    
    if (!allowedtoallocatelive(req.user.pmcs,pmc)) {

        // Not allowed to allocate a CVE live, but requests one from security@

        var s2 = email.sendemail({"to":"security@khulnasoft.com",
                                  "cc":eto,
                                  "subject":"CVE request for "+pmc,
                                  "text":"requestor: "+req.user.username+"\npmc: "+pmc+"\n\n"+req.body.cvetitle,
                                 }).then( (x) => {  console.log("sent CVE request mail "+x);});
        
        req.flash('success',"An email has been sent to security@khulnasoft.com requesting the CVE name");
        res.render('blank');
        return;
    }

    var emaillist = await new Promise( res => { ksf.getemaillistforpmc(req.body.pmc, res)});
    
    console.log("Requesting "+req.body.number+" "+ req.body.year + " CVE for "+req.body.pmc+ " email list "+emaillist)

    var opt = {
        'method' : 'POST',
        'url': conf.cveapiurl+'/cve-id?amount='+req.body.number+'&cve_year='+req.body.year+'&short_name='+conf.cveapishortname+'&batch_type=sequential',
        //'url': "https://cveprocess.khulnasoft.com/notfound",
        'json': true,
        'headers': conf.cveapiheaders,
    };
    await request(opt, async function (error, response, body) {
	if (testmode) {
            body = {"cve_ids":[{"requested_by":{"cna":"address","user":"joshuaburton@address.com"},"cve_id":"CVE-2021-20252","cve_year":"2021","state":"RESERVED","owning_cna":"address","reserved":"2020-10-26T17:20:04.291Z"}]};
	}
        if (error) {
            req.flash('error',error);
            res.render('blank');
        } else {
            if (body.error) {
                req.flash('error',"CVE service error '"+body.error+"': "+body.message);
                res.render('blank');
            } else {
                console.log("ok");
                for (cveid in body.cve_ids) {
		    if (testmode) {
                        body.cve_ids[cveid].cve_id = "CVE-2000-" + (Math.floor(Math.random()*9999)+10000)
		    }
		    cve = body.cve_ids[cveid].cve_id
                    // MJC TEST
//                    if (testmode) {
//                        cve = cve + "-TEST"
//                    }
                    console.log("got a CVE ID "+cve+" reserved for "+pmc);
//		    var se = email.sendemail({"to":"mjc@khulnasoft.com",
//                                          "cc":req.body.email,
//					  "subject":cve+" reserved for "+pmc,
//					  "text":"description: "+req.body.cvetitle+"\n\n"}).then( (x) => {  console.log("sent CVE notification mail "+x);});

                    var beta = "Note that you should use our web based service to handle the process.  Please visit https://cveprocess.khulnasoft.com/cve5/"+cve+" and note this it replaces the whole of section 16 of our requirements and full instructions are at that URL.\n\nThere is also a video tutorial available at https://s.khulnasoft.com/cveprocessvideo\n\n"
                    var pmctemplate = "Thank you for requesting a CVE name for your issue.  We suggest you copy and paste the name below as mistakes are easy to make and cumbersome to correct.\n\n"+cve+"\n"+req.body.cvetitle+"\n\n"+beta+"Note the process at https://www.khulnasoft.com/security/committers.html .\n\nIf you decide not to use the CVE name, or have any questions, please let us know asap.\n\nRegards, KSF Security Team"

		    var se2 = email.sendemail({"to":eto,
                                               "cc":"security@khulnasoft.com",
					       "subject":cve+" reserved for "+pmc,
					       "text":pmctemplate,
                                              }).then( (x) => {  console.log("sent CVE notification mail "+x);});

		    // probably some better way of doing this for sure; we could render the schema i suppose?
		    newdoc = { "dataType" : "CVE_RECORD",
                               "dataVersion" : "5.0",
                               "cveMetadata" : {
                                   "cveId" : cve,
                                   "serial": 1,
                                   "state" : "PUBLISHED"
                               },
                               "CNA_private": {
                                   "owner": pmc,
                                   "userslist": emaillist,
                                   "state": "RESERVED",
                               },
                               "containers": {
                                   "cna":{
                                       "title": req.body.cvetitle,
                                   }
                               }
                             };

		    let entry = new Document({
			"body": newdoc,
			"author": req.user.username
		    });
                    console.log("Saving new doc");
		    await entry.save(function (err, doc) {
			if (err || !doc._id) {
			    req.flash('error',JSON.stringify(err));
			} else {
			    console.log("saved",doc);
                            //res.redirect('/cve/' + cve.slice());
                            //res.write( "<p><a href=\"/cve/"+cve.slice()+"\">"+cve.slice()+"</a>");
			}
		    });
                }
                console.log("Now display links");
                for (cveid in body.cve_ids) {
                    cve = body.cve_ids[cveid].cve_id
                    res.write( "<p><a href=\"/cve5/"+cve.slice()+"\">"+cve.slice()+"</a>");
                }
                res.end();
            }
        }
    });
});


module.exports = {
    protected: protectedRouter
};
