function orderKeys(obj) {

  var keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
      if (k1 < k2) return -1;
      else if (k1 > k2) return +1;
      else return 0;
  });

  var i, after = {};
  for (i = 0; i < keys.length; i++) {
    after[keys[i]] = obj[keys[i]];
    delete obj[keys[i]];
  }

  for (i = 0; i < keys.length; i++) {
    obj[keys[i]] = after[keys[i]];
    //recurse
    if (obj[keys[i]] instanceof Object) {
             obj[keys[i]] = orderKeys(obj[keys[i]]);
    }
  }
  return obj;
}

function cloneJSON(obj) {
    // basic type deep copy
    if (obj === null || obj === undefined || typeof obj !== 'object' || obj === "")  {
        return obj
    }
    // array deep copy
    if (obj instanceof Array) {
        var cloneA = [];
        for (var i = 0; i < obj.length; ++i) {
            cloneA[i] = cloneJSON(obj[i]);
        }
        if(cloneA.length > 0) {   
            return cloneA;
        } else {
            return null;
        }
    }        
    // object deep copy
    var cloneO = {};   
    for (var i in obj) {
        var c = cloneJSON(obj[i]);
        if(c !== null && c !== "") {
            cloneO[i] = c;
        }
    }
    return cloneO;
};

var textUtil = {
jsonView: function(obj) {
    if (obj instanceof Array) {
        var ret = '<table>'; 
        for(var k in obj) {
            ret = ret + '<tr><td>' + this.jsonView(obj)+ '</td></tr>';
        }
        return(ret + '</table>');
    } else if (obj instanceof Object) {
        var ret = '<div>';
        for (var k in obj){
            if (obj.hasOwnProperty(k)){
                ret = ret + '<div><b>' + k + '</b>: ' + this.jsonView(obj[k]) + '</div>';
            }
        }
        return ret + '</div>'
    } else {
        return obj;
    };
},
reduceJSON: function (cve) {
    //todo: this is to create a duplcate object
    // needs cleaner implementation
    var c = cloneJSON(cve);
    delete c.CNA_private;
    if (c.description && c.description.description_data) {
        var merged = {};
        var d;
        for (d of c.description.description_data) {
            if (d && d.lang) {
                if (!merged[d.lang]) {
                    merged[d.lang] = [];
                }
                merged[d.lang].push(d.value);
            }
        }
        var new_d = [];
        for (var m in merged) {
            new_d.push({
                lang: m,
                value: merged[m].join("\n")
            });
        }
        c.description.description_data = new_d;
    }
    if(c.impact && c.impact.cvss && c.impact.cvss.baseScore === 0) {
        delete c.impact;    
    }
    return(orderKeys(c));
},
    
getMITREJSON: function(cve) {
    return JSON.stringify(cve, null, "   ");
},
getPR: function(cve) {
    var matches = [];
    var re = /PRs?[ \t]+((or|and|[0-9\t\ \,])+)/igm;
    var m;
    while((m = re.exec(cve.solution)) !== null) {
        var prs = m[1].trim().split(/[ \t,andor]{1,}/).filter(x => x);
        matches = matches.concat(prs);
    }
    return matches;
},

getProductList: function (cve) {
    var lines = [];
    for (var vendor of cve.affects.vendor.vendor_data) {
        var pstring = [];
        for (var product of vendor.product.product_data) {
            pstring.push(product.product_name);
        }
        lines.push(vendor.vendor_name + " " + pstring.join(", "));
    }
    return lines.join("; ");
},

getAffectedProductString: function (cve) {
    var status={};
    var lines = [];
    for (var vendor of cve.affects.vendor.vendor_data) {
        var vendor_name = vendor.vendor_name;
        for(var product of vendor.product.product_data) {
            for(var version of product.version.version_data) {
                var vv = version.version_value;
                var cat = "affected";
                if(version.version_affected) {
                    if(version.version_affected.startsWith('?')) {
                        cat = "unknown";
                    } else if (version.version_affected.startsWith('!')) {
                        cat = "unaffected";
                    }
                    var prefix = "";
                    if(version.version_name && version.version_name != "") {
                        prefix = version.version_name + " ";
                    }
                    switch (version.version_affected) {
                        case "!":
                        case "?":
                        case "=":
                            vv = version.version_value;
                            break;
                        case "<":
                        case "!<":
                        case "?<":
                            vv = prefix + "versions prior to " + version.version_value;
                            break;
                        case ">":
                        case "?>":
                            vv = prefix + "versions later than " + version.version_value;
                            break;
                        case "<=":
                        case "!<=":
                        case "?<=":
                            vv = prefix + "version " + version.version_value + " and prior versions";
                            break;
                        case ">=":
                        case "!>=":
                        case "?>=":
                            vv = prefix + "version " + version.version_value + " and later versions";
                            break;
                        default:
                            vv = version.version_value;
                    }
                }
                if (version.platform) {
                    vv = vv + " on " + version.platform;
                }
                
                if (!status[cat]) {
                    status[cat] = {};
                }
                if(!status[cat][vendor_name + ' ' + product.product_name]) {
                    status[cat][vendor_name + ' ' + product.product_name] = [];
                }
                status[cat][vendor_name + ' ' + product.product_name].push(vv);
            }
        }
    }
    var stringifyArray = function(ob) {
        var ret = [];
        for(var p in ob) {
            ret.push(p + " " + ob[p].join(';\n') + ".");
        }
        return ret.join('\n');
    }
    var ret = [];
    if (status.affected) {
        ret.push('This issue affects:\n' + stringifyArray(status.affected));
    }
    if (status.unaffected) {
        ret.push('This issue does not affect:\n' + stringifyArray(status.unaffected));
    }
    if (status.unknown) {
        ret.push('It is not known whether this issue affects:\n' + stringifyArray(status.unknown));
    }
    return ret.join('\n\n');
},

getProductAffected:
function (cve) {
    /*var gs = this.getAffectedProductString(cve);
    if (gs.length < 100)
        return 'This issue affects ' + gs + '.';*/
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
},
mergeJSON : function (target, add) {
    function isObject(obj) {
        if (typeof obj == "object") {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return true; 
                }
            }
        }
        return false;
    }
    for (var key in add) {
        if (add.hasOwnProperty(key)) {
            if (target[key] && isObject(target[key]) && isObject(add[key])) {
                this.mergeJSON(target[key], add[key]);
            } else {
                target[key] = add[key];
            }
        }
    }
    return target;
},
timeSince: function(date) {

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes";
  }
  return Math.floor(seconds) + " seconds";
},
    
//determine next bundle date
nextPatchDay : function (dateString, weekday) {
  const n = 2; //2nd Wednesday
  var date = new Date(dateString);
  var monthstogo = (12-date.getMonth()) % 3;

  var count = 0,
  idate = new Date(date.getFullYear(), date.getMonth()+ monthstogo, 1);

  while (true) {
    if (idate.getDay() === weekday) {
      if (++count == n) {
        break;
      }
    }
    idate.setDate(idate.getDate() + 1);
  }
  if (idate < date) {
      return this.nextPatchDay(date.setMonth(date.getMonth()+1), weekday);
  } else {
    return idate;
  }
},
deep_value: function(obj, path) {
    var ret = obj;
    for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
        ret = ret[path[i]];
        if (ret === undefined) {
            break;
        }
    };
    return ret;
},
getDocuments: async function(schemaName, ids) {
    const res = await fetch('/' + schemaName + '/json/' + ids.join(','), {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/plain, */*'
            },
            redirect: 'error'     
    });
    const json = await res.json();
    return json.docs;
},
getCVESummarySet: function(docs, cmap) {
    var csumSet = {};
    for (sa of docs) {
        csumSet[sa.body.ID] = this.sumCVE(sa.body.CVE_list, cmap);
    }
    return csumSet;
},
getCVEMap: function(docs) {
    var cmap = {};
    for(var doc of docs) {
        cmap[doc.body.CVE_data_meta.ID] = doc.body;
    }
    return cmap;
},
saCVESet: function(docs) {
    var idSet = new Set();
    for (doc of docs) {
        for(var d of doc.body.CVE_list) {
            if (d.CVE) {
                for(var x of d.CVE.match(/CVE-\d{4}-[a-zA-Z\d\._-]{4,}/img)) {
                    idSet.add(x);
                }
             }
        }
    }
    return idSet;
},
    
addToSet: function(s, a) {
    if(s) {
        if(a) {
            for(item of a) {
                s.add(item);
            }
        }
    } else {
        s = new Set(a);
    }
    return s;
},

saIndex: function(docs, csumSet) {
return docs.map(d => ({
      Advisory: d.body.ID,
      CVE: d.body.CVE_list.map(x => (x.CVE.split(/[\s,]+/))),
      CVSS: (d.body.cvss && d.body.cvss.baseScore > 0) ? d.body.cvss.baseScore : (csumSet && csumSet[d.body.ID] ? csumSet[d.body.ID].maxCVSS.baseScore : ""),
      Date: d.body.DATE_PUBLIC,
      Title: d.body.TITLE,
      State: d.body.STATE,
      Defect: csumSet && csumSet[d.body.ID] ?
        Array.from(this.addToSet(csumSet[d.body.ID].aggregate.defect, d.body.defect).values()):"",
      ToDo: d.body.CNA_private.todo,
      Owner: d.body.CNA_private.owner
  }));
},
sumCVE: function(list, cmap) {
    var maxCVSS = {baseScore: 0.0};
    var aggFields = ['work_around', 'solution', 'credit', 'defect'];
    var aggregate = {defect:new Set()};
    var urlSet = {};
    var idSet = {};
    var summary = {};
    for(var cve of list) {
     if (cve.CVE) {
         //console.log(cve.CVE);
      for(var id of cve.CVE.match(/CVE-\d{4}-[a-zA-Z\d\._-]{4,}/img)) {
        idSet[id] = 1;
          //console.log(' idSet = ' + JSON.stringify(idSet));
        if(cve.summary) {
            summary[id] = cve.summary;
        }
      }
     }
    }
    for(var id in idSet) {
        urlSet["http://cve.mitre.org/cgi-bin/cvename.cgi?name="+id] = id + " at cve.mitre.org";
        if(cmap[id]) {
            for(var af of aggFields) {
                if (cmap[id][af]) {
                    var aggmap = aggregate[af];
                    if (!aggmap) {
                        aggmap = {};
                        aggregate[af] = aggmap;
                    }
                    var t = [];
                    for(var d of cmap[id][af]) {
                        t.push(d.value);
                    }
                    var concattext = t.join("\n");
                    if(concattext) {
                        var cvek = aggmap[concattext];
                        if (!cvek) {
                            cvek = []
                            aggmap[concattext] = cvek;
                        }
                        cvek.push(id);
                    }
                }
            }
            if(cmap[id].source && cmap[id].source.defect) {
                for(var d of cmap[id].source.defect) {
                    aggregate['defect'].add(d); 
                    //console.log('Adding ' + Array.from(aggregate.defect.values()));
                }
            }
            if(cmap[id].impact && cmap[id].impact.cvss) {
                if(cmap[id].impact.cvss.baseScore > maxCVSS.baseScore + 0) {
                    maxCVSS = cmap[id].impact.cvss;
                }
            }
            if(cmap[id].references) {
                for(var r of cmap[id].references.reference_data) {
                    urlSet[r.url] = r.url
                }
            }
        }
    }
    return ({
       maxCVSS: maxCVSS,
       aggregate: aggregate,
       urlSet: urlSet,
       idSet: idSet,
       summary: summary
    })     
},

    
    diffline: function(line1, line2) {
        var ret1 = [];
        var ret2 = [];
        var s = 0;
        var m = line1.length - 1;
        var n = line2.length - 1;
        while (s <= m && s <= n && (line1.charAt(s) == line2.charAt(s))) {
            s++;
        }

        while (s <= m && s <= n && (line1.charAt(m) == line2.charAt(n))) {
            m--;
            n--;
        }

        // deleted
        if (s <= m) {
            ret1.push({t:0, str: line1.substring(0, s)});
            //StringBuilder sb = new StringBuilder();
            //sb.append(Util.htmlize(line1.substring(0, s)));
            ret1.push({t:1, str: line1.substring(s, m + 1)});
            ret1.push({t:0, str: line1.substring(m+1, line1.length)}); 
            //sb.append(Util.htmlize(line1.substring(m + 1, line1.length())));
            //ret1.push({t:0, str: line1.substring(0, s)}) 
            //    = sb.toString();
        } else {
            ret1.push({t:0, str: line1});
            //ret[0] = Util.htmlize(line1.toString()); // no change
        }

        // added
        if (s <= n) {
            ret2.push({t:0,str:line2.substring(0, s)});
            ret2.push({t:1,str:line2.substring(s, n + 1)});
            ret2.push({t:0,str:line2.substring(n + 1, line2.length)});
            //StringBuilder sb = new StringBuilder();
            //sb.append(Util.htmlize(line2.substring(0, s)));
            //sb.append(HtmlConsts.SPAN_A);
            //sb.append(Util.htmlize(line2.substring(s, n + 1)));
            //sb.append(HtmlConsts.ZSPAN);
            //sb.append(Util.htmlize(line2.substring(n + 1, line2.length())));
            //ret[1] = sb.toString();
        } else {
            ret2.push({t:0,str: line2});
            //ret[1] = Util.htmlize(line2.toString()); // no change
        }

        return {lhs: ret1, rhs: ret2};
    },
    fileSize : function(a,b,c,d,e){
        return (b=Math,c=b.log,d=1024,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)
            +' '+(e?'KMGTPEZY'[--e]+'B':'Bytes')
    }
};
if(typeof module !== 'undefined') {
    module.exports = textUtil;
}

var cvssjs = {
    vectorMap: {
                "attackVector": "AV",
                "attackComplexity": "AC",
                "privilegesRequired": "PR",
                "userInteraction": "UI",
                "scope": "S",
                "confidentialityImpact": "C",
                "integrityImpact": "I",
                "availabilityImpact": "A"
   },
vector: function(cvss) {
     var sep = "/";
    var r= "CVSS:3.0";
     for (var m in cvss) {
        if (this.vectorMap[m] && cvss[m]) {
            r += sep + this.vectorMap[m] + ':' + cvss[m].charAt(0);
        }
    }
    return r;

},
   CVSSseveritys: [{
    name: "NONE",
    bottom: 0.0,
    top: 0.0
}, {
    name: "LOW",
    bottom: 0.1,
    top: 3.9
}, {
    name: "MEDIUM",
    bottom: 4.0,
    top: 6.9
}, {
    name: "HIGH",
    bottom: 7.0,
    top: 8.9
}, {
    name: "CRITICAL",
    bottom: 9.0,
    top: 10.0
}],
    severityLevel: function(score) {
        if(score == 0) {
            return 'NONE'
        } else if(score <= 3.9) {
            return 'LOW'
        } else if(score <= 6.9) {
            return 'MEDIUM'
        } else if(score <= 8.9) {
            return 'HIGH'
        } else {
            return 'CRITICAL'
        }
    },
    severity: function (score) {
        var i;
        var severityRatingLength = this.CVSSseveritys.length;
        for (i = 0; i < severityRatingLength; i++) {
            if (score >= this.CVSSseveritys[i].bottom && score <= this.CVSSseveritys[i].top) {
                return this.CVSSseveritys[i];
            }
        }
        return {
            name: "?",
            bottom: 'Not',
            top: 'defined'
        };
    },
    calculate: function (cvss) {
        var cvssVersion = "3.0";
        var exploitabilityCoefficient = 8.22;
        var scopeCoefficient = 1.08;

        // Define associative arrays mapping each metric value to the constant used in the CVSS scoring formula.

        var Weight = {
            attackVector: {
                NETWORK: 0.85,
                ADJACENT_NETWORK: 0.62,
                LOCAL: 0.55,
                PHYSICAL: 0.2
            },
            attackComplexity: {
                HIGH: 0.44,
                LOW: 0.77
            },
            privilegesRequired: {
                UNCHANGED: {
                    NONE: 0.85,
                    LOW: 0.62,
                    HIGH: 0.27
                },
                // These values are used if Scope is Unchanged
                CHANGED: {
                    NONE: 0.85,
                    LOW: 0.68,
                    HIGH: 0.5
                }
            },
            // These values are used if Scope is Changed
            userInteraction: {
                NONE: 0.85,
                REQUIRED: 0.62
            },
            scope: {
                UNCHANGED: 6.42,
                CHANGED: 7.52
            },
            confidentialityImpact: {
                NONE: 0,
                LOW: 0.22,
                HIGH: 0.56
            },
            integrityImpact: {
                NONE: 0,
                LOW: 0.22,
                HIGH: 0.56
            },
            availabilityImpact: {
                NONE: 0,
                LOW: 0.22,
                HIGH: 0.56
            }
            // C, I and A have the same weights

        };

        var p;
        var val = {},
            metricWeight = {};
        try {
            for (p in Weight) {
                val[p] = cvss[p];
                if (typeof val[p] === "undefined" || val[p] === '' || val[p] == null) {
                    return "?";
                }
                metricWeight[p] = Weight[p][val[p]];
            }
        } catch (err) {
            return err; // TODO: need to catch and return sensible error value & do a better job of specifying *which* parm is at fault.
        }
        metricWeight.privilegesRequired = Weight.privilegesRequired[val.scope][val.privilegesRequired];
        //
        // CALCULATE THE CVSS BASE SCORE
        //
        try {
            var baseScore;
            var impactSubScore;
            var exploitabalitySubScore = exploitabilityCoefficient * metricWeight.attackVector * metricWeight.attackComplexity * metricWeight.privilegesRequired * metricWeight.userInteraction;
            var impactSubScoreMultiplier = (1 - ((1 - metricWeight.confidentialityImpact) * (1 - metricWeight.integrityImpact) * (1 - metricWeight.availabilityImpact)));
            if (val.scope === 'UNCHANGED') {
                impactSubScore = metricWeight.scope * impactSubScoreMultiplier;
            } else {
                impactSubScore = metricWeight.scope * (impactSubScoreMultiplier - 0.029) - 3.25 * Math.pow(impactSubScoreMultiplier - 0.02, 15);
            }


            if (impactSubScore <= 0) {
                baseScore = 0;
            } else {
                if (val.scope === 'UNCHANGED') {
                    baseScore = Math.min((exploitabalitySubScore + impactSubScore), 10);
                } else {
                    baseScore = Math.min((exploitabalitySubScore + impactSubScore) * scopeCoefficient, 10);
                }
            }

            baseScore = Math.ceil(baseScore * 10) / 10;
            return baseScore;
        } catch (err) {
            return err;
        }
    }
}

