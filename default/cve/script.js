var additionalTabs =  {
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
                        getProductAffected: getProductAffected,
                        cmap: cMap,
                    });
                } else {
                    document.getElementById("render").innerHTML = pugRender({
                        renderTemplate: 'page',
                        getProductAffected: getProductAffected,
                        doc: j
                    });
                }
            } else {
                document.getElementById("render").innerHTML = pugRender({
                    renderTemplate: 'page',
                    getProductAffected: getProductAffected,
                    doc: j
                });
            }
        }
      }
    },
    mitreTab: {
        title: 'MITRE-Preview',
        setValue: function(j){
            document.getElementById("mitreweb").innerHTML = pugRender({
                renderTemplate: 'mitre',
                doc: j
            });
        }
    },
    jsonTab: {
        title: 'CVE-JSON',
        setValue: function(j){
            document.getElementById("outjson").textContent = textUtil.getMITREJSON(textUtil.reduceJSON(j)); 
        }
    }
}

function tweetJSON(event, link) {
        var j = mainTabGroup.getValue();
        if (!j){
            event.preventDefault();
            return;
        }
        var id = textUtil.deep_value(j, 'CVE_data_meta.ID');
        var cvelist = textUtil.deep_value(j, 'CNA_private.CVE_list');
        if(cvelist && cvelist.length > 0) {
            id = '';
        }
        var aka = textUtil.deep_value(j, 'CVE_data_meta.AKA')
        var text = id + ' ' + textUtil.deep_value(j, 'source.advisory') + ' '
            + textUtil.getBestTitle(j) + ' '
            + (aka? ' aka ' + aka : '');
        text = text.replace(/ +(?= )/g,'');
        link.href = 'https://twitter.com/intent/tweet?&text=' 
            + encodeURI(text)
            + '&url=' + encodeURI(textUtil.deep_value(j, 'references.reference_data.0.url'));
        //    + '&hashtags=' + encodeURI(id)
        //via=vulnogram&hashtags=CVE
}

async function draftEmail(event, link, renderId) {
        var subject = ''
        if(typeof(mainTabGroup) !== 'undefined') {
            var j = mainTabGroup.getValue();
            if (!j){
                event.preventDefault();
                return;
            }
            var id = textUtil.deep_value(j, 'CVE_data_meta.ID');
            var cvelist = textUtil.deep_value(j, 'CNA_private.CVE_list');
            if(cvelist && cvelist.length > 0) {
                id = '';
            }
            subject = id +' ' + textUtil.getBestTitle(j);
        } else {
            var t = document.getElementById(renderId).getElementsByTagName('h2')[0];
            if(t) {
                subject = t.textContent;
            }
        }
        var emailBody = document.getElementById(renderId).innerText;
        link.href="mailto:?subject=" + encodeURI(subject) + '&body=' + encodeURI(emailBody);
}

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
                    loadJSON(res, id, "Loaded "+id+" from GIT!");
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

function getProductAffected(cve) {
    var lines = [];
    for (var vendor of cve.affects.vendor.vendor_data) {
        var pstring = [];
        for(var product of vendor.product.product_data) {
            var versions = {};
            var includePlatforms = true;
            var platforms = {};
            for (var version of product.version.version_data) {
                if(version.version_affected && version.version_affected.indexOf('!') < 0 && version.version_affected.indexOf('?') < 0) {
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
                Object.keys(versions).sort().join(", ")+ '.');
            if(includePlatforms && (Object.keys(platforms).length > 0)) {
                pstring.push('Affected platforms: ' + Object.keys(platforms).sort().join(', ') + '.');
            }
        }
        lines.push(pstring.join(" "));
    }
    return lines.join();  
};