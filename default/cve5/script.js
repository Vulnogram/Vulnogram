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

function loadCVE(value) {
    var realId = value.match(/(CVE-(\d{4})-(\d{1,12})(\d{3}))/);
    if (realId) {
        var id = realId[1];
        var year = realId[2];
        var bucket = realId[3];
        fetch('https://raw.githubusercontent.com/CVEProject/cvelist/master/' + year + '/' + bucket + 'xxx/' + id + '.json', {
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
                if (res.CVE_data_meta) {
                    loadJSON(res, id, "Loaded " + id + " from GIT!");
                } else {
                    errMsg.textContent = "Failed to load valid CVE JSON";
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