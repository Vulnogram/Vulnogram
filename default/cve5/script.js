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
    return false;
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
    cveApiTab: {
        title: 'CVE Org',
        setValue: function() {
            if(cveApi && cveApi.list) {
                cveRenderList(cveApi.list);
            }
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
                            rows[v.status].push('>= ' + v.version + ' to <= ' + v.lessThan);
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
        rows[p.defaultStatus] = ["everything else"];
        if(!t[pFullName]) {
            t[pFullName] = [rows];
        } else {
            t[pFullName].push(rows);
        }
        if (p.defaultStatus)
            showCols[p.defaultStatus] = true;
    }
    console.log(t);
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
var preLogin = "";

function resetClient() {
    cveClient = null;
    var cveApi = {
        user: null,
        uuid: null,
        org: null,
        list: null,
        state: {}
    } 
}
async function cveLogin(URL, type) {
    if (!cveClient) {
        try {
            cveClient = new CveServices(URL);
            cveApi.apiType = type;
            cveApi.user = await cveClient._request.userName;
            cveApi.short_name = await cveClient._request.orgName;
            cveApi.org = await cveClient.getOrgInfo();
            if(cveApi.org.error) {
                alert('Error logging in: '+cveApi.org.error + " : "+ cveApi.org.message);
                resetClient()
                return;
            }
            cveApi.userInfo = await cveClient.getOrgUser(cveApi.user);
            if(cveApi.userInfo.error) {
                alert('Error logging in: '+cveApi.org.error + " : "+ cveApi.org.message);
                resetClient();
                return;
            }
        } catch (e) {
            alert('Error logging in!' + e.message);
            resetClient();
            return;
        }
        if(cveApi.org.UUID) { 
            var pid = docEditor.getEditor('root.containers.cna.providerMetadata.id');
            if (pid && pid.getValue() == '00000000-0000-4000-9000-000000000000') {
                pid.setValue(cveApi.org.UUID);
            }
            var aid = docEditor.getEditor('root.cveMetadata.assigner');
            if (aid && aid.getValue() == '00000000-0000-4000-9000-000000000000') {
                aid.setValue(cveApi.org.UUID);
            }
            document.getElementById('portalName').innerHTML = "<b class=\"lbl tred\">" +  type + "</b> " + URL;
            preLogin = document.getElementById('cveUser').innerHTML;
            document.getElementById('cveUser').innerHTML = cveRender({
                ctemplate: 'userstats',
                userInfo: cveApi.userInfo,
                org: cveApi.org
            });
            document.getElementById('cveToolbar').className = "pad";
            await cveGetList(cveClient);
            window.sessionStorage.cveApi = JSON.stringify(cveApi);
        }
    }
}

async function cveLogout(URL) {
    resetClient();
    window.sessionStorage.cveApi = JSON.stringify(cveApi);
    document.getElementById('cveUser').innerHTML = preLogin;
    document.getElementById('portalName').innerText = 'disconnected';
    document.getElementById('cveToolbar').className = "hid";

}

async function cveRenderList(l) {
    if (l) {
        document.getElementById('cveListTable').innerHTML = cveRender({
            ctemplate: 'listIds',
            cveIds: l,
            editable: (cveApi.apiType == 'test')
        })
        new Tablesort(document.getElementById('cveListTable'));
        docSchema.definitions.cveId.examples = l.map(i=>i.cve_id);
        document.getElementById('root.cveMetadata.cveId-datalist').innerHTML = cveRender({
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
//var collator = new Intl.Collator(undefined, {numeric: true});

async function cveGetList() {
    if(cveClient) {
        var json = await cveClient.getCveIds();

        cveApi.list = json.sort(function(a,b){return b.reserved > a.reserved});

        for(var i=0; i< json.length; i++) {
            cveApi.state[json[i].cve_id] = json[i].state;
        }
        cveRenderList(json);
    } else {
        alert('Login to CVE.org first');
    }
}

async function cveReserve(yearOffset) {
    if (cveClient) {
        var year = new Date().getFullYear() + (yearOffset ? yearOffset : 0);
        try {
            var json = await cveClient.reserveCveIds({
                amount: 1,
                cve_year: year,
                short_name: cveApi.short_name
            });
            //console.log(json);
            return json;
        } catch (e) {
            //console.log(e);
        }
    } else {
        alert('Please login to CVE Portal');
    }
}

async function cveSelectLoad(event) {
    event.preventDefault();
    if(cveClient){
    cveLoad(event.target.elements.id.value)
    } else {
        alert('Please login to CVE Portal');
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
            console.log(m);
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

async function cveLoad(cveId) {
    if(cveApi.state && cveApi.state[cveId] == 'RESERVED') {
        var res = {
            "cveMetadata": {
              "cveId": cveId,
              "assigner": cveApi.org ? cveApi.org.UUID : "",
              "state": "PUBLISHED"
            }
        };
        //cveApi.state[cveId] = 'RESERVED';
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
                if(res.cveMetadata.containers) {
                    res = addRichTextCVE(res);
                    res = cvssv3_0_to_cvss3_1(res);
                }
                loadJSON(res, cveId, "Loaded " + cveId + " from CVE.org!");
                mainTabGroup.change(0);
                return res;
            } else {
                errMsg.textContent = "Failed to load valid CVE Record";
                infoMsg.textContent = "";
            }
        } else {
            alert('Please login to CVE Portal');
        }
    }
}

async function cvePost() {
    if(docEditor.validation_results && docEditor.validation_results.length == 0){
        /*if (save != undefined) {
            await save();
        }*/
        if(cveClient) {
            if(cveApi.apiType === 'test') {
            //console.log('uploading...');
            var j = await mainTabGroup.getValue();
            var j = textUtil.reduceJSON(j);
            var ret = null;
            if(cveApi.state[j.cveMetadata.id] == 'RESERVED') {
                //console.log('Creating');
                ret = await cveClient.createCve(j.cveMetadata.id, j);
            } else {
                //console.log('uploading');
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
                   //console.log(ret);
                    alert(ret.error + ': ' + ret.message);
                }
            }
        } else {
            alert('CVE posting is not currently supported by production CVE services! Try Logging to CVE -> AWG Test');
        }
        } else {
            //todo enable/disable post button
            alert('Please login to CVE Portal -> (CVE AWG Test)');
        }
    } else {
        alert('Please fix errors before posting');
    }
}

async function cveReserveAndRender(yearOffset) {
    if(cveClient) {
        await cveReserve(yearOffset);
        await cveGetList();
    } else {
        alert('Please login to CVE Portal');
    }
} 
