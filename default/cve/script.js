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