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

//for inserting images as data URLs in wysihytml5 widget
function loadimg(e) {
    var sibs = this.parentNode.parentNode.childNodes;
    var f = sibs[1];
    var ok = sibs[4];
    e.preventDefault();
    var file = this.files[0];
    if(file.size > 528385) {
        alert('Image size should less than 500k');
        return false;
    };
    if(file.type.indexOf("image")==-1){
        alert("Not an image!");
        return false;
    }
    var reader = new FileReader();
    reader.onload = function (event) {
        f.value = event.target.result;
        ok.click();
    };
    reader.readAsDataURL(file);
    return false;
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
    return JSON.stringify(cve, null, "    ");
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
                    var prefix = product.product_name  + " ";
                    if(version.version_name && version.version_name != "") {
                        prefix += version.version_name + " ";
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
                            vv = prefix + "versions earlier than " + version.version_value;
                            break;
                        case ">":
                        case "?>":
                            vv = prefix + "versions later than " + version.version_value;
                            break;
                        case "<=":
                        case "!<=":
                        case "?<=":
                            vv = product.product_name  + " " + version.version_value + " and earlier versions";
                            break;
                        case ">=":
                        case "!>=":
                        case "?>=":
                            vv = product.product_name  + " " + version.version_value + " and later versions";
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
            ret.push(p + "\n" + ob[p].join(';\n') + ".");
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
affectedTable: function (cve) {
    var status={};
    for (var vendor of cve.affects.vendor.vendor_data) {
        var vendor_name = vendor.vendor_name;
        if(!status[vendor_name]) {
            status[vendor_name] = {};
        }
        for(var product of vendor.product.product_data) {
            var product_name = product.product_name;
            if(!status[vendor_name][product_name]) {
                status[vendor_name][product_name] = {};
            }
            for(var version of product.version.version_data) {
                var vv = version.version_value;
                var cat = "affected";
                var prefix = vn = "";
                if(version.version_name && version.version_name != "") {
                    vn = version.version_name;
                }
                if(version.version_affected) {
                    if(version.version_affected.startsWith('?')) {
                        cat = "unknown";
                    } else if (version.version_affected.startsWith('!')) {
                        cat = "unaffected";
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
                            vv = "< " + version.version_value;
                            break;
                        case ">":
                        case "?>":
                            vv = "> " + version.version_value;
                            break;
                        case "<=":
                        case "!<=":
                        case "?<=":
                            vv = "<= " + version.version_value;
                            break;
                        case ">=":
                        case "!>=":
                        case "?>=":
                            vv = ">= " + version.version_value;
                            break;
                        default:
                            vv = version.version_value;
                    }
                }
                if(version.platform && version.platform != "") {
                    vv += ' on ' + version.platform;
                }
                if(!status[vendor_name][product_name][vn]) {
                    status[vendor_name][product_name][vn] = {};
                }
                
                if (!status[vendor_name][product_name][vn][cat]) {
                    status[vendor_name][product_name][vn][cat] = [];
                }
                status[vendor_name][product_name][vn][cat].push(vv);
            }
        }
    }
    return status;
},
appliesTo: function(affects){
    var ret = [];
    for (var vendor of affects.vendor.vendor_data) {
        var vendor_name = vendor.vendor_name;
        for(var product of vendor.product.product_data) {
            var product_name = product.product_name;
            for(var version of product.version.version_data) {
                var vv = version.version_value;
                var prefix = vn = "";
                if(version.version_name && version.version_name != "") {
                    vn = version.version_name;
                }
                if(version.version_affected) {
                    if(version.version_affected.startsWith('?')) {
                        cat = "unknown";
                    } else if (version.version_affected.startsWith('!')) {
                        cat = "no";
                    }
                    switch (version.version_affected) {
                        case "=":
                        case "<":
                        case ">":
                        case "<=":
                        case ">=":
                            ret.push(product_name + ' ' + vn);
                            break;
                    }
                }
            }
        }
    }
    return ret;
},
affectedYesNo: function(affects){
    var status={yes:[],no:[],unknown:[]};
    for (var vendor of affects.vendor.vendor_data) {
        var vendor_name = vendor.vendor_name;
        for(var product of vendor.product.product_data) {
            var product_name = product.product_name;
            for(var version of product.version.version_data) {
                var vv = version.version_value;
                var cat = "yes";
                var prefix = vn = "";
                if(version.version_name && version.version_name != "") {
                    vn = version.version_name;
                }
                if(version.version_affected) {
                    if(version.version_affected.startsWith('?')) {
                        cat = "unknown";
                    } else if (version.version_affected.startsWith('!')) {
                        cat = "no";
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
                            vv = "< " + version.version_value;
                            break;
                        case ">":
                        case "?>":
                            vv = "> " + version.version_value;
                            break;
                        case "<=":
                        case "!<=":
                        case "?<=":
                            vv = "<= " + version.version_value;
                            break;
                        case ">=":
                        case "!>=":
                        case "?>=":
                            vv = ">= " + version.version_value;
                            break;
                        default:
                            vv = version.version_value;
                    }
                    if(version.platform && version.platform != "") {
                            vv += ' on ' + version.platform;
                    }
                }
                var ph = status[cat][product_name];
                if(ph == undefined) {
                    ph = status[cat][product_name] = {};
                }
                vns = ph.version_names;
                if(vns == undefined) {
                    vns = ph.version_names = []
                }
                if(vns.indexOf(vn)<0) {
                    vns.push(vn);
                }
                vvs = ph.version_values;
                if(vvs == undefined) {
                    vvs = ph.version_values = []
                }
                if(vvs.indexOf(vv)<0) {
                    vvs.push(vv);
                }
            }
        }
    }
    var rstatus = {yes:[],no:[],unknown:[]};
    for (var cat of ['yes','no','unknown']){
        for(var p in status[cat]) {
           rstatus[cat].push({product:p, version_names:status[cat][p].version_names, version_values: status[cat][p].version_values})
        }
    }
    return rstatus;
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
        if (key === "__proto__" || key === "constructor") continue;
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
getDocuments: async function(schemaName, ids, paths) {
    const res = await fetch('/' + schemaName + '/json/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            redirect: 'error',
            body: JSON.stringify({ids:ids,fields:paths})
    });
    const docs = await res.json();
    return docs;
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
    vectorMap2: {
        "accessVector": "AV",
        "accessComplexity": "AC",
        "authentication": "Au",
        "confidentialityImpact": "C",
        "integrityImpact": "I",
        "availabilityImpact": "A"
    },
    // Define associative arrays mapping each metric value to the constant used in the CVSS scoring formula.
    Weight: {
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
    },
    vector: function (cvss) {
        var sep = "/";
        var r = "CVSS:3.1";
        for (var m in cvss) {
            if (this.vectorMap[m] && cvss[m]) {
                r += sep + this.vectorMap[m] + ':' + cvss[m].charAt(0);
            }
        }
        return r;

    },
    vector2: function (cvss) {
        var sep = "/";
        var r = [];
        for (var m in cvss) {
            if (this.vectorMap2[m] && cvss[m]) {
                r.push(this.vectorMap2[m] + ':' + cvss[m].charAt(0));
            }
        }
        return r.join('/');
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
    severityLevel: function (score) {
        if (score == 0) {
            return 'NONE'
        } else if (score <= 3.9) {
            return 'LOW'
        } else if (score <= 6.9) {
            return 'MEDIUM'
        } else if (score <= 8.9) {
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
    roundUp1: function Roundup(input) {
        var int_input = Math.round(input * 100000);
        if (int_input % 10000 === 0) {
            return int_input / 100000
        } else {
            return (Math.floor(int_input / 10000) + 1) / 10
        }
    },
    calculate: function (cvss) {
        var cvssVersion = "3.1";
        var exploitabilityCoefficient = 8.22;
        var scopeCoefficient = 1.08;
        var p;
        var val = {},
            metricWeight = {};
        try {
            for (p in this.Weight) {
                val[p] = cvss[p];
                if (typeof val[p] === "undefined" || val[p] === '' || val[p] == null) {
                    return "?";
                }
                metricWeight[p] = this.Weight[p][val[p]];
            }
        } catch (err) {
            return err; // TODO: need to catch and return sensible error value & do a better job of specifying *which* parm is at fault.
        }
        metricWeight.privilegesRequired = this.Weight.privilegesRequired[val.scope][val.privilegesRequired];
        //
        // CALCULATE THE CVSS BASE SCORE
        //
        try {
            var baseScore, impactSubScore, impact, exploitability;
            var impactSubScoreMultiplier = (1 - ((1 - metricWeight.confidentialityImpact) * (1 - metricWeight.integrityImpact) * (1 - metricWeight.availabilityImpact)));
            if (val.scope === 'UNCHANGED') {
                impactSubScore = metricWeight.scope * impactSubScoreMultiplier;
            } else {
                impactSubScore = metricWeight.scope * (impactSubScoreMultiplier - 0.029) - 3.25 * Math.pow(impactSubScoreMultiplier - 0.02, 15);
            }
            exploitabality = exploitabilityCoefficient * metricWeight.attackVector * metricWeight.attackComplexity * metricWeight.privilegesRequired * metricWeight.userInteraction;
            if (impactSubScore <= 0) {
                baseScore = 0;
            } else {
                if (val.scope === 'UNCHANGED') {
                    baseScore = this.roundUp1(Math.min((exploitabality + impactSubScore), 10));
                } else {
                    baseScore = this.roundUp1(Math.min((exploitabality + impactSubScore) * scopeCoefficient, 10));
                }
            }
            return baseScore.toFixed(1);
        } catch (err) {
            return err;
        }
    },
    w2: {
        accessComplexity: {
            HIGH: 0.35,
            MEDIUM: 0.61,
            LOW: 0.71
        },
        authentication: {
            NONE: 0.704,
            SINGLE: 0.56,
            MULTIPLE: 0.45
        },
        accessVector: {
            LOCAL: 0.395, ADJACENT_NETWORK: 0.646,
            NETWORK: 1
        },
        confidentialityImpact: {
            NONE: 0,
            PARTIAL: 0.275,
            COMPLETE: 0.660
        },
        integrityImpact: {
            NONE: 0,
            PARTIAL: 0.275,
            COMPLETE: 0.660
        },
        availabilityImpact: {
            NONE: 0,
            PARTIAL: 0.275,
            COMPLETE: 0.660
        }
    },
    calculate2: function(cvss) {
        var w2 = this.w2;
        var impact = 10.41 * (1 -
             (1-w2.confidentialityImpact[cvss.confidentialityImpact])
             *(1-w2.integrityImpact[cvss.integrityImpact])
             *(1-w2.availabilityImpact[cvss.availabilityImpact]));
        if (impact == 0) {
            return 0;
        }
        var exploitabality = 20.0 
            * w2.accessComplexity[cvss.accessComplexity]
            * w2.authentication[cvss.authentication]
            * w2.accessVector[cvss.accessVector];

        return ((0.6*impact + 0.4*exploitabality - 1.5)*1.176).toFixed(1);
    }
}
