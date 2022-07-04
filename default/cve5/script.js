var currentYear = new Date().getFullYear();
const defaultTimeout = 1000 * 60 * 60;

function hidepopups() {
    document.getElementById("userListPopup").open = false;
    document.getElementById("userStatsPopup").open = false;
}
    
function tweetJSON(event, link) {
    var j = mainTabGroup.getValue();
    if (!j) {
        event.preventDefault();
        return;
    }
    var id = j.cveMetadata.cveId;
   /* var cvelist = textUtil.deep_value(j, 'CNA_private.CVE_list');
    if (cvelist && cvelist.length > 0) {
        id = '';
    }*/
    var text = id + ' ' + getBestTitle(j.containers.cna);
    text = text.replace(/ +(?= )/g, '');
    link.href = 'https://twitter.com/intent/tweet?&text='
        + encodeURI(text)
        + '&url=' + encodeURI(textUtil.deep_value(j, 'containers.cna.references.0.url'));
    //    + '&hashtags=' + encodeURI(id)
    //via=vulnogram&hashtags=CVE
}

function loadCVE(value) {
    var realId = value.match(/(CVE-(\d{4})-(\d{1,12})(\d{3}))/);
    if (realId) {
        var id = realId[1];
        var year = realId[2];
        var bucket = realId[3];
        fetch('https://raw.githubusercontent.com/CVEProject/cvelistv5/master/review_set/' + year + '/' + bucket + 'xxx/' + id + '.json', {
                method: 'GET',
                credentials: 'omit',
                headers: {
                    'Accept': 'application/json, text/plain, */*'
                },
                redirect: 'error'
            })
            .then(function (response) {
                if (!response.ok) {
                    errMsg.textContent = "Failed to load valid CVE JSON";
                    infoMsg.textContent = "";
                    throw Error(id + ' ' + response.statusText);
                }
                return response.json();
            })
            .then(function (res) {
                if (res.dataVersion && res.dataVersion == '5.0') {
                    if(res.containers.cna.x_legacyV4Record) {
                        delete res.containers.cna.x_legacyV4Record;
                    }
                    if(res.containers) {
                        res = addRichTextCVE(res);
                        res = cvssv3_0_to_cvss3_1(res);
                    }
                    loadJSON(res, id, "Loaded "+id+" from GIT!");
                    addAutoButton();
                    mainTabGroup.change(0);
                } else {
                    errMsg.textContent = "Failed to load valid CVE JSON v 5.0 record";
                    infoMsg.textContent = "";
                }
            })
            .catch(function (error) {
                errMsg.textContent = error;
            })
    } else {
        errMsg.textContent = "CVE ID required";
    }
    /* 6 seconds aferwards clear all messages in errMsg and infoMsg divs*/
    setTimeout(function(){
        infoMsg.textContent = "";
        errMsg.textContent = "";
    },6000);
    return false;
}
function showAlert(msg, smallmsg, timer, showCancel) {
    if (showCancel) {
        document.getElementById("alertCancel").style.display = "inline-block";
    } else {
        var temp1 = document.getElementById("alertOk");
        temp1.setAttribute("onclick", "document.getElementById('alertDialog').close();");
        document.getElementById("alertCancel").style.display = "none";
    }
    document.getElementById("alertMessage").innerText = msg;
    if (smallmsg)
        document.getElementById("smallAlert").innerText = smallmsg;
    else
        document.getElementById("smallAlert").innerText = " ";
    if (!document.getElementById("alertDialog").hasAttribute("open"))
        document.getElementById("alertDialog").showModal();
    if (timer)
        setTimeout(function () {
            document.getElementById("alertDialog").close();
        }, timer);
}
async function draftEmail(event, link, renderId) {
    var subject = ''
    if (typeof (mainTabGroup) !== 'undefined') {
        var j = mainTabGroup.getValue();
        if (!j) {
            event.preventDefault();
            return;
        }
        var id = textUtil.deep_value(j, 'cveMetadata.cveId');
       /* var cvelist = textUtil.deep_value(j, 'CNA_private.CVE_list');
        if (cvelist && cvelist.length > 0) {
            id = '';
        }*/
        subject = id + ' ' + getBestTitle(j.containers.cna);
    } else {
        var t = document.getElementById(renderId).getElementsByTagName('h2')[0];
        if (t) {
            subject = t.textContent;
        }
    }
    var emailBody = document.getElementById(renderId).innerText;
    link.href = "mailto:?subject=" + encodeURI(subject) + '&body=' + encodeURI(emailBody);
};

var additionalTabs = {
    advisoryTab: {
        title: 'Advisory',
        setValue: async function (j) {
            if (pugRender && document.getElementById("render")) {
                var cve_list = textUtil.deep_value(j, 'CNA_private.CVE_list');
                if (cve_list && cve_list.length > 0) {
                    var cSet = new Set();
                    var cMap = {};
                    for (var d of cve_list) {
                        if (d.CVE) {
                            for (var x of d.CVE.match(/CVE-\d{4}-[a-zA-Z\d\._-]{4,}/igm)) {
                                cSet.add(x);
                                cMap[x] = {
                                    impact: '',
                                    summary: d.summary
                                }
                            }
                        }
                    }
                    if (cSet.size > 0) {
                        var r = await textUtil.getDocuments('nvd', Array.from(cSet), ['cve.CVE_data_meta', 'cve.description', 'impact']);
                        for (var c of r) {
                            var cveid = textUtil.deep_value(c, 'cve.CVE_data_meta.ID');
                            if (textUtil.deep_value(c, 'impact.baseMetricV3.cvssV3')) {
                                cMap[cveid].impact = {
                                    cvss: c.impact.baseMetricV3.cvssV3
                                };
                            } else if (textUtil.deep_value(c, 'impact.baseMetricV2.cvssV2')) {
                                cMap[cveid].impact = {
                                    cvss: c.impact.baseMetricV2.cvssV2
                                };
                            }
                            if (!cMap[cveid].summary) {
                                var title = textUtil.deep_value(c, 'cve.CVE_data_meta.TITLE');
                                cMap[cveid].summary = title ? title : textUtil.deep_value(c, 'cve.description.description_data')[0].value;
                            }
                            cSet.delete(cveid);
                        }
                        if (cSet.size > 0) {
                            var nr = await textUtil.getDocuments('cve', Array.from(cSet), ['body.CVE_data_meta', 'body.impact', 'body.description']);
                            for (c of nr) {
                                var cveid = textUtil.deep_value(c, 'body.CVE_data_meta.ID');
                                if (textUtil.deep_value(c, 'body.impact.cvss')) {
                                    cMap[cveid].impact = c.body.impact;
                                }
                                if (!cMap[cveid].summary) {
                                    var desc = textUtil.deep_value(c, 'body.description.description_data')[0].value;
                                    cMap[cveid].summary = desc ? desc : textUtil.deep_value(c, 'body.CVE_data_meta.TITLE');
                                }
                            }
                        }
                        document.getElementById("render").innerHTML = pugRender({
                            renderTemplate: 'page',
                            doc: j,
                            cmap: cMap,
                        });
                    } else {
                        document.getElementById("render").innerHTML = pugRender({
                            renderTemplate: 'page',
                            doc: j
                        });
                    }
                } else {
                    document.getElementById("render").innerHTML = pugRender({
                        renderTemplate: 'page',
                        doc: j
                    });
                }
            }
        }
    },
    mitreTab: {
        title: 'MITRE-Preview',
        setValue: function (j) {
            document.getElementById("mitreweb").innerHTML = pugRender({
                renderTemplate: 'mitre',
                doc: j
            });
        }
    },
    cveApiTab: {
        title: 'CVE Org',
        setValue: function() {

        }
    }
}

/* fullname = vendor . product . platforms . module .others 
/* table --> [ fullname ][version][affected|unaffected|unknown] = [ list of ranges ] */
function versionStatusTable5(affected) {
    var t = {};
    nameAndPlatforms = {};
    var showCols = {
        platforms: false,
        modules: false,
        affected: false,
        unaffected: false,
        unknown: false
    };
    for(var p of affected) {
        var pname = p.product ? p.product : p.packageName ? p.packageName : '';
        if (p.platforms)
            showCols.platforms = true;
        if (p.modules)
            showCols.modules = true;
        if (p.status)
            showCols[p.status] = true;
        var platforms =
            (p.platforms ? p.platforms.join(', '): '');
        var others = {};
        if(p.collectionURL) {
            others.collectionURL = p.collectionURL;
        }
        if(p.repo) {
            others.repo = p.repo;
        }
        if(p.programFiles) {
            others.programFiles = p.programFiles;
        }
        if(p.programRoutines) {
            others.programRoutines = p.programRoutines;
        }
        //pname = pname + platforms;
        var modules = p.modules ? p.modules.join(', ') : '';
        if(p.versions) {
            for(v of p.versions) {
                var rows = {
                    affected: [],
                    unaffected: [],
                    unknown: []
                };
                //var major = v.version != 'unspecified' ? v.version: undefined;//? v.version.match(/^(.*)\./): null;
                var major = undefined;//major ? major[1] : '';
                var pFullName = [(p.vendor ? p.vendor + ' ' : '') + pname + (major ? ' ' + major : ''), platforms, modules, others];
                nameAndPlatforms[pFullName] = pFullName;
                if (v.version) {
                    showCols[v.status] = true;
                    if(!v.changes) {
                        if(v.lessThan) {
                            rows[v.status].push('>= ' + v.version + ' to < ' + v.lessThan);
                        } else if(v.lessThanOrEqual) {
                            rows[v.status].push('>= ' + v.version + ' to <= ' + v.lessThanOrEqual);
                        } else {
                            rows[v.status].push('= ' + v.version);
                        }
                    } else {
                        var prevStatus = v.status;
                        var prevVersion = v.version;
                        for(c of v.changes) {
                            showCols[c.status] = true;
                            rows[prevStatus].push('>= ' + prevVersion + ' to < ' + c.at);
                            prevStatus = c.status;
                            prevVersion = c.at;
                        }
                        if(v.lessThan) {
                            rows[prevStatus].push('>= ' + prevVersion + (v.lessThan != prevVersion ? ' to < ' + v.lessThan : ''));
                        } else if(v.lessThanOrEqual) {
                            rows[prevStatus].push('>= ' + prevVersion + (v.lessThanOrEqual != prevVersion ? ' to < ' + v.lessThanOrEqual : ''));
                        } else {
                            rows[prevStatus].push(">=" + prevVersion);
                        }                  
                    }
                }
                if(!t[pFullName]) t[pFullName] = [];
                //if(!t[pFullName][v.version]) t[pFullName][v.version] = [];
                t[pFullName].push(rows);
            }
        }
        var pFullName = [(p.vendor ? p.vendor + ' ' : '') + pname + (major ? ' ' + major : ''), platforms, modules, others];
        nameAndPlatforms[pFullName] = pFullName;
        var rows = {};
    }
    return({groups:nameAndPlatforms, vals:t, show: showCols});
}


function getProductAffected(cve) {
    var lines = [];
    for (var vendor of cve.affected.vendors) {
        var pstring = [];
        for (var product of vendor.products) {
            var versions = {};
            var includePlatforms = true;
            var platforms = {};
            for (var version of product.versions) {
                if (version.version_affected && version.version_affected.indexOf('!') < 0 && version.version_affected.indexOf('?') < 0) {
                    versions[version.version_name] = 1;
                    if (version.platform == "all" || version.platform == "") {
                        includePlatforms = false;
                    }
                    if (includePlatforms && version.platform) {
                        var ps = version.platform.split(',');
                        for (var p of ps) {
                            platforms[p.trim()] = true;
                        }
                    }
                }
            }
            pstring.push('This issue affects ' + product.product_name + ' ' +
                Object.keys(versions).sort().join(", ") + '.');
            if (includePlatforms && (Object.keys(platforms).length > 0)) {
                pstring.push('Affected platforms: ' + Object.keys(platforms).sort().join(', ') + '.');
            }
        }
        lines.push(pstring.join(" "));
    }
    return lines.join();
};

function domhtml(html) {
    text = htmltoText(html) || "";
    let doc = new DOMParser().parseFromString('<pre>' + text + '</pre>', 'text/html');
    var ret = doc.body.innerText || "";
    return ret;
}

function htmltoText(html) {
    if (html) {
        let text = html;
        //text = text.replace(/\n/gi, "");
        text = text.replace(/<style([\s\S]*?)<\/style>/gi, "");
        text = text.replace(/<script([\s\S]*?)<\/script>/gi, "");
        text = text.replace(/<a.*?href="(.*?)[\?\"].*?>(.*?)<\/a.*?>/gi, " $2 $1 ");
        text = text.replace(/<\/div>/gi, "\n\n");
        text = text.replace(/<\/li>/gi, "\n");
        text = text.replace(/<li.*?>/gi, "  *  ");
        text = text.replace(/<\/ul>/gi, "\n\n");
        text = text.replace(/<\/p>/gi, "\n\n");
        text = text.replace(/<br\s*[\/]?>/gi, "\n");
        text = text.replace(/<[^>]+>/gi, "");
        //text = text.replace(/^\s*/gim, "");
        //text = text.replace(/ ,/gi, ",");
        //text = text.replace(/ +/gi, " ");
        //text = text.replace(/\n\n/gi, "\n");
        return text;
    }
};
function getProblemTypeString(o) {
    var pts = [];
    for (var j = 0; j < o.problemTypes.length; j++) {
        for (var k = 0; k < o.problemTypes[j].descriptions.length; k++) {
            if (o.problemTypes[j].descriptions[k].lang == "en") {
                var pt = o.problemTypes[j].descriptions[k].description;
                if (pt) {
                    pts.push(pt.replace(/^CWE-[0-9 ]+/, ''));
                }
            }
        }
    }
    return pts.join(', ');
};
function getProductList(cna) {
    var lines = [];
    for (var p of cna.affected) {
        lines.push(p.product);
    }
    return lines.join("; ");
};
function getBestTitle(o) {
    var title = o.providerMetadata.title;
    if (!title) {
        title = getProblemTypeString(o) + ' vulnerability in ' + getProductList(o);
    }
    return title;
};

document.addEventListener("click", function (e) {
    var popup = document.querySelector(".popup");
    if(popup) {
        var insideTooltip = popup.contains(e.target);
        if (!insideTooltip) {
            popup.removeAttribute("open");
        }
    }
});


function addAutoButton() {
    docEditor.on('ready', function(){
            var autoButton = document.createElement('button');
            autoButton.className = 'btn sfe indent vgi-magic';
            autoButton.innerText = 'Auto Generate';
            autoButton.addEventListener('click', autoText);
            docEditor.getEditor("root.containers.cna.descriptions").header.appendChild(autoButton)
    });
}

async function autoText(event) {
    if(event) {
        event.preventDefault();
    }
    var doc = docEditor.getValue();
    var text = cveRender({
        ctemplate: 'autoText',
        con: doc.containers.cna
    });
    // remove extra spaces
    text = text.trim().replaceAll(/\s+/g, ' ');
    hE = await docEditor.getEditor('root.containers.cna.descriptions.0.supportingMedia.0.value');
    
    // Capitolize sentances.
    var rg = /(^\w{1}|\.\s*\w{1})/gi;
    text = text.replace(rg, function(toReplace) {
        return toReplace.toUpperCase();
    });
    hE.setValue(text, '', false);
}

var cveClient;
var cveApi = {
    user: null,
    org: null,
}
var preLogin = "";

function resetClient() {
    if(cveClient != null) {
    cveClient.logout();
    cveClient = null;
    }
    cveApi = {
        user: null,
        org: null
    }
    window.localStorage.removeItem('cveApi');
    document.getElementById('cvePortal').innerHTML = cveRender({
        ctemplate: 'cveLoginBox',
        prevPortal: window.localStorage.getItem('portalType'),
        prevOrg: window.localStorage.getItem('shortName')
    })
}


/*
checks if an existing CVE Services session is active 
returns orgInfo if true
*/ 
async function checkSession() {
    if('serviceWorker' in navigator) {
        if(window.localStorage.getItem('cveApi')) {
            cveApi = JSON.parse(window.localStorage.getItem('cveApi'));
            cveClient = new CveServices(cveApi.url, "./static/cve5sw.js");
            var o = false;
            try{
                o = await cveClient.getOrgInfo();
            } catch(e) {
                console.log(e);
		        //cveShowError('Error generated! Please see console log for details.');
            }
            return o;
        }
    } else {
        cveShowError('Browser not supported!');
    }
    return false;
}


async function cveLogin(elem, credForm) {
    if(document.getElementById("loginErr")) {
        document.getElementById("loginErr").innerText = '';
    }    
    var org = await checkSession();
    if(org) {
        // already logged in do nothing?
	await cveGetList();	
    } else {
        if(!credForm.checkValidity()) {
            return(false);
        }
        elem.preventDefault();
        var URL=credForm.portal.value;
        var type = credForm.portal.options[credForm.portal.selectedIndex].text;

        try {
            if(!cveClient) {
                cveClient = new CveServices(URL, "./static/cve5sw.js");
            }
            var ret = await cveClient.login(
                credForm.user.value,
                credForm.org.value,
                credForm.key.value);
            console.log('Login result ',ret);
            //todo show error if not logged in

            var org = await cveClient.getOrgInfo();
            //console.log(org);
            var userInfo = await cveClient.getOrgUser(credForm.user.value);

            document.getElementById('cvePortal').innerHTML = cveRender({
                portalType: type,
                portalURL: URL,
                ctemplate: 'portal',
                userInfo:userInfo,
                org:org
            });
            cveApi.user = credForm.user.value;
            cveApi.url = URL;
            cveApi.apiType = type;
            window.localStorage.setItem('cveApi', JSON.stringify(cveApi));
            window.localStorage.setItem('portalType', type);
            window.localStorage.setItem('shortName', credForm.org.value);
	    if(ret == 'ok' || ret.data == "ok") {
		    cveApi.keyUrl = ret.keyUrl;
		    //window.localStorage.setItem('cveApi', JSON.stringify(cveApi));
		await cveGetList();
		/* Moved one hour session timeout to here as serviceWorker not reliable in
		   serviceWorker */
		setTimeout(cveLogout,defaultTimeout);
	    } else {
                document.getElementById("loginErr").innerText = 'Failed to login: Possibly invalid credentials!';
		        console.log(ret);
	    }
	    infoMsg.textContent = "Login Success!";
	    errMsg.textContent = "";
        } catch(e) {
            if(e == '401') {
                if(document.getElementById("loginErr")) {
                    document.getElementById("loginErr").innerText = 'Failed to login: Invalid credentials!';
                }
            } else {
                //console.log(e);
		        cveShowError(e);
            }
	    errMsg.textContent = "Login Failed!";
	    infoMsg.textContent = "";
        }
    }
}

async function cveLogout() {
    resetClient();
}

async function userlistUpdate(elem, event){
    // todo: refactor checking for session, and redirecting to login window.
    if (elem.open) {
	document.getElementById("userStatsPopup").open = false;
        var org = await checkSession();
        if(org && cveClient) {
            try {
                var ret = await cveClient.getOrgUsers();
                var userlist = document.getElementById('userlist');
                if(userlist) {
                    userlist.innerHTML = cveRender({
                        ctemplate: 'listUsers',
                        users: ret.users
                    })
                }
            } catch (e) {
                //console.log(e);
		        cveShowError(e);
            }
        } else {
            cveShowError('Please login to CVE Portal. Your session may have expired!');
        }
    }
}

async function cveUserKeyReset(elem, confirm) {
    var u = elem.form.u.value;
    var org = await checkSession();
    var temp1 = document.getElementById("alertOk");
    if (confirm) {
        temp1.setAttribute("onclick", "document.getElementById('alertDialog').close();");
        elem.removeAttribute('id');
        document.getElementById('alertDialog').close();
    } else {
        showAlert("Are you sure?", "A new API key will be generated for user " + u + "! The old API key will no longer work!", undefined, true);
        let randid = Math.random().toString(32).substring(2);
        elem.setAttribute('id', randid);
        temp1.setAttribute('u', u);
        temp1.setAttribute('onclick', 'cveUserKeyReset(document.getElementById("' + randid + '"),true)');
        return;
    }
	
    if (cveClient) {
        try {
            var ret = await cveClient.resetOrgUserApiKey(u);
            if(ret["API-secret"]) {
		var msg = "API Key was reset for "+u+"!";
                if(cveApi.user == u) {
                    msg += " You will need to login again with the new key!";
                    cveLogout();
                }
                document.getElementById("userMessage").innerText = msg;
                document.getElementById("secretDialogForm").pass.value = ret["API-secret"];
                document.getElementById("secretDialogForm").pass.type = "password";
                document.getElementById("secretDialog").showModal();
            } 
        } catch(e) {
            //console.log(e);
	        cveShowError(e);
        }
    } else {
        cveShowError('Please login to CVE Portal. Your session may have expired!');
    }  
}


async function cveUpdateUser(f) {
    try {
        params = {
            "name.first": f.first.value,
            "name.last":  f.last.value
        };
        if(f.u.value != f.new_username.value) {
            params.new_username = f.new_username.value
        }
        if (cveApi.user != f.u.value) {
            params.active = f.active.checked;
            if(f.admin.checked) {
                params["active_roles.add"]= 'ADMIN'
            } else {
                params["active_roles.remove"]= 'ADMIN'
            }
        }
    
        var ret = await cveClient.updateOrgUser(f.u.value, params);
        if(ret.updated) {
            document.getElementById("userEditDialog").close();
            if(document.getElementById("userListPopup")) {
                userlistUpdate(document.getElementById("userListPopup"));
            }
            //the current user is updating self
            if((cveApi.user == f.u.value) && document.getElementById("cveUser")) {
                if(cveApi.user != ret.updated.username) {
                    cveShowError({error:'Username changed!', message:'Username successfully changed to '+ ret.updated.username +'! You will need to login again!'});
                    cveLogout();
                    return;
                }
                document.getElementById("cveUser").innerHTML = 
                cveRender({
                    ctemplate: 'userstats',
                    userInfo: ret.updated,
                    org: await cveClient.getOrgInfo()
                })
            }
        }
    } catch(e) {
        cveShowError(e);
    }
}

function removeErrors() {
    Array.from(document.getElementsByClassName('formError')).forEach(x => x.remove());
}
function addError(el) {
    var div = document.createElement('div');
    div.classList.add('formError');
    div.innerHTML = "Please provide a valid data";
    div.setAttribute('onclick','this.remove(); return false;');
    el.setAttribute('onfocus','removeErrors()');
    el.after(div);
}
function validateForm(f) {
    let isvalid = true;
    f.elements.forEach(x => {
	if(!isvalid)
	    return;
	/* Needed is an alias for required to avoid showing
	   red boxes unless a submit event is initiated. */
	if(x.getAttribute("needed"))
	    x.setAttribute("required","required");
	if ('validity' in x) {
	    if ('valid' in x.validity) {
		isvalid = x.validity.valid;
		if(!isvalid)
		    addError(x);
	    }
	}
    });
    return isvalid;
}

async function cveUserEdit(elem) {
    f = document.getElementById('userEditForm');
    f.u.value = elem.getAttribute('u');
    f.new_username.value = elem.getAttribute('u');
    f.first.value = elem.getAttribute('f');
    f.last.value = elem.getAttribute('l');
    f.admin.checked = elem.getAttribute('ad') ? true : false;
    f.active.checked = elem.getAttribute('ac') ? true : false;
    if(cveApi.user == f.u.value) {
        if (!elem.getAttribute('ad')) {
            f.new_username.disabled = true;
        }
        f.admin.parentElement.setAttribute('class', 'hid');
        f.admin.setAttribute('disabled', true);
        f.active.setAttribute('disabled', true);
    } else {
        f.admin.parentElement.removeAttribute('class');
        f.admin.removeAttribute('disabled');
        f.active.removeAttribute('disabled');
    }
    document.getElementById('userEditDialog').showModal();
}

async function cveAddUser(f) {
    var org = await checkSession();
    if (org && cveClient && validateForm(f)) {
        try {
	    var ret = await cveClient.createOrgUser({
                "username": f.new_username.value,
                "name": {
		    "first": f.first.value,
		    "last":  f.last.value
                },
                "authority": {
		    "active_roles": [
                        "ADMIN"
		    ]
                }
	    });
	    if(ret.created && ret.created.secret) {
                document.getElementById('userAddDialog').close();
                document.getElementById("secretDialogForm").pass.value = ret.created.secret;
                document.getElementById("secretDialogForm").pass.type = "password";
                document.getElementById("secretDialog").showModal();
                document.getElementById("userMessage").innerText = ret.message;
                f.reset()
                userlistUpdate({open:true});
	    }
        } catch (e) {
	        //console.log(e);
	        cveShowError(e);
        }

    } else {
        cveShowError('Please login to CVE Portal. Your session may have expired!');
    }
}

async function cveOrgUpdate() {
    cveShowError('To be done');
}
async function cveRenderList(l, refreshEditor) {
    if (l && document.getElementById('cveList')) {
        document.getElementById('cveList').innerHTML = cveRender({
            ctemplate: 'listIds',
            cveIds: l,
            editable: (cveApi.apiType == 'test')
        })
        if(l.length > 0) {
            new Tablesort(document.getElementById('cveListTable'));
        }
        if(refreshEditor) {
            docSchema.definitions.cveId.examples = l.map(i=>i.cve_id);
            editorSetCveDatalist(l);
        }
        var editableList = document.getElementById('editablelist');
        if(editableList) {
            editableList.innerHTML = cveRender({
                ctemplate: 'editables',
                cveIds: l
            })
        }
    }
}
async function editorSetCveDatalist(l) {
    document.getElementById('root.cveMetadata.cveId-datalist').innerHTML = cveRender({
        ctemplate: 'reserveds',
        cveIds: l
    })
}
function paginate(a) {
    let el = document.getElementById('cvePage');
    if(!el) {
	console.log("Error cannot find template ");
	console.log(a);
	return false;
    }
    let cp = parseInt(el.getAttribute('data-page'));
    if(isNaN(cp)) {
	console.log("The data-page element is not pareable ");
	console.log(cp);
	return galse;
    }
    let np = cp + parseInt(a);
    var cveForm = document.getElementById("cvePortalFilter");
    cveForm.page = np;
    cveGetList();
    return false;
}
//var collator = new Intl.Collator(undefined, {numeric: true});
async function pageShow(ret) {
    let el = document.getElementById('cvePage');
    if(!el) {
	console.log("Error cannot find template ");
	console.log(ret);
	return;
    }
    el.style.display = 'block';
    el.setAttribute('data-page', ret.currentPage);
    let start = (ret.currentPage - 1) * ret.itemsPerPage + 1;
    let end = start + ret.itemsPerPage - 1;
    let total = ret.totalCount;
    if(end > total)
	end = total;
    document.getElementById('cvePageInfo').innerHTML = "Showing " +
	String(start) + " to " + String(end) + " of " +
	String(total) + " records "
    document.getElementById('currentPage').innerHTML = ret.currentPage
    if(ret.prevPage)
	document.getElementById('prevPage').style.display = 'block';
    else
	document.getElementById('prevPage').style.display = 'none';	
    if(ret.nextPage)
	document.getElementById('nextPage').style.display = 'block';
    else
	document.getElementById('nextPage').style.display = 'none'; 
}

async function cveShowError(err) {
    if((err.error == 'NO_SESSION' || err.error ==  "Not logged in"|| cveClient == null || await cveClient._middleware.worker == null)) {
        cveLogout();
        mainTabGroup.focus(4);
    }
    document.getElementById('cveErrors').innerHTML = cveRender({
        ctemplate: 'cveErrors',
        err: err
    })
    document.getElementById('cveErrorsModal').showModal();
}

async function cveGetList() {
    var org = await checkSession();
    if (cveClient) {
        var currentReserved = true;
        var filter = {
            state: 'RESERVED',
            cve_id_year: currentYear
        }
        var cveForm = document.getElementById("cvePortalFilter");
        if(cveForm) {
            if(cveForm.fstate) {
                if(cveForm.fstate.value) {
                    filter.state = cveForm.fstate.value + '';
                    if (filter.state != 'RESERVED') {
                        currentReserved = false;
                    }
                } else {
                    delete filter.state;
                }
            }
            if(cveForm.y) {
                filter.cve_id_year = cveForm.y.value + '';
                if(filter.cve_id_year != currentYear) {
                    currentReserved = false;
                }
            }
            if(cveForm.page) {
                filter.page = cveForm.page;
            }
        }
        if (document.getElementById('cveList')) {
            document.getElementById('cveList').innerHTML = '<center><div class="spinner"></div></center>';
        }
        try {
            var ret = await cveClient.getCveIds(filter);
            if (ret.error) {
                cveShowError(ret);
            } else {
                var idList = [];
                var idState = {};
                if (ret && ret.cve_ids) {
                    idList = ret.cve_ids;
                    idList = idList.sort((b, a) => (a.reserved > b.reserved) ? 1 : ((b.reserved > a.reserved) ? -1 : 0));
                    for (var i = 0; i < idList.length; i++) {
                        idState[idList[i].cve_id] = idList[i].state;
                    }
                }
                cveRenderList(idList, currentReserved);
                if (ret && (ret.nextPage || ret.prevPage)) {
                    pageShow(ret);
                } else {
                    let el = document.getElementById('cvePage');
                    if (el) {
                        el.removeAttribute('data-page');
                        el.style.display = 'none';
                    }
                    if (cveForm)
                        cveForm.page = 0;
                }
                return idList;
            }
        } catch (e) {
            cveShowError(e);
            cveRenderList([]);
            return ([]);
        }
    } else {
        cveShowError('Please login to CVE Portal');
    }
}

async function cveReserve(yearOffset, number) {
    var org = await checkSession();
    if (cveClient) {
        var year = currentYear + (yearOffset ? yearOffset : 0);
        try {
            var args = {
                amount: number > 0 && number <= 50 ? number : 1,
                // Request only one at this time to get four digits! Requesting more at time gives the 5 digit ids.
                // batch_type: 'nonsequential',
                cve_year: year,
                short_name: org.short_name
            };
            if(number > 1) {
                args.batch_type = 'sequential';
            }
            var json = await cveClient.reserveCveIds(args);
            return json.cve_ids;
        } catch (e) {
            cveShowError(e.message);
        }
    } else {
        cveShowError('Please login to CVE Portal. Your session may have expired!');
    }
}

async function cveSelectLoad(event) {
    event.preventDefault();
    var org = await checkSession();
    if(cveClient){
        cveLoad(event.target.elements.id.value)
    } else {
        cveShowError('Please login to CVE Portal. Your session may have expired!');
    }
    return false;
}

function addRichText(d) {
    var ht = '';
    if(d.value) {
        ht = cveRender({
            ctemplate: 'htext',
            t: d.value
        })
    }
    if(!d.supportingMedia) {
        d.supportingMedia = [
            {
                type: "text/html",
                base64: false,
                value: ht
            }
        ]
    }
    return d;
}

function addRichTextArray(j) {
    if(j && j.length> 0){
        j.forEach(element => addRichText(element));
    }
}

function addRichTextCVE(j) {
    var htmlFields = [
        'descriptions',
        'solutions',
        'workarounds',
        'exploits',
        'configurations'
    ];

    if(j && j.containers.cna) {
        var cna = j.containers.cna
        htmlFields.forEach(element => {
            addRichTextArray(cna[element])
        });
    }
    return j;
}

function cvssv3_0_to_cvss3_1(j) {
    if(j && j.containers && j.containers.cna && j.containers.cna.metrics) {
        j.containers.cna.metrics.forEach(m => {
            if(m.cvssV3_0) {
                m.cvssV3_1 = m.cvssV3_0;
                m.cvssV3_1.version = "3.1";
                if(m.cvssV3_1.vectorString) {
                    m.cvssV3_1.vectorString = m.cvssV3_1.vectorString.replace('CVSS:3.0', 'CVSS:3.1');
                }
                delete m.cvssV3_0;
            }
        });
    }
    return j
}

async function loadCVEFile(event, elem) {
    var file = elem.files[0];
    if (file) {
        try{
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                try{
                    res = JSON.parse(evt.target.result);
                    res = addRichTextCVE(res);
                    res = cvssv3_0_to_cvss3_1(res);
                    //docEditor.setValue(res);
                    loadJSON(res, null, "Imported file");
                    addAutoButton();
                } catch (e) {
                    showAlert(e);
                }
            };
            reader.onerror = function (evt) {
                errMsg.textContent = "Error reading file";
                showAlert('Error reading file!');
            };
        } catch (e) {
            showAlert(e);
        }
    }
}

async function cveLoad(cveId) {
    var org = await checkSession();
    if (cveClient) {
        try{
            var res = await cveClient.getCve(cveId);
            if (res.cveMetadata) {
                //cveApi.state[cveId] = res.cveMetadata.state;
                if(res.containers) {
                    res = addRichTextCVE(res);
                    res = cvssv3_0_to_cvss3_1(res);
                } else {
                    console.log('no containers');
                }

                loadJSON(res, cveId, "Loaded " + cveId + " from CVE.org API!");
                console.log(res);
/*                if(res.cveMetadata.state == "REJECTED") {
                    console.log('rejected');
                    docEditor.root_container.childNodes[1].childNodes[1].selected = true;
                    docEditor.root_container.childNodes[1].dispatchEvent(new Event ('change'))
                }*/
                addAutoButton();
                mainTabGroup.change(0);
                return res;
            } else {
                console.log(res);
                errMsg.textContent = "Failed to load valid CVE Record";
                infoMsg.textContent = "";
            }
        } catch(e) {
            if(e == '404' || e.error == 'CVE_RECORD_DNE') {
                var skeleton = {
                    "cveMetadata": {
                      "cveId": cveId,
                      "assigner": cveApi.org ? cveApi.org.UUID : "",
                    }
                };
                try{
                    var res = await cveClient.getCveId(cveId);
                    if(res.state == 'RESERVED') {
                        skeleton.cveMetadata.state = "PUBLISHED";
                    } else if (res.state == 'REJECTED') {
                        skeleton.cveMetadata.state = "REJECTED";
                    } else {
                        return {};
                    }
                    loadJSON(skeleton, cveId, "Loaded " + cveId);
                    addAutoButton();
                    mainTabGroup.change(0);
                    return skeleton;
                } catch(e2) {
                    if(e2 == '404') {
                        showAlert('CVE Not found!');
                    }
                }
            } else {
                //console.log(e);
		        showAlert('Error getting the record.' + e);
            }
        }
    } else {
        cveShowError('Please login to CVE portal');
    }
}

async function cveReject(elem, event) {
    var id = elem.getAttribute('data');
    if(window.confirm('Do you want to reject ' + id + '? It cannot be undone!')) {
        var org = await checkSession();
        console.log('org:' + org);
        if(cveClient) {
            var ret = await cveClient.updateCveId(id, 'REJECTED', org.short_name);
            if(ret.updated && ret.updated.state == 'REJECTED') {
                var m = document.getElementById("cveStatusMessage");
                m.innerText = "Rejected " + id;
                await cveGetList();
            }
        }
    }
}
function lock_unlock(el,tf) {
    if(tf) {
	el.style.opacity = 0.1;
	el.disabled = true;
    } else {
	el.style.opacity = 1.0;
	el.disabled = false;	
    }
}
async function cvePost() {
    lock_unlock(document.getElementById('post1'),true);
    if (docEditor.validation_results && docEditor.validation_results.length == 0) {
        /*if (save != undefined) {
            await save();
        }*/
        var org = await checkSession();
        if (cveClient) {
            if (cveApi.apiType === 'test') {
                //console.log('uploading...');
                var j = await mainTabGroup.getValue();
                var j = textUtil.reduceJSON(j);
                var ret = null;
                try {
                    var latestId = await cveClient.getCveId(j.cveMetadata.cveId);
                    if (latestId.state == 'RESERVED') {
                        //console.log('Creating');
                        if(j.cveMetadata.state == 'PUBLISHED') {
                            ret = await cveClient.createCve(j.cveMetadata.cveId, { cnaContainer: j.containers.cna });
                        } else if (j.cveMetadata.state == 'REJECTED') {
                            ret = await cveClient.createRejectedCve(j.cveMetadata.cveId, { cnaContainer: j.containers.cna });
                        }
                    } else {
                        //console.log('uploading');
                        if(j.cveMetadata.state == 'PUBLISHED') {
                            ret = await cveClient.updateCve(j.cveMetadata.cveId, { cnaContainer: j.containers.cna });
                        } else if (j.cveMetadata.state == 'REJECTED') {
                            ret = await cveClient.updateRejectedCve(j.cveMetadata.cveId, { cnaContainer: j.containers.cna });
                        }
                    }
		    lock_unlock(document.getElementById('post1'),false);
                } catch (e) {
                    //console.log('Got error');
                    //console.log(e);
		    lock_unlock(document.getElementById('post1'),false);
                    if (e.error) {
                        infoMsg.innerText = "";
                        errMsg.innerText = "Error publishing CVE";
                        if (e.details && e.details.errors) {
                            showJSONerrors(e.details.errors.map(
                                a => {
                                    return ({
                                        path: a.instancePath,
                                        message: a.message
                                    });
                                }
                            ));
                        } else {
                            //console.log(e);
                            cveShowError(e);
                        }
                        //cveShowError(e);
                    } else {
                        showAlert('Error publishing! Got error ' + e)
                    }
                }
                //console.log(ret);
                if (ret != null && ret.message) {
                    //if(ret && ret.cveMetadata && ret.cveMetadata.state)
                    //    cveApi.state[j.cveMetadata.cveId] = ret.cveMetadata.state;
                    infoMsg.innerText = ret.message;
                    hideJSONerrors();
                }
            } else {
                showAlert('CVE posting is not currently supported by production CVE services! Try Logging to Test Portal instance');
            }
        } else {
            //todo enable/disable post button
	    lock_unlock(document.getElementById('post1'),false);	    
            cveShowError('Please login to CVE Test Portal');
        }
    } else {
        showAlert('Please fix errors before posting');
	lock_unlock(document.getElementById('post1'),false);
    }
}

async function cveReserveAndRender(yearOffset, number) {
    var org = await checkSession();
    if (cveClient) {
        var r = await cveReserve(yearOffset, number);
        var m = document.getElementById("cveStatusMessage");
        if(m && r && r.length > 0) {
            m.innerText = "Got " + r.map(x=>x.cve_id).join(', ');
        } else {
            m.innerText = "Failed to get a CVE ID";
        }
        cvePortalFilter.reset();
        await cveGetList();
        return r;
    } else {
        cveShowError('Please login to CVE Portal. Your session may have expired!');
    }
}
