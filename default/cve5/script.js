function tweetJSON(event, link) {
    var j = mainTabGroup.getValue();
    if (!j) {
        event.preventDefault();
        return;
    }
    var id = j.cveMetadata.id;
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

async function draftEmail(event, link, renderId) {
    var subject = ''
    if (typeof (mainTabGroup) !== 'undefined') {
        var j = mainTabGroup.getValue();
        if (!j) {
            event.preventDefault();
            return;
        }
        var id = textUtil.deep_value(j, 'cveMetadata.id');
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
    jsonTab: {
        title: 'CVE-JSON',
        setValue: function (j) {
            document.getElementById("outjson").textContent = textUtil.getMITREJSON(textUtil.reduceJSON(j));
        }
    },
    cveApiTab: {
        title: 'CVE Org',
        setValue: function() {
            if(cveApi && cveApi.list) {
                cveRenderList(cveApi.list);
            }
        }
    }
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
    //console.log(html + '\n' + text + '\n' + ret);
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

/*
var autoButton = document.getElementById('auto');

autoButton.addEventListener('click', function (event) {
        event.preventDefault();
        var d = docEditor.getEditor('root.description.description_data');
        var docJSON = docEditor.getValue();
        var desc = d.getValue();
        if (d) {
            var i = desc.length;
            while (i--) {
                if (desc[i].value.length === 0) {
                    desc.splice(i, 1);
                }
            }
            var ptstring = textUtil.getProblemTypeString(docJSON);
            if (ptstring.length == 0) {
                ptstring = "A"
            }
            desc.push({
                lang: "eng",
                value: ptstring + " vulnerability in ____COMPONENT____ of " + textUtil.getProductList(docJSON) +
                    " allows ____ATTACKER/ATTACK____ to cause ____IMPACT____."
            });
            desc.push({
                lang: "eng",
                value: textUtil.getAffectedProductString(docJSON)
            });
            d.setValue(desc);
        } else {

        }
    });
*/
var cveClient;
var cveApi = {
    user: null,
    uuid: null,
    org: null,
    list: null,
    state: {}
}

async function cveLogin() {
    if (!cveClient) {
        cveClient = new CveServices('https://cveawg-test.mitre.org/api');
        cveApi.user = await cveClient._request.userName;
        cveApi.short_name = await cveClient._request.orgName;
        cveApi.org = await cveClient.getOrgInfo();
        cveApi.userInfo = await cveClient.getOrgUser(cveApi.user);
        var pid = docEditor.getEditor('root.containers.cna.providerMetadata.id');
        if (pid && pid.getValue() == '00000000-0000-4000-9000-000000000000') {
            pid.setValue(cveApi.org.UUID);
        }
        var aid = docEditor.getEditor('root.cveMetadata.assigner');
        if (aid && aid.getValue() == '00000000-0000-4000-9000-000000000000') {
            aid.setValue(cveApi.org.UUID);
        }
        document.getElementById('cveUser').innerHTML = cveRender({
            ctemplate: 'userstats',
            userInfo: cveApi.userInfo,
            org: cveApi.org
        });
        await cveGetList(cveClient);
        window.sessionStorage.cveApi = JSON.stringify(cveApi);
    }
}

async function cveRenderList(l) {
    if (l) {
        document.getElementById('cveList').innerHTML = cveRender({
            ctemplate: 'listIds',
            cveIds: l
        })
        docSchema.definitions.cveId.examples = l.map(i=>i.cve_id);
        document.getElementById('root.cveMetadata.id-datalist').innerHTML = cveRender({
            ctemplate: 'reserveds',
            cveIds: l
        })
        var editableList = document.getElementById('editablelist');
        if(editableList) {
            editableList.innerHTML = cveRender({
                ctemplate: 'editables',
                cveIds: l
            })
        }        
    }
}
async function cveGetList() {
    if(cveClient) {
        var json = await cveClient.getCveIds();
        cveApi.list = json;
        for(var i=0; i< json.length; i++) {
            cveApi.state[json[i].cve_id] = json[i].state;
        }
        cveRenderList(json);
    } else {
        alert('Login to CVE.org first');
    }
}

async function cveReserve() {
    if (cveClient) {
        var year = new Date().getFullYear();
        try {
            var json = await cveClient.reserveCveIds({
                amount: 1,
                cve_year: year,
                short_name: cveApi.short_name
            });
            console.log(json);
            return json;
        } catch (e) {
            console.log(e);
        }
    } else {
        alert('Login to CVE.org first');
    }
}

async function cveSelectLoad(event) {
    event.preventDefault();
    if(cveClient){
    cveLoad(event.target.elements.id.value)
    } else {
        alert('Please login to CVE');
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
};

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
        'exploits'
    ];
    if(j && j.containers.cna) {
        var cna = j.containers.cna
        htmlFields.forEach(element => addRichTextArray(cna[element]));
    }
    return j;
}

async function cveLoad(cveId) {
    if(cveApi.state && cveApi.state[cveId] == 'RESERVED') {
        var res = {
            "dataType": "CVE_RECORD",
            "dataVersion": "5.0",
            "cveMetadata": {
              "id": cveId,
              "assigner": cveApi.org ? cveApi.org.UUID : "",
              "state": "RESERVED"
            },
            "descriptions": [
              {
                "lang": "en",
                "value": "",
                "supportingMedia": [
                  {
                    "type": "text/html",
                    "base64": false
                  }
                ]
              }
            ]
        };
        cveApi.state[cveId] = 'RESERVED';
        //defaultTabs.editorTab.setValue(res);
        loadJSON(res, cveId, "Loaded " + cveId);
        mainTabGroup.change(0);
        return res;
    } else {
        if(cveClient) {
            var res = await cveClient.getCve(cveId);
            if (res.cveMetadata) {
                //defaultTabs.editorTab.setValue(res);
                cveApi.state[cveId] = res.cveMetadata.state;
                loadJSON(addRichTextCVE(res), cveId, "Loaded " + cveId + " from CVE.org!");
                mainTabGroup.change(0);
                return res;
            } else {
                errMsg.textContent = "Failed to load valid CVE Record";
                infoMsg.textContent = "";
            }
        } else {
            alert('Please login to CVE.org!');
        }
    }
}

async function cvePost() {
    if(docEditor.validation_results && docEditor.validation_results.length == 0){
        /*if (save != undefined) {
            await save();
        }*/
        if(cveClient) {
            console.log('uploading...');
            var j = mainTabGroup.getValue();
            var ret = null;
            if(cveApi.state[j.cveMetadata.id] == 'RESERVED') {
                console.log('Creating');
                ret = await cveClient.createCve(j.cveMetadata.id, j);
            } else {
                console.log('uploading');
                ret = await cveClient.updateCve(j.cveMetadata.id, j);
            }
            if (ret.ok) {
                ret = await ret.json();
                if(ret && ret.cveMetadata && ret.cveMetadata.state)
                    cveApi.state[j.cveMetadata.id] = ret.cveMetadata.state;
                infoMsg.innerText = ret.message;
                hideJSONerrors();
            } else {
                var ret = await ret.json();
                if (ret.details && ret.details.errors) {
                    alert(ret.error + ': ' + ret.message);
                    showJSONerrors(ret.details.errors.map(
                    a => { return({
                            path: a.instancePath,
                            message: a.message
                        });}
                        ));
                } else {
                   console.log(ret);
                    alert(ret.error + ': ' + ret.message);
                }
            }
        } else {
            //todo enable/disable post button
            alert('please login to CVE');
        }
    } else {
        alert('Fix errors in document');
    }
}

async function cveReserveAndRender() {
    if(cveClient) {
        await cveReserve();
        await cveGetList();
    } else {
        alert('please login to CVE');
    }
} 
/*
  CVE Services REST API - Javascript Client

  Developed by Ben N.

  License: MIT

  Provides simple JS interface to perform common actions in the CVE API for an
  authenticated user, whilst storing API credentials locally in the browser.
*/

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    class NoCredentialsError extends Error {};

    class CveServices {
        constructor(serviceUri) {
            if (serviceUri == null) {
                serviceUri = 'https://cweawg.mitre.org/api';
            }

            this._request = new CveServicesRequest(serviceUri);
        }

        getCveIds() {
            return this._request.get('cve-id')
                .then(data => data.cve_ids);
        };

        reserveCveIds(args) {
            return this._request.post('cve-id', args)
                .then(data => data.cve_ids);
        }

        reserveCveId(year = new Date().getFullYear()) {
            return this._request.orgName
                .then(orgName => {
                    let args = {
                        amount: 1,
                        cve_year: year,
                        short_name: orgName,
                    };

                    return this.reserveCveIds(args);
                });
        }

        reserveSeqCveIds(n = 1, year = new Date().getFullYear()) {
            return this._request.orgName
                .then(orgName => {
                    let args = {
                        amount: n,
                        cve_year: year,
                        short_name: orgName,
                        batch_type: 'sequential',
                    };

                    return this.reserveCveIds(args);
                });
        }

        reserveNonSeqCveIds(n = 1, year = new Date().getFullYear()) {
            return this._request.orgName
                .then(orgName => {
                    let args = {
                        amount: n,
                        cve_year: year,
                        short_name: orgName,
                        batch_type: 'nonsequential',
                    };

                    return this.reserveCveIds(args);
                });
        }

        getCveId(id) {
            return this._request.get(['cve-id', id].join('/'));
        }

        updateCveId(id, record) {
            return this._request.put(`cve-id/${id}`, record);
        }

        getCves() {
            return this._request.get('cve');
        }

        getCve(id) {
            return this._request.get(`cve/${id}`);
        }

        createCve(id, schema) {
            return this._request.post(`cve/${id}`, undefined, schema);
        }

        updateCve(id, schema) {
            return this._request.put(`cve/${id}`, undefined, schema);
        }

        getOrgInfo() {
            return this._request.orgName
                .then(org =>
                    this._request.get(['org', org].join('/')));
        }

        getOrgUsers() {
            return this._request.orgName
                .then(org =>
                        this._request.get(['org', org, 'users'].join('/')));
        }

        getOrgIdQuota() {
            return this._request.orgName
                .then(org =>
                      this._request.get(['org', org, 'id_quota'].join('/')));
        }

        getOrgUser(username) {
            return this._request.orgName
                .then(org =>
                      this._request.get(['org', org, 'user', username].join('/')));
        }
    };

    class CveServicesRequest {
        constructor(serviceUri) {
            this._clientAuth = null;
            this._serviceUri = serviceUri;
        }

        middleware() {
            return this.clientLogin()
                .then((cred) => {
                    return {
                        headers: {
                            'CVE-API-KEY': cred.key,
                            'CVE-API-ORG': cred.org,
                            'CVE-API-USER': cred.user,
                        }
                    };
            });
        }

        get orgName() {
            let obj = this;

            return new Promise(resolve => {
                if (obj._clientAuth != null) {
                    resolve(obj._clientAuth.org);
                } else {
                    obj.clientLogin()
                        .then(cred => resolve(cred.org));
                }
            });
        }

        get userName() {
            let obj = this;

            return new Promise(resolve => {
                if (obj._clientAuth != null) {
                    resolve(obj._clientAuth.user);
                } else {
                    obj.clientLogin()
                        .then(cred => resolve(cred.user));
                }
            });
        }

        clientLogin() {
            if (this._clientAuth == null) {
                let getFunc;
                let setFunc;

                if (window.PasswordCredential) {
                    return this.clientLoginBrowserCred();
                } else {
                    return null;
                }
            } else {
                return Promise.resolve(this._clientAuth);
            }
        }

        clientLoginBrowserCred() {
            let storeCred = this.clientStoreBrowserCred;

            return navigator.credentials.get({password: true})
                .then(cred => {
                    if (cred == null) {
                        return storeCred();
                    } else {
                        return cred;
                    }
                })
                .then(cred => {

                    let [user, org] = cred.id.split("|");
                    let key = cred.password;

                    this._clientAuth = {
                        key,
                        org,
                        user
                    };

                    return this._clientAuth;
                });
        }

        clientStoreBrowserCred() {
            return new Promise(resolve => {
                let doc = window.document;

                alert("You have not yet stored your credentials.\n" +
                    "You will be prompted for your CVE API account details now.");

                let org = prompt('CNA organisation short name: ');
                let user = prompt('CVE API account username: ');
                let key = prompt('CVE API KEY: ');

                let loginForm = document.createElement('form');
                loginForm.setAttribute('style', 'display: none;');

                let loginFormUser = document.createElement('input');

                loginFormUser.setAttribute('type', 'hidden');
                loginFormUser.setAttribute('name', 'username');
                loginFormUser.setAttribute('value', `${user}|${org}`);
                loginFormUser.setAttribute('autocomplete', 'username');

                let loginFormPass = document.createElement('input');
                loginFormPass.setAttribute('type', 'password');
                loginFormPass.setAttribute('name', 'password');
                loginFormPass.setAttribute('value', key);
                loginFormPass.setAttribute('autocomplete', 'current-password');

                loginForm.append(loginFormUser);
                loginForm.append(loginFormPass);

                document.body.append(loginForm);

                let cred = new PasswordCredential(loginForm);
                navigator.credentials.store(cred);

                resolve(cred);
            });
        }

        get(path, query) {
            return this.middleware()
                .then(opts => {
                    let queryPath = '';

                    if (query) {
                        queryPath = new URLSearchParams(query).toString();
                    }

                    return fetch(`${this._serviceUri}/${path}?${queryPath}`, opts)
                        .then(res => res.json());
                });
        }

        post(path, query, body) {
            return this.middleware()
                .then(opts => {
                    opts.method = 'POST';

                    let queryPath = '';

                    if (query) {
                        queryPath = '?' + new URLSearchParams(query).toString();
                    }

                    if (body) {
                        opts.headers['Content-Type'] = 'application/json';
                        opts.body = JSON.stringify(body);
                    }

                    return fetch(`${this._serviceUri}/${path}${queryPath}`, opts);
                });
        }

        put(path, query, body) {
            return this.middleware()
                .then(opts => {
                    opts.method = 'PUT';

                    let queryPath = '';

                    if (query) {
                        queryPath = '?' + new URLSearchParams(query).toString();
                    }

                    if (body) {
                        opts.headers['Content-Type'] = 'application/json';
                        opts.body = JSON.stringify(body);
                    }

                    return fetch(`${this._serviceUri}/${path}?${queryPath}`, opts);
                });
        }
    };

    if (window != undefined) {
        window.CveServices = CveServices;
    }

    return CveServices;
}));
