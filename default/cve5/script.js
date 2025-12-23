var currentYear = new Date().getFullYear();
const defaultTimeout = 1000 * 60 * 60; // one hour timeout
var vgExamples = window.vgExamples || {};
window.vgExamples = vgExamples;

async function loadExamples(field, orgName) {
    if (!field || !orgName) {
        return;
    }
    if (!vgExamples[field]) {
        vgExamples[field] = {};
    } else if (vgExamples[field][orgName]) {
        return vgExamples[field][orgName];
    }

    var url = 'https://raw.githubusercontent.com/Vulnogram/cve-index/refs/heads/main/data/' + field + '/' + orgName + '.json';
    var response = await fetch(url, {
        method: 'GET',
        credentials: 'omit',
        headers: {
            'Accept': 'application/json, text/plain, */*'
        }
    });
    if (!response.ok) {
        //throw new Error('Failed to load examples for ' + field + '/' + orgName + ': ' + response.statusText);
    }
    var data = await response.json();
    vgExamples[field][orgName] = data;
    return data;
}

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
                if (res.dataVersion && (res.dataVersion.match(/^5\.(0|[1-9][0-9]*)(\.(0|[1-9][0-9]*))?$/))) {
                    if (res.containers.cna.x_legacyV4Record) {
                        delete res.containers.cna.x_legacyV4Record;
                    }
                    if (res.containers) {
                        res = cveFixForVulnogram(res);
                    }
                    var edOpts = (res.cveMetadata.state == 'REJECTED') ? rejectEditorOption : publicEditorOption;
                    mainTabGroup.change(0);
                    loadJSON(res, id, "Loaded " + id + " from GIT!", edOpts);
                } else {
                    errMsg.textContent = "Failed to load valid CVE JSON v 5 record";
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

async function rejectRecord() {
    var id = getDocID();
    if (window.confirm('Do you want to reject ' + id + '? All vulnerability details will be removed.')) {
        loadJSON({
            cveMetadata: {
                cveId: id,
                state: 'REJECTED'
            }
        }, id, 'Rejcting ' + id, rejectEditorOption);
        mainTabGroup.change(0);
    }
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
    cvePortalTab: {
        title: 'CVE Org',
        setValue: function () {

        }
    }
}

/* fullname = vendor . product . platforms . module .others . default status 
/* table --> [ fullname ][version][affected|unaffected|unknown] = [ list of ranges ] */
function versionStatusTable5(affected) {
    var t = {}; // resulting table structure
    nameAndPlatforms = {};
    var showCols = {
        platforms: false,
        modules: false,
        affected: false,
        unaffected: false,
        unknown: false
    };
    for (var p of affected) {
        var pname = p.product ? p.product : p.packageName ? p.packageName : '';
        if (p.platforms)
            showCols.platforms = true;
        if (p.modules)
            showCols.modules = true;
        if (p.status)
            showCols[p.status] = true;
        var platforms =
            (p.platforms ? p.platforms.join(', ') : '');
        var others = {};
        if (p.collectionURL) {
            others.collectionURL = p.collectionURL;
        }
        if (p.repo) {
            others.repo = p.repo;
        }
        if (p.programFiles) {
            others.programFiles = p.programFiles;
        }
        if (p.programRoutines) {
            others.programRoutines = p.programRoutines;
        }
        var modules = p.modules ? p.modules.join(', ') : '';
        var pFullName = [
            (p.vendor ? p.vendor + ' ' : '') + pname + (major ? ' ' + major : ''),
            platforms,
            modules,
            others,
            p.defaultStatus
        ];
        nameAndPlatforms[pFullName] = pFullName;
        if (p.versions) {
            for (v of p.versions) {
                var rows = {
                    affected: [],
                    unaffected: [],
                    unknown: []
                };
                var major = undefined; //major ? major[1] : '';
                if (v.version) {
                    showCols[v.status] = true;
                    if (!v.changes) {  // simple range versions 
                        var rangeStart = '';
                        if (v.version != 'unspecified' && v.version != 0)
                            rangeStart = 'from ' + v.version;
                        if (v.lessThan) {
                            var rangeEnd = ' before ' + v.lessThan;
                            if (v.lessThan == 'unspecified' || v.lessThan == '*')
                                rangeEnd = "";
                            rows[v.status].push(rangeStart + rangeEnd);
                        } else if (v.lessThanOrEqual) {
                            var rangeEnd = ' through ' + v.lessThanOrEqual;
                            if (v.lessThanOrEqual == 'unspecified' || v.lessThanOrEqual == '*')
                                rangeEnd = "";
                            rows[v.status].push(rangeStart + rangeEnd);
                        } else {
                            rows[v.status].push(v.version);
                        }
                    } else {
                        var ver = v.version;
                        showCols[v.status] = true;
                        var range = '';
                        if (ver != 'unspecified' && ver != 0)
                            range = 'from ' + ver;
                        if (v.lessThan) {
                            var rangeEnd = ' before ' + v.lessThan;
                            if (v.lessThan == 'unspecified' || v.lessThan == '*')
                                rangeEnd = "";
                            range = range + (v.lessThan != ver ? rangeEnd : '');
                        } else if (v.lessThanOrEqual) {
                            var rangeEnd = ' through ' + v.lessThanOrEqual;
                            if (v.lessThanOrEqual == 'unspecified' || v.lessThanOrEqual == '*')
                                rangeEnd = "";
                            range = range + (v.lessThanOrEqual != ver ? rangeEnd : '');
                        } else {
                            range = ver;
                        }
                        var changes = [];
                        for (c of v.changes) {
                            changes.push(c.status + ' from ' + c.at);
                        }
                        if (changes.length > 0) {
                            range = range + ' (' + changes.join(', ') + ')';
                        }
                        rows[v.status].push(range);
                    }
                }
                if (!t[pFullName]) t[pFullName] = [];
                t[pFullName].push(rows);
            }
        }
    }
    return ({ groups: nameAndPlatforms, vals: t, show: showCols });
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

/* safely convert HTML in supportingMedia to text */
function domhtml(html) {
    text = htmltoText(html) || "";
    let doc = new DOMParser().parseFromString('<pre>' + text + '</pre>', 'text/html');
    var ret = doc.body.innerText || "";
    return ret.trim();
}

function htmltoText(html) {
    if (html) {
        let text = html;
        //text = text.replace(/\n/gi, "");
        text = text.replace(/<style([\s\S]*?)<\/style[^>]*?>/gi, "");
        text = text.replace(/<script([\s\S]*?)<\/script[^>]*?>/gi, "");
        text = text.replace(/<a.*?href="(.*?)[\?\"].*?>\1<\/a.*?>/gi, " $1 ");
        text = text.replace(/<a.*?href="(.*?)[\?\"].*?>(.*?)<\/a.*?>/gi, " $2 $1 ");
        text = text.replace(/<\/div[^>]*?>/gi, "\n\n");
        text = text.replace(/<\/li[^>]*?>/gi, "\n");
        text = text.replace(/<li.*?>/gi, "  *  ");
        text = text.replace(/<\/ul[^>]*?>/gi, "\n\n");
        text = text.replace(/<\/p[^>]*?>/gi, "\n\n");
        text = text.replace(/<br\s*[\/]?>/gi, "\n");
        text = text.replace(/<[^>]+>/gi, "");
        //text = text.replace(/^\s*/gim, "");
        //text = text.replace(/ ,/gi, ",");
        //text = text.replace(/ +/gi, " ");
        //text = text.replace(/\n\n/gi, "\n");
        text = text.replace(/^\s+/, "");
        text = text.replace(/\s+$/, "");
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
    if (popup) {
        var insideTooltip = popup.contains(e.target);
        if (!insideTooltip) {
            popup.removeAttribute("open");
        }
    }
});

var autoTextRequired = [
    'root.containers.cna.affected',
    'root.containers.cna.problemTypes',
    'root.containers.cna.impacts',
]
function enoughAutoTextFields(res) {
    for (s of res) {
        for (p of autoTextRequired) {
            if (s.path.startsWith(p)) {
                return false;
            }
        }
    }
    return true;
}

async function autoText(event) {
    if (event) {
        event.preventDefault();
    }
    if (docEditor.validation_results
        && (docEditor.validation_results.length == 0 || enoughAutoTextFields(docEditor.validation_results))) {
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
        text = text.replace(rg, function (toReplace) {
            return toReplace.toUpperCase();
        });
        hE.setValue(text, '', false);
    } else {
        showAlert('Please enter all the required fields first!');
    }
}

function addRichText(d) {
    var ht = '';
    if (d.value) {
        ht = cveRender({
            ctemplate: 'htext',
            t: d.value
        })
    }
    if (!d.supportingMedia) {
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
    if (j && j.length > 0) {
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

    if (j && j.containers && j.containers.cna) {
        var cna = j.containers.cna
        htmlFields.forEach(element => {
            addRichTextArray(cna[element])
        });
    }
    return j;
}

function cvssImport(j) {
    var containers = []
    if (j && j.containers && j.containers.cna) {
        containers = containers.concat([j.containers.cna], j.containers.adp ? j.containers.adp : []);
        //console.log(containers);
        containers.forEach(c => {
            if (c.metrics) {
                c.metrics.forEach(m => {
                    if ((m.cvssV2_0 || m.cvssV3_0 || m.cvssV3_1 || m.cvssV4_0) && m.format == undefined) {
                        m.format = "CVSS"
                    }
                    if (m.scenarios == undefined) {
                        m.scenarios = [
                            {
                                "lang": "en",
                                "value": "GENERAL"
                            }
                        ]
                    }
                    if (m.cvssV3_0) {
                        m.cvssV3_1 = m.cvssV3_0;
                        m.cvssV3_1.version = "3.1";
                        if (m.cvssV3_1.vectorString) {
                            m.cvssV3_1.vectorString = m.cvssV3_1.vectorString.replace('CVSS:3.0', 'CVSS:3.1');
                        }
                        delete m.cvssV3_0;
                    }
                    ["cvssV2_0", "cvssV3_0", "cvssV3_1", "cvssV4_0"].forEach(cvssObj => {
                        if(m[cvssObj]) {
                            fillCvssMetrics(m[cvssObj]);
                        }
                    });
                });
            }
        })
    }
    return j
}

async function loadCVEFile(event, elem) {
    var file = elem.files[0];
    if (file) {
        try {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                try {
                    res = JSON.parse(evt.target.result);
                    if (res && res.dataVersion && res.dataVersion.match(/^5\.(0|[1-9][0-9]*)(\.(0|[1-9][0-9]*))?$/)) {
                        res = cveFixForVulnogram(res);
                        //docEditor.setValue(res);
                        var edOpts = (res.cveMetadata.state == 'REJECTED') ? rejectEditorOption : publicEditorOption;
                        mainTabGroup.change(0);
                        loadJSON(res, null, "Imported file", edOpts);
                    } else {
                        showAlert("Not a CVE JSON 5.0 file!");
                    }
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

function cveFixForVulnogram(j) {
    j = addRichTextCVE(j);
    j = cvssImport(j);
    if (j.containers && j.containers.cna && j.containers.cna.problemTypes == undefined) {
        j.containers.cna.problemTypes = [];
    }
    if (j.containers && j.containers.cna && j.containers.cna.impacts == undefined) {
        j.containers.cna.impacts = [];
    }
    if (j.containers && j.containers.cna && j.containers.cna.metrics == undefined) {
        j.containers.cna.metrics = [];
    }
    return j;
}

let previousVersions = null;

async function clearCPE() {
        localStorage.setItem('autoCPEChk', false);
        document.getElementById('autoCPEChk').checked = false;
        var cpeEditor = await docEditor.getEditor('root.containers.cna.cpeApplicability');
        cpeEditor.setValue([],'',true);
        return;
}
async function setCPEstatus() {
    document.getElementById('autoCPEChk').checked = (localStorage.getItem('autoCPEChk') === 'true');
}
async function autoCPE() {
    let newState = document.getElementById('autoCPEChk').checked;
    localStorage.setItem('autoCPEChk', newState);
    if (newState) {
        //docEditor.getEditor('root.containers.cna.cpeApplicability').watch('cntr.affected');
        var affectedEditor = await docEditor.getEditor('root.containers.cna.affected');
        var affected = await affectedEditor.getValue();

        var cpeEditor = await docEditor.getEditor('root.containers.cna.cpeApplicability');
        var cpe = generateCpeApplicability(affected);
        //console.log(cpe);
        cpeEditor.setValue(cpe,'',true);
    } else {
        //docEditor.getEditor('root.containers.cna.cpeApplicability').disable();
        //docEditor.getEditor('root.containers.cna.cpeApplicability').unwatch('cntr.affected');
    }
}

function generateCpeApplicability(affected) {
    let cpeApplicabilityNodes = [];
    if (!affected || affected.length === 0 || !(localStorage.getItem('autoCPEChk') === 'true')) {
        return [];
    }
    for (const affectedProduct of affected) {
        const cpeApplicabilityNode = generateCpeApplicabilityNode(affectedProduct);
        if (cpeApplicabilityNode) {
            cpeApplicabilityNodes.push(cpeApplicabilityNode);
        }
    }
    return [{
        "operator": "OR",
        "nodes": cpeApplicabilityNodes
    }];
}
function normalizeCPEtoken(x) {
    if (x === undefined || x === null) {
        return '-';
    }
    return x.trim().toLowerCase().replaceAll(/[\s:]+/g, '_').replaceAll(/([*?])/g, '\$1');
}

function generateCpeApplicabilityNode(affectedProduct) {
    let cpeMatch = [];

    /*if (!affectedProduct.vendor || !affectedProduct.product) {
        return null;
    }*/

    if (affectedProduct.versions && affectedProduct.versions.length > 0) {
        for (const v of affectedProduct.versions) {
            var vulnerable = undefined;
            if (v.status === "affected" || v.status === "unaffected") {
                vulnerable = (v.status === "affected");

                var platforms = ['*']
                if (affectedProduct.platforms && affectedProduct.platforms.length > 0) {
                    platforms = affectedProduct.platforms;
                }
                for (const p of platforms) {
                    if (v.lessThan) {
                        cpeMatch.push({
                            "vulnerable": vulnerable,
                            "criteria": `cpe:2.3:a:${normalizeCPEtoken(affectedProduct.vendor)}:${normalizeCPEtoken(affectedProduct.product)}:*:*:${normalizeCPEtoken(p)}:*:*:*:*:*`,
                            "versionStartIncluding": normalizeCPEtoken(v.version),
                            "versionEndExcluding": normalizeCPEtoken(v.lessThan)
                        });
                    }
                    else if (v.lessThanOrEqual) {
                        cpeMatch.push({
                            "vulnerable": vulnerable,
                            "criteria": `cpe:2.3:a:${normalizeCPEtoken(affectedProduct.vendor)}:${normalizeCPEtoken(affectedProduct.product)}:*:*:${normalizeCPEtoken(p)}:*:*:*:*:*`,
                            "versionStartIncluding": normalizeCPEtoken(v.version),
                            "versionEndIncluding": normalizeCPEtoken(v.lessThanOrEqual)
                        });
                    } else {
                        cpeMatch.push({
                            "vulnerable": vulnerable,
                            "criteria": `cpe:2.3:a:${normalizeCPEtoken(affectedProduct.vendor)}:${normalizeCPEtoken(affectedProduct.product)}:${normalizeCPEtoken(v.version)}:*:${normalizeCPEtoken(p)}:*:*:*:*:*`
                        });
                    }
                }
            }
        }
    }
    if (cpeMatch.length > 0) {
        let cpeApplicabilityNode = {
            "operator": "OR",
            "negate": false,
            "cpeMatch": cpeMatch
        };

        return cpeApplicabilityNode;
    } else {
        return null;
    }
}

/**
 * Fill missing CVSS metric fields from vectorString; otherwise:
 * - Base metrics -> "worst-case" value
 * - Threat/Supplemental (v4) -> "NOT_DEFINED"
 * 
 * Supports CVSS v2.0, v3.0/v3.1, and v4.0(.1) JSON schema shapes as published by FIRST.
 * Mutates and returns the same object.
 */
function fillCvssMetrics(cvss) {
  const isMissing = v => v === undefined || v === null || v === "";

  // --- version detection -----------------------------------------------------
  const inferVersionFromVector = (vs) => {
    if (!vs || typeof vs !== "string") return null;
    const m = vs.match(/^CVSS:(\d(?:\.\d)?)/); // "CVSS:4.0", "CVSS:3.1", "CVSS:3.0"
    if (m) return m[1];
    // no "CVSS:x" prefix → likely v2
    return "2.0";
  };

  let version = String(cvss.version || inferVersionFromVector(cvss.vectorString) || "").trim();
  if (!version) {
    // Heuristic: pick by presence of distinctive keys if no version & no vector
    if ("attackRequirements" in cvss || "vulnConfidentialityImpact" in cvss) version = "4.0";
    else if ("scope" in cvss || "privilegesRequired" in cvss) version = "3.1";
    else version = "2.0";
  }
  // Normalize v3.0 → 3.1 handling
  if (version === "3.0") version = "3.1";

  // --- vector parsing --------------------------------------------------------
  const parseVector = (vs) => {
    if (!vs || typeof vs !== "string") return {};
    const out = {};
    for (const part of vs.split("/")) {
      if (!part || part.startsWith("CVSS:")) continue;
      const idx = part.indexOf(":");
      if (idx < 0) continue;
      const k = part.slice(0, idx).toUpperCase();       // e.g., "AV", "AC", "AU", "RE"
      const raw = part.slice(idx + 1);                  // e.g., "N", "L", "Red"
      out[k] = raw;
    }
    return out;
  };

  const vec = parseVector(cvss.vectorString);

  // --- mapping tables --------------------------------------------------------
  // v2.0 (Base only)
  const v2 = {
    base: {
      AV: { prop: "accessVector",         map: { N: "NETWORK", A: "ADJACENT_NETWORK", L: "LOCAL" } },
      AC: { prop: "accessComplexity",     map: { L: "LOW", M: "MEDIUM", H: "HIGH" } },
      AU: { prop: "authentication",       map: { N: "NONE", S: "SINGLE", M: "MULTIPLE" } }, // "Au" in the vector; parser uppercased to "AU"
      C:  { prop: "confidentialityImpact",map: { N: "NONE", P: "PARTIAL", C: "COMPLETE" } },
      I:  { prop: "integrityImpact",      map: { N: "NONE", P: "PARTIAL", C: "COMPLETE" } },
      A:  { prop: "availabilityImpact",   map: { N: "NONE", P: "PARTIAL", C: "COMPLETE" } },
    },
    worst: {
      accessVector: "NETWORK",
      accessComplexity: "LOW",
      authentication: "NONE",
      confidentialityImpact: "COMPLETE",
      integrityImpact: "COMPLETE",
      availabilityImpact: "COMPLETE",
    }
  };

  // v3.1 (Base only)
  const v31 = {
    base: {
      AV: { prop: "attackVector",        map: { N: "NETWORK", A: "ADJACENT_NETWORK", L: "LOCAL", P: "PHYSICAL" } },
      AC: { prop: "attackComplexity",    map: { L: "LOW", H: "HIGH" } },
      PR: { prop: "privilegesRequired",  map: { N: "NONE", L: "LOW", H: "HIGH" } },
      UI: { prop: "userInteraction",     map: { N: "NONE", R: "REQUIRED" } },
      S:  { prop: "scope",               map: { U: "UNCHANGED", C: "CHANGED" } },
      C:  { prop: "confidentialityImpact", map: { N: "NONE", L: "LOW", H: "HIGH" } },
      I:  { prop: "integrityImpact",       map: { N: "NONE", L: "LOW", H: "HIGH" } },
      A:  { prop: "availabilityImpact",    map: { N: "NONE", L: "LOW", H: "HIGH" } },
    },
    worst: {
      attackVector: "NETWORK",
      attackComplexity: "LOW",
      privilegesRequired: "NONE",
      userInteraction: "NONE",
      scope: "CHANGED",
      confidentialityImpact: "HIGH",
      integrityImpact: "HIGH",
      availabilityImpact: "HIGH",
    }
  };

  // v4.0 (.1) Base + Threat + Supplemental
  const v40 = {
    base: {
      AV: { prop: "attackVector",               map: { N: "NETWORK", A: "ADJACENT", L: "LOCAL", P: "PHYSICAL" } },
      AC: { prop: "attackComplexity",           map: { L: "LOW", H: "HIGH" } },
      AT: { prop: "attackRequirements",         map: { N: "NONE", P: "PRESENT" } },
      PR: { prop: "privilegesRequired",         map: { N: "NONE", L: "LOW", H: "HIGH" } },
      UI: { prop: "userInteraction",            map: { N: "NONE", P: "PASSIVE", A: "ACTIVE" } },
      VC: { prop: "vulnConfidentialityImpact",  map: { H: "HIGH", L: "LOW", N: "NONE" } },
      VI: { prop: "vulnIntegrityImpact",        map: { H: "HIGH", L: "LOW", N: "NONE" } },
      VA: { prop: "vulnAvailabilityImpact",     map: { H: "HIGH", L: "LOW", N: "NONE" } },
      SC: { prop: "subConfidentialityImpact",   map: { H: "HIGH", L: "LOW", N: "NONE" } },
      SI: { prop: "subIntegrityImpact",         map: { H: "HIGH", L: "LOW", N: "NONE" } },
      SA: { prop: "subAvailabilityImpact",      map: { H: "HIGH", L: "LOW", N: "NONE" } },
    },
    threat: {
      // E values in vector are single letters; JSON value we'll use: "ATTACKED" | "POC" | "UNREPORTED" | "NOT_DEFINED"
      E:  { prop: "exploitMaturity", map: { X: "NOT_DEFINED", A: "ATTACKED", P: "POC", U: "UNREPORTED" } },
    },
    supplemental: {
      S:  { prop: "safety",                    map: { X: "NOT_DEFINED", N: "NEGLIGIBLE", P: "PRESENT" } },
      AU: { prop: "automatable",               map: { X: "NOT_DEFINED", N: "NO", Y: "YES" } },
      R:  { prop: "recovery",                  map: { X: "NOT_DEFINED", A: "AUTOMATIC", U: "USER", I: "IRRECOVERABLE" } },
      V:  { prop: "valueDensity",              map: { X: "NOT_DEFINED", D: "DIFFUSE", C: "CONCENTRATED" } },
      RE: { prop: "vulnerabilityResponseEffort", map: { X: "NOT_DEFINED", L: "LOW", M: "MODERATE", H: "HIGH" } },
      // U uses words in the vector (Clear/Green/Amber/Red). Normalize to upper-case JSON forms.
      U:  { prop: "providerUrgency",           map: { X: "NOT_DEFINED", CLEAR: "CLEAR", GREEN: "GREEN", AMBER: "AMBER", RED: "RED" } },
    },
    worst: {
      attackVector: "NETWORK",
      attackComplexity: "LOW",
      attackRequirements: "NONE",
      privilegesRequired: "NONE",
      userInteraction: "NONE",
      vulnConfidentialityImpact: "HIGH",
      vulnIntegrityImpact: "HIGH",
      vulnAvailabilityImpact: "HIGH",
      subConfidentialityImpact: "HIGH",
      subIntegrityImpact: "HIGH",
      subAvailabilityImpact: "HIGH",
    }
  };

  // --- helpers to apply values ----------------------------------------------
  const fromVectorOr = (abbr, entry) => {
    if (!(abbr in vec)) return null;
    let raw = vec[abbr];
    // Provider Urgency: words like "Red/Amber/Green/Clear" → map by upper-case key
    if (abbr === "U") raw = String(raw).toUpperCase();
    return entry.map.hasOwnProperty(raw) ? entry.map[raw] : null;
  };

  const fillGroup = (obj, table, worst) => {
    for (const [abbr, entry] of Object.entries(table)) {
      const prop = entry.prop;
      if (isMissing(obj[prop])) {
        const v = fromVectorOr(abbr, entry);
        obj[prop] = v != null ? v : (worst ? worst[prop] : obj[prop]);
      }
    }
  };

  // --- apply per version -----------------------------------------------------
  if (version === "4.0") {
    fillGroup(cvss, v40.base, v40.worst);
    // Threat metrics -> vector or NOT_DEFINED
    for (const [abbr, entry] of Object.entries(v40.threat)) {
      const prop = entry.prop;
      if (isMissing(cvss[prop])) {
        cvss[prop] = fromVectorOr(abbr, entry) ?? "NOT_DEFINED";
      }
    }
    // Supplemental metrics -> vector or NOT_DEFINED
    for (const [abbr, entry] of Object.entries(v40.supplemental)) {
      const prop = entry.prop;
      if (isMissing(cvss[prop])) {
        cvss[prop] = fromVectorOr(abbr, entry) ?? "NOT_DEFINED";
      }
    }
  } else if (version === "3.1") {
    fillGroup(cvss, v31.base, v31.worst);
  } else if (version === "2.0") {
    fillGroup(cvss, v2.base, v2.worst);
  } else {
    // Fallback: treat unknown as v3.1
    fillGroup(cvss, v31.base, v31.worst);
  }

  // ensure version is set back
  if (isMissing(cvss.version)) cvss.version = version;
  return cvss;
}
