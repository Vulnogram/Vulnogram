// KSF Feature changelog from v4 to v5 (ksf010 branch)
//
// - Fixed logic error in email sending button
// - Email can only be sent if document validates with no errors
// - Ability to edit the announcement email entry, it populates when CVE is allocated now (or if blank)
// - Checks for bad URLs, correct use of khulnasoft.com vendor URLs in references
// - If wrong URL /cve or /cve5 is used it will redirect
// - Has a non-auth /publicjson/CVE-id endpoint to grab the (full) JSON of only public issues (not for public use, for KSF etc)
// - Requirement for severity level
//

const { v4: uuidv4 } = require('uuid');
const request = require('request');
const express = require('express');
const conf = require('../config/conf');
const email = require('../customRoutes/email.js');

async function ksfemaillists (req, res) {
    var emaillist = await new Promise( xres => { self.getemaillistforpmc(req.query.pmc, xres)});    
    res.send(emaillist)
}

async function ksfpublicjsonlist(req, res) {
    let Document4 = res.locals.docs.cve.Document;
    var r4 = await Document4.aggregate([
        { $match: { 'body.CVE_data_meta.STATE': 'PUBLIC' }},
        { $project: {
            ID: '$body.CVE_data_meta.ID',
            title: '$body.CVE_data_meta.TITLE',
            state: '$body.CVE_data_meta.STATE',
            updated: '$updatedAt',
            owner: '$body.CNA_private.owner'
        }}
    ]);

    let Document5 = res.locals.docs.cve5.Document;
    var r5 = await Document5.aggregate([
        { $match: { 'body.CNA_private.state': 'PUBLIC' }},
        { $project: {
            ID: '$body.cveMetadata.cveId',
            title: '$body.containers.cna.title',
            state: '$body.CNA_private.state',
            updated: '$updatedAt',
            owner: '$body.CNA_private.owner'
        }}
    ]);

    res.json(r4.concat(r5));
}

const nodoc = {"error":"nodoc"};
async function findCVE(Document, idField, id, cb) {
    var q = {};
    q[idField] = id;
    Document.findOne(q, async function (err, docs) {
        if (err) {
            res.json(nodoc);
        } else {
            cb(docs);
        }
    });
}

async function ksfpublicjson(req, res) {
    var ids = req.params.id.match(RegExp('CVE-[0-9-]+', 'img'));
    if (!ids || !ids[0]) {
        res.json(nodoc)
        return;
    }
    findCVE(
        res.locals.docs.cve5.Document,
        "body.cveMetadata.cveId",
        ids[0],
        async function (docs) {
            if (docs && docs.body && docs.body.CNA_private && docs.body.CNA_private.state == "PUBLIC") {
                res.json(docs.body)
            } else {
                findCVE(
                    res.locals.docs.cve.Document,
                    "body.CVE_data_meta.ID",
                    ids[0],
                    async function (docs) {
                        if (docs && docs.body && docs.body.CVE_data_meta && docs.body.CVE_data_meta.STATE && docs.body.CVE_data_meta.STATE == "PUBLIC") {
                            res.json(docs.body)
                        } else {
                            res.json(nodoc)
                        }
                    })
            }
        })
}

function ksflogout (req, res) {
    req.logout();
    req.session.returnTo = null;
    res.redirect('/users/login');    
}

function ksflogin (req, res) {
    sess = req.session;
    if (req.query.code) {
	const userinfo_endpoint= 'https://oauth.khulnasoft.com/token'
	uri = userinfo_endpoint+"?code="+req.query.code
	request(uri, {json:true},(err,cbres,body) => {
	    if (err) {res.send(err);}
	    else if (cbres.statusCode != 200) {res.send(body);}
	    else if (body.state != sess.state) { res.send("auth is broken") }
	    else {
		pmcs = body.pmcs;
		for (i=0; i< body.projects.length; i++) {
		    if (!pmcs.includes(body.projects[i])) {
			// we're a committer to project, but not in the PMC
			if (conf.pmcswithsecurityemails.includes(body.projects[i])|| body.projects[i] == "security") {
			    // but this project has a security list
			    console.log("User "+body.uid+" is committer to "+body.projects[i]+" but not PMC, allowed");
			    pmcs.push(body.projects[i]);
			} else {
			    console.log("User "+body.uid+" is committer to "+body.projects[i]+" but not PMC, ignored");
			}
		    }
		}  
		sess.user = {username:body.uid, email:body.email, name:body.fullname, pmcs:pmcs};
		//sess.user = {username:body.uid, email:body.email, name:body.fullname, pmcs:["airflow"]};		
		if (sess.returnTo) {
		    res.redirect(req.session.returnTo);
		    delete req.session.returnTo;
		} else {
		    res.redirect("/");
		}
		console.log(body);
	    }
	});
    } else {
	delete  sess.user;
	sess.state = uuidv4();
	const authorization_endpoint= 'https://oauth.khulnasoft.com/auth'
	redirecturl = authorization_endpoint+"?state="+sess.state+"&redirect_uri=https://"+req.get('host')+req.originalUrl;
	res.redirect(redirecturl)
    }
}

// If you are in security pmc allow you to specify a different pmc for testing

function setpmc(req, res) {
    if (req.isAuthenticated()) {
	groups = req.user.pmcs;
	if (groups.includes(conf.admingroupname)) {
	    if (req.query.pmc) {
		req.session.user.pmcs = req.query.pmc.split(',');
		res.json({"result":"ok"});
	    } else {
		res.json({"error":"no pmc given"});
	    }
	} else {
            res.json({"error":"you are not in "+conf.admingroupname+" pmc"});
	}
    }
}

function usersmejson (req, res) {
    if (req.isAuthenticated()) {
        groups = req.user.pmcs;
        res.json({
            default: req.user.email,
            value: req.user.email,
        });
    }
}

function usersprofile (req,res) {
    user = req.user;
    user.group = user.pmcs;
    res.render('users/view', {
        title: 'Profile: ' + user.username,
        profile: user,
        admin: user.group.includes(conf.admingroupname),
        page: 'users',
    });
}

function userslist (req,res) {
    res.render('blank');
}

function cvenew (req,res,next) {
//    var pmcs = req.user.pmcs;
//    if (pmcs.includes(conf.admingroupname)) {
//        next();
//    } else {
	res.redirect("/allocatecve");
//    }
}

// If we are in security team then allow you to assign the CVE to any PMC
// otherwise give a radio list of the PMCs you are part of

function userslistjson (req, res) {
    if (req.isAuthenticated()) {
	groups = req.user.pmcs;

	if (groups && groups.includes(conf.admingroupname)) {
            res.json({
		"description": "lower case pmc name to assign this to",
		"options": {"grid_columns":12},
	    });
	} else {
            res.json({
		enum: groups,
		format: "radio",
		options: {enum_titles: groups},
	    });
	}
    }
}

var self = module.exports = {
    ksfinit: function (app) {
        app.use(function (req, res, next) {
            if (req.session.user && req.session.user.username) {
                req.user = req.session.user
            }
            res.locals.docs = app.locals.docs;
            next();
        });
    },

    ksfroutes: function (ensureAuthenticated, app) {
        app.get("/users/login", ksflogin); // replaces existing
        app.get("/users/logout", ksflogout); // replaces existing        
        app.get('/cve/new', ensureAuthenticated, cvenew); // replaces existing
        app.get('/cve5/new', ensureAuthenticated, cvenew); // replaces existing        
        app.use('/.well-known', express.static("/opt/cveprocess/.well-known", { dotfiles: 'allow' } ));
        let ac = require('../customRoutes/allocatecve');
        app.use('/allocatecve', ensureAuthenticated, ac.protected);
        let publishcve = require('../customRoutes/publishcve');        
        app.use('/publishcve', ensureAuthenticated, publishcve.protected);        
        let semail = require('../customRoutes/sendemails');
        app.use('/sendemails', ensureAuthenticated, semail.protected);
        app.get('/users/setpmc', ensureAuthenticated, setpmc);
        app.get('/users/me/json', ensureAuthenticated, usersmejson);
        app.get('/users/list/json', ensureAuthenticated, userslistjson); // replaces existing
        app.get('/users/list/', ensureAuthenticated, userslist); // replaces existing
        app.get('/users/profile/:id(' + conf.usernameRegex + ')?', ensureAuthenticated, usersprofile); // replaces existing
        app.get('/ksfemaillists', ensureAuthenticated, ksfemaillists); // work around CORS
        app.get('/publicjson', ksfpublicjsonlist);
        app.get('/publicjson/:id', ksfpublicjson);
    },

    ksfgroupacls: function (documentacl,yourpmcs) {
	//console.log('ksf9 doc owner is '+documentacl+" and you are "+yourpmcs);
	if (yourpmcs.includes(conf.admingroupname)) {
	    return true;
	}
	for (i=0; i< yourpmcs.length; i++) {
	    if (yourpmcs[i] == documentacl) {
		return true;
	    }
	}
	//console.log('ksf9 access denied');
	return false;
    },

    // When a CVE record is changed this hook is called
    
    ksfhookupsertdoc: function(req,dorefresh) {
        // in case we have an old record with no email list set CVE 5.0
        if (req.body.CNA_private) {
            if (!req.body.CNA_private.userslist || req.body.CNA_private.userslist == "") {
                //self.getemaillistforpmc(req.body.CNA_private.owner,function(res) {
                //    req.body.CNA_private.userslist = res;
                //    dorefresh = true;
                //    console.log(res);
                //});
            }
        }
	// enforce workflow state cve4
        if (req.body.CVE_data_meta) { // CVE 4.0
            if (req.body.CVE_data_meta.STATE == "RESERVED") {
	        // if it's in reserved but someone is editing it, move it to draft
	        if (!req.user.pmcs.includes(conf.admingroupname)) {
		    console.log("ksf4 reserved but the description changed");
		    req.body.CVE_data_meta.STATE = "DRAFT";
		    dorefresh=true;
	        }
	    }
        }
        // enforce workflow state cve5
        if (req.body.CNA_private && req.body.CNA_private.state) { // CVE 5.0
            if (req.body.CNA_private.state == "RESERVED") {
	        // if it's in reserved but someone is editing it, move it to draft
	        if (!req.user.pmcs.includes(conf.admingroupname)) {
		    console.log("ksf4 RESERVED but the description changed");
		    req.body.CNA_private.state = "DRAFT";
		    dorefresh=true;
	        } else {
		    console.log("ksf4 RESERVED but saved by security, no change");
                }
	    }
        }        
    },

    ksfhookshowcveacl: function(doc, req, res) {
        if (!doc) {
            if (req._parsedOriginalUrl.query == 'r') {
                res.render('blank', {
                    title: 'Error',
                });
                return false;
            }
            req.flash('error','');
            if (req.originalUrl.startsWith('/cve5/')) {
                res.redirect(req.originalUrl.replace("/cve5/","/cve/")+"?r");
            } else {
                res.redirect(req.originalUrl.replace("/cve/","/cve5/")+"?r");
            }
            return false;
        }
	if (doc && doc.body && doc.body.CNA_private && doc.body.CNA_private.owner) {
	    if (!self.ksfgroupacls(doc.body.CNA_private.owner, req.user.pmcs)) {
		req.flash('error','owned by pmc '+doc.body.CNA_private.owner);
                console.log("wrong acl");
                doc = {};
                res.render('blank', {
                    title: 'Error',
                });
                return false;
	    }
	} else {
	    req.flash('error','ACLs are bad tell security team "missing CNA_private.owner"');
            res.render('blank', {
                title: 'Error',
            });
            return false;
        }
        return true;
    },

    // Send an email when someone adds a comment to a CVE
    
    ksfhookaddcomment: function(doc,req) {
        var pathcve = "cve";
        if (doc.body.cveMetadata && doc.body.cveMetadata.cveId)
            pathcve = "cve5";
	var url = "https://"+req.client.servername+"/"+pathcve+"/"+req.body.id;
	se = email.sendemail({"from": "\""+req.user.name+"\" <"+req.user.email+">",
                              "to": self.getsecurityemailaddress(doc.body.CNA_private.owner),
                              "cc": "security@khulnasoft.com", 
                              "bcc": req.user.email,
			      "subject":"Comment added on "+req.body.id,
			      "text":req.body.plainText+"\n\n"+url}).then( (x) => {  console.log("sent notification mail "+x);});
    },

    ksfhookaddhistory: function(oldDoc, newDoc) {
	if (oldDoc != null) {
            if (newDoc.body.CVE_data_meta) { // CVE 4.0
	        if (newDoc.body.CVE_data_meta.STATE != oldDoc.body.CVE_data_meta.STATE) {
		    console.log("ksf4 changed state "+newDoc.body.CVE_data_meta.STATE);
		    if (["REVIEW","READY","PUBLIC"].includes(newDoc.body.CVE_data_meta.STATE) ||
                        (newDoc.body.CVE_data_meta.STATE == "DRAFT" && oldDoc.body.CVE_data_meta.SATE == "REVIEW" )) {
		        url = "https://cveprocess.khulnasoft.com/cve/"+newDoc.body.CVE_data_meta.ID;  // hacky
		        se = email.sendemail({"from": newDoc.author+"@khulnasoft.com",
					      "cc":newDoc.author+"@khulnasoft.com",
					      "subject":newDoc.body.CVE_data_meta.ID+" is now "+newDoc.body.CVE_data_meta.STATE,
					      "text":newDoc.author+" changed state from "+oldDoc.body.CVE_data_meta.STATE+" to "+newDoc.body.CVE_data_meta.STATE+"\n\n"+url}).then( (x) => {  console.log("sent notification mail "+x);});
		    }
	        }
	    }
            if (newDoc.body.CNA_private && newDoc.body.CNA_private.state) { // CVE 5.0
	        if (newDoc.body.CNA_private.state != oldDoc.body.CNA_private.state) {
		    console.log("ksf4 changed state "+newDoc.body.CNA_private.state);
		    if (["REVIEW","READY","PUBLIC"].includes(newDoc.body.CNA_private.state) ||
                        (newDoc.body.CNA_private.state == "DRAFT" && oldDoc.body.CNA_private.state == "REVIEW" )) {
		        url = "https://cveprocess.khulnasoft.com/cve5/"+newDoc.body.cveMetadata.cveId;  // hacky
		        se = email.sendemail({"from": newDoc.author+"@khulnasoft.com",
                                              "to":"security@khulnasoft.com",
					      "cc":newDoc.author+"@khulnasoft.com",
					      "subject":newDoc.body.cveMetadata.cveId+" is now "+newDoc.body.CNA_private.state,
					      "text":newDoc.author+" changed state from "+oldDoc.body.CNA_private.state+" to "+newDoc.body.CNA_private.state+"\n\n"+url}).then( (x) => {  console.log("sent notification mail "+x);});
		    }
	        }
	    }            
        }
    },

    ksfallowedtodelete: function(req) {
        return req.user.pmcs.includes(conf.admingroupname);
    },
    
    getsecurityemailaddress: function(pmc) {
        if (pmc == "security") {
            return "security@khulnasoft.com";
        }
        if (conf.pmcswithsecurityemails.includes(pmc)) {
            return "security@"+pmc+".khulnasoft.com";
        } else {
            return "private@"+pmc+".khulnasoft.com";        
        }
    },

    getemaillistforpmc: function(pmc, cb) {
        var pmcfull = pmc+".khulnasoft.com"
        var listname = "dev@"+pmcfull;
        try {
	    request('https://lists.khulnasoft.com/api/preferences.lua', {json:true},(err,cbres,body) => {
	        if (err) {console.log(err);}
	        else if (cbres.statusCode != 200) {console.log(cbres); }
                else {
                    if (body.lists && body.lists[pmcfull]) {
                        if (body.lists[pmcfull]["announce"]) {
                            listname = "announce@"+pmcfull;
                        } else if (body.lists[pmcfull]["announcements"]) {
                            listname = "announcements@"+pmcfull;
                        } else if (body.lists[pmcfull]["general"]) {
                            listname = "general@"+pmcfull;
                        } else if (body.lists[pmcfull]["users"]) {
                            listname = "users@"+pmcfull;
                        } else if (body.lists[pmcfull]["user"]) {
                            listname = "user@"+pmcfull;
                        } else if (body.lists[pmcfull]["discuss"]) {
                            listname = "discuss@"+pmcfull;
                        } else if (body.lists[pmcfull]["dev"]) {
                            listname = "dev@"+pmcfull;
                        }
                    }
                }
                cb(listname);
            });           
        } catch (error) {
            console.log(error);
            cb(listname);
        }    
    }
}
