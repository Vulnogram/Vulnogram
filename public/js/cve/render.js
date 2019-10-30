function pug_attr(t,e,n,r){if(!1===e||null==e||!e&&("class"===t||"style"===t))return"";if(!0===e)return" "+(r?t:t+'="'+t+'"');var f=typeof e;return"object"!==f&&"function"!==f||"function"!=typeof e.toJSON||(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;function pugRender(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (Date, Object, cmap, defectURL, doc, doc_id, isNaN, renderTemplate, textUtil) {pug_mixins["mitre"] = pug_interp = function(cve){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Ch2\u003EMITRE CVE entry preview\u003C\u002Fh2\u003E\u003Cdiv id=\"GeneratedTable\"\u003E\u003Ctable cellpadding=\"0\" cellspacing=\"0\" border=\"0\"\u003E\u003Ctbody\u003E\u003Ctr\u003E\u003Cth colspan=\"2\"\u003ECVE-ID\u003C\u002Fth\u003E\u003C\u002Ftr\u003E\u003Ctr\u003E\u003Ctd nowrap=\"nowrap\"\u003E\u003Ch2\u003E" + (pug_escape(null == (pug_interp = cve.CVE_data_meta.ID) ? "" : pug_interp)) + "\u003C\u002Fh2\u003E\u003C\u002Ftd\u003E\u003Ctd class=\"ltgreybackground\"\u003E\u003Cdiv class=\"larger\"\u003E\u003Ca\u003ELearn more at National Vulnerability Database (NVD)\u003C\u002Fa\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"smaller\"\u003E• Severity Rating • Fix Information • Vulnerable Software Versions • SCAP Mappings\u003C\u002Fdiv\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr\u003E\u003Cth colspan=\"2\"\u003EDescription\u003C\u002Fth\u003E\u003C\u002Ftr\u003E\u003Ctr\u003E\u003Ctd colspan=\"2\"\u003E";
// iterate cve.description.description_data
;(function(){
  var $$obj = cve.description.description_data;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var d = $$obj[pug_index0];
pug_html = pug_html + ((pug_escape(null == (pug_interp = d.value) ? "" : pug_interp)) + (pug_escape(null == (pug_interp = ' ') ? "" : pug_interp)));
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var d = $$obj[pug_index0];
pug_html = pug_html + ((pug_escape(null == (pug_interp = d.value) ? "" : pug_interp)) + (pug_escape(null == (pug_interp = ' ') ? "" : pug_interp)));
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr\u003E\u003Cth colspan=\"2\"\u003EReferences\u003C\u002Fth\u003E\u003C\u002Ftr\u003E\u003Ctr\u003E\u003Ctd class=\"note\" colspan=\"2\"\u003E\u003Cb\u003ENote: \u003C\u002Fb\u003E\u003Ca\u003EReferences\u003C\u002Fa\u003E are provided for the convenience of the reader to help distinguish between vulnerabilities. The list is not intended to be complete.\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr\u003E\u003Ctd colspan=\"2\"\u003E\u003Cul\u003E";
// iterate cve.references.reference_data
;(function(){
  var $$obj = cve.references.reference_data;
  if ('number' == typeof $$obj.length) {
      for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {
        var r = $$obj[pug_index1];
pug_html = pug_html + "\u003Cli\u003E\u003Ca" + (" target=\"_blank\""+pug_attr("href", r.url, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = r.url) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index1 in $$obj) {
      $$l++;
      var r = $$obj[pug_index1];
pug_html = pug_html + "\u003Cli\u003E\u003Ca" + (" target=\"_blank\""+pug_attr("href", r.url, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = r.url) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ful\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr\u003E\u003Cth colspan=\"2\"\u003EAssigning CNA\u003C\u002Fth\u003E\u003C\u002Ftr\u003E\u003Ctr\u003E\u003Ctd colspan=\"2\"\u003E" + (pug_escape(null == (pug_interp = cve.CVE_data_meta.ASSIGNER) ? "" : pug_interp)) + " (MITRE uses CNA name instead of email address)\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr\u003E\u003Cth colspan=\"2\"\u003EDate Entry Created\u003C\u002Fth\u003E\u003C\u002Ftr\u003E\u003Ctr\u003E\u003Ctd\u003E\u003Cb\u003EYYYYMMDD\u003C\u002Fb\u003E\u003C\u002Ftd\u003E\u003Ctd class=\"ltgreybackground\"\u003EDisclaimer: The entry creation date may reflect when the CVE-ID was allocated or reserved, and does not necessarily indicate when this vulnerability was discovered, shared with the affected vendor, publicly disclosed, or updated in CVE.\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003C\u002Ftbody\u003E\u003C\u002Ftable\u003E\u003C\u002Fdiv\u003E";
};
pug_mixins["para"] = pug_interp = function(t, hypertext){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (t) {
if (hypertext) {
pug_html = pug_html + "\u003Cp\u003E" + (pug_escape(null == (pug_interp = t) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";
}
else {
// iterate t.split(/\n/)
;(function(){
  var $$obj = t.split(/\n/);
  if ('number' == typeof $$obj.length) {
      for (var pug_index2 = 0, $$l = $$obj.length; pug_index2 < $$l; pug_index2++) {
        var line = $$obj[pug_index2];
if (line) {
if (line.startsWith('  ')) {
pug_html = pug_html + "\u003Ccode\u003E" + (pug_escape(null == (pug_interp = line) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E\u003Cbr\u002F\u003E";
}
else {
pug_html = pug_html + "\u003Cp\u003E" + (pug_escape(null == (pug_interp = line) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";
}
}
      }
  } else {
    var $$l = 0;
    for (var pug_index2 in $$obj) {
      $$l++;
      var line = $$obj[pug_index2];
if (line) {
if (line.startsWith('  ')) {
pug_html = pug_html + "\u003Ccode\u003E" + (pug_escape(null == (pug_interp = line) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E\u003Cbr\u002F\u003E";
}
else {
pug_html = pug_html + "\u003Cp\u003E" + (pug_escape(null == (pug_interp = line) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";
}
}
    }
  }
}).call(this);

}
}
};
pug_mixins["mpara"] = pug_interp = function(l, hypertext){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (l) {
// iterate l
;(function(){
  var $$obj = l;
  if ('number' == typeof $$obj.length) {
      for (var pug_index3 = 0, $$l = $$obj.length; pug_index3 < $$l; pug_index3++) {
        var d = $$obj[pug_index3];
if (d.value) {
pug_mixins["para"](d.value, hypertext);
}
      }
  } else {
    var $$l = 0;
    for (var pug_index3 in $$obj) {
      $$l++;
      var d = $$obj[pug_index3];
if (d.value) {
pug_mixins["para"](d.value, hypertext);
}
    }
  }
}).call(this);

}
};
pug_mixins["aggpara"] = pug_interp = function(l){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (l) {
pug_html = pug_html + "\u003Cul\u003E";
// iterate l
;(function(){
  var $$obj = l;
  if ('number' == typeof $$obj.length) {
      for (var v = 0, $$l = $$obj.length; v < $$l; v++) {
        var k = $$obj[v];
pug_html = pug_html + "\u003Cli\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = k.join(', ')) ? "" : pug_interp)) + "\u003C\u002Fb\u003E\u003Cp\u003E";
pug_mixins["para"](v);
pug_html = pug_html + "\u003C\u002Fp\u003E\u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var v in $$obj) {
      $$l++;
      var k = $$obj[v];
pug_html = pug_html + "\u003Cli\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = k.join(', ')) ? "" : pug_interp)) + "\u003C\u002Fb\u003E\u003Cp\u003E";
pug_mixins["para"](v);
pug_html = pug_html + "\u003C\u002Fp\u003E\u003C\u002Fli\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ful\u003E";
}
};
pug_mixins["linklist"] = pug_interp = function(l, url){
var block = (this && this.block), attributes = (this && this.attributes) || {};
// iterate l
;(function(){
  var $$obj = l;
  if ('number' == typeof $$obj.length) {
      for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
        var v = $$obj[i];
if ((i < l.length-2)) {
if ((url)) {
pug_html = pug_html + "\u003Ca" + (pug_attr("href", url+v, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = v) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = v) ? "" : pug_interp));
}
pug_html = pug_html + ", ";
}
else {
if ((i == l.length - 1 && i > 0)) {
pug_html = pug_html + " and ";
}
if ((url)) {
pug_html = pug_html + "\u003Ca" + (pug_attr("href", url+v, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = v) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = v) ? "" : pug_interp));
}
}
      }
  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;
      var v = $$obj[i];
if ((i < l.length-2)) {
if ((url)) {
pug_html = pug_html + "\u003Ca" + (pug_attr("href", url+v, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = v) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = v) ? "" : pug_interp));
}
pug_html = pug_html + ", ";
}
else {
if ((i == l.length - 1 && i > 0)) {
pug_html = pug_html + " and ";
}
if ((url)) {
pug_html = pug_html + "\u003Ca" + (pug_attr("href", url+v, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = v) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = v) ? "" : pug_interp));
}
}
    }
  }
}).call(this);

};
pug_mixins["CVSS"] = pug_interp = function(value){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + (pug_escape(null == (pug_interp = value.baseScore.toFixed(1)) ? "" : pug_interp)) + " ";
if (value.version >= "3") {
pug_html = pug_html + "(\u003Ca" + (pug_attr("href", "https://cvssjs.github.io/#" + value.vectorString, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value.vectorString) ? "" : pug_interp)) + "\u003C\u002Fa\u003E)";
}
else {
pug_html = pug_html + "\u003Ca" + (pug_attr("href", 'https://nvd.nist.gov/vuln-metrics/cvss/v2-calculator?vector='+value.vectorString, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value.vectorString) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
};
pug_mixins["renderDate"] = pug_interp = function(value){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var v = false;
if (value instanceof Date) { v = value;} else {
var timestamp = Date.parse(value);
v = isNaN(timestamp) ? false : new Date(timestamp)
}
if (v) {
pug_html = pug_html + (pug_escape(null == (pug_interp = v.toJSON().substr(0,10)) ? "" : pug_interp));
}
};
pug_mixins["slide"] = pug_interp = function(cve){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Cdiv class=\"page wht shd pad2 gap\"\u003E\u003Cb class=\"slideTitle\"\u003E";
if (cve.source && cve.source.advisory) {
pug_html = pug_html + (pug_escape(null == (pug_interp = cve.source.advisory) ? "" : pug_interp)) + "             ";
}
pug_html = pug_html + (pug_escape(null == (pug_interp = cve.CVE_data_meta.TITLE + ' (' + cve.CVE_data_meta.ID + ')') ? "" : pug_interp)) + "\u003C\u002Fb\u003E\u003Cul class=\"bullets\"\u003E\u003Cli\u003E\u003Cb class=\"term\"\u003ECVSS: \u003C\u002Fb\u003E\u003Cspan class=\"text\"\u003E";
if (cve.impact && cve.impact.cvss) {
pug_mixins["CVSS"](cve.impact.cvss);
}
pug_html = pug_html + "\u003C\u002Fspan\u003E\u003C\u002Fli\u003E\u003Cli\u003E\u003Cb class=\"term\"\u003EPR: \u003C\u002Fb\u003E\u003Cspan class=\"text\"\u003E" + (pug_escape(null == (pug_interp = cve.source.defect) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fli\u003E\u003Cli\u003E\u003Cb class=\"term\"\u003EAffects: \u003C\u002Fb\u003E\u003Cspan class=\"text\"\u003E" + (pug_escape(null == (pug_interp = textUtil.getProductAffected(cve)) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fli\u003E\u003Cli\u003E\u003Cb class=\"term\"\u003EProblem: \u003C\u002Fb\u003E\u003Cspan class=\"text\"\u003E";
pug_mixins["mpara"](cve.description.description_data.slice(0,1));
if (cmap && Object.keys(cmap).length > 0 && cmap.constructor === Object) {
pug_mixins["mpara"](cve.CNA_private.CVE_table_description);
// iterate cmap
;(function(){
  var $$obj = cmap;
  if ('number' == typeof $$obj.length) {
      for (var id = 0, $$l = $$obj.length; id < $$l; id++) {
        var x = $$obj[id];
pug_html = pug_html + (pug_escape(null == (pug_interp = id + " ") ? "" : pug_interp));
      }
  } else {
    var $$l = 0;
    for (var id in $$obj) {
      $$l++;
      var x = $$obj[id];
pug_html = pug_html + (pug_escape(null == (pug_interp = id + " ") ? "" : pug_interp));
    }
  }
}).call(this);

}
pug_html = pug_html + "\u003C\u002Fspan\u003E\u003C\u002Fli\u003E\u003Cli\u003E\u003Cb class=\"term\"\u003EWorkaround: \u003C\u002Fb\u003E\u003Cspan class=\"text\"\u003E";
pug_mixins["mpara"](cve.work_around);
pug_html = pug_html + "\u003C\u002Fspan\u003E\u003C\u002Fli\u003E\u003Cli\u003E\u003Cb class=\"term\"\u003ESolution: \u003C\u002Fb\u003E\u003Cspan class=\"text\"\u003E";
pug_mixins["mpara"](cve.solution);
pug_html = pug_html + "\u003C\u002Fspan\u003E\u003C\u002Fli\u003E\u003C\u002Ful\u003E\u003C\u002Fdiv\u003E";
};
pug_mixins["page"] = pug_interp = function(cve){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var sourceText = {"INTERNAL":"This issue was found during internal product security testing or research.", "EXTERNAL":"This issue was discovered during an external security research.", "USER":"This issue was seen during production usage.", "UNKNOWN":""};
var CDM = cve.CVE_data_meta;
var cveid = CDM.ID.match(/^CVE-[0-9-]+$/)? CDM.ID : 'CVE-yyyy-nnnn';
pug_html = pug_html + "\u003Ch2\u003E";
if (cve.source && cve.source.advisory) {
pug_html = pug_html + (pug_escape(null == (pug_interp = cve.source.advisory) ? "" : pug_interp)) + " ";
}
pug_html = pug_html + (pug_escape(null == (pug_interp = CDM.TITLE + ' (' + cveid + ')') ? "" : pug_interp)) + "\u003C\u002Fh2\u003E\u003Ch4\u003EPRODUCT AFFECTED:\u003C\u002Fh4\u003E\u003Cp\u003E" + (pug_escape(null == (pug_interp = textUtil.getProductAffected(cve)) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003Ch4\u003EPROBLEM:\u003C\u002Fh4\u003E";
pug_mixins["mpara"](cve.description.description_data);
pug_mixins["mpara"](cve.configuration);
pug_mixins["mpara"](cve.exploit);
if (cve.source) {
if (sourceText[cve.source.discovery]) {
pug_html = pug_html + "\u003Cp\u003E" + (pug_escape(null == (pug_interp = sourceText[cve.source.discovery]) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";
}
if (CDM.AKA) {
pug_html = pug_html + "\u003Cp\u003EThis issue is also known as " + (pug_escape(null == (pug_interp = CDM.AKA) ? "" : pug_interp)) + ".\u003C\u002Fp\u003E";
}
}
if (cmap && Object.keys(cmap).length > 0 && cmap.constructor === Object) {
pug_mixins["mpara"](cve.CNA_private.CVE_table_description);
pug_html = pug_html + "\u003Ctable class=\"striped\"\u003E\u003Ctr class=\"rowHead\"\u003E\u003Cth\u003ECVE\u003C\u002Fth\u003E\u003Cth\u003ECVSS\u003C\u002Fth\u003E\u003Cth\u003ESummary\u003C\u002Fth\u003E\u003C\u002Ftr\u003E";
// iterate cmap
;(function(){
  var $$obj = cmap;
  if ('number' == typeof $$obj.length) {
      for (var id = 0, $$l = $$obj.length; id < $$l; id++) {
        var x = $$obj[id];
pug_html = pug_html + "\u003Ctr\u003E\u003Ctd\u003E" + (pug_escape(null == (pug_interp = id) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
if (cmap[id] && cmap[id].impact) {
pug_mixins["CVSS"](cmap[id].impact.cvss);
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
if (cmap[id] && cmap[id].summary) {
pug_html = pug_html + (pug_escape(null == (pug_interp = cmap[id].summary) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var id in $$obj) {
      $$l++;
      var x = $$obj[id];
pug_html = pug_html + "\u003Ctr\u003E\u003Ctd\u003E" + (pug_escape(null == (pug_interp = id) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
if (cmap[id] && cmap[id].impact) {
pug_mixins["CVSS"](cmap[id].impact.cvss);
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
if (cmap[id] && cmap[id].summary) {
pug_html = pug_html + (pug_escape(null == (pug_interp = cmap[id].summary) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftable\u003E";
}
else {
pug_html = pug_html + "\u003Cp\u003EThis issue has been assigned \u003Ca" + (pug_attr("href", "http://cve.mitre.org/cgi-bin/cvename.cgi?name="+cveid, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = cveid) ? "" : pug_interp)) + "\u003C\u002Fa\u003E.\u003C\u002Fp\u003E";
}
pug_html = pug_html + "\u003Ch4\u003ESOLUTION:\u003C\u002Fh4\u003E";
pug_mixins["mpara"](cve.solution);
if (cve.source.defect && cve.source.defect.length > 0) {
pug_html = pug_html + "\u003Cp\u003EThis issue is being tracked as ";
pug_mixins["linklist"](cve.source.defect, defectURL);
pug_html = pug_html + ".\u003C\u002Fp\u003E";
}
pug_html = pug_html + "\u003Ch4\u003EWORKAROUND:\u003C\u002Fh4\u003E";
pug_mixins["mpara"](cve.work_around);
pug_html = pug_html + "\u003Ch4\u003EMODIFICATION HISTORY:\u003C\u002Fh4\u003E\u003Cp\u003E\u003Cul\u003E\u003Cli\u003E";
pug_mixins["renderDate"](CDM.DATE_PUBLIC);
pug_html = pug_html + ": Initial Publication.\u003C\u002Fli\u003E\u003C\u002Ful\u003E\u003C\u002Fp\u003E\u003Ch4\u003ERELATED LINKS:\u003C\u002Fh4\u003E\u003Cul\u003E";
if (CDM.ID) {
pug_html = pug_html + "\u003Cli\u003E\u003Ca" + (pug_attr("href", "http://cve.mitre.org/cgi-bin/cvename.cgi?name="+cveid, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = cveid + " at cve.mitre.org") ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
}
// iterate cve.references.reference_data
;(function(){
  var $$obj = cve.references.reference_data;
  if ('number' == typeof $$obj.length) {
      for (var pug_index8 = 0, $$l = $$obj.length; pug_index8 < $$l; pug_index8++) {
        var r = $$obj[pug_index8];
pug_html = pug_html + "\u003Cli\u003E\u003Ca" + (pug_attr("href", r.url, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = r.url) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index8 in $$obj) {
      $$l++;
      var r = $$obj[pug_index8];
pug_html = pug_html + "\u003Cli\u003E\u003Ca" + (pug_attr("href", r.url, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = r.url) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ful\u003E\u003Ch4\u003ECVSS SCORE:\u003C\u002Fh4\u003E";
if (cve.impact && cve.impact.cvss) {
pug_html = pug_html + "\u003Cp\u003E";
pug_mixins["CVSS"](cve.impact.cvss);
pug_html = pug_html + "\u003C\u002Fp\u003E";
if (cve.impact.cvss.baseSeverity) {
pug_html = pug_html + "\u003Ch4\u003ERISK LEVEL:\u003C\u002Fh4\u003E\u003Cp\u003E" + (pug_escape(null == (pug_interp = cve.impact.cvss.baseSeverity) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";
}
}
if (cve.credit && cve.credit.length > 0) {
pug_html = pug_html + "\u003Ch4\u003EACKNOWLEDGEMENTS:\u003C\u002Fh4\u003E\u003Cul\u003E";
// iterate cve.credit
;(function(){
  var $$obj = cve.credit;
  if ('number' == typeof $$obj.length) {
      for (var pug_index9 = 0, $$l = $$obj.length; pug_index9 < $$l; pug_index9++) {
        var c = $$obj[pug_index9];
pug_html = pug_html + "\u003Cli\u003E" + (pug_escape(null == (pug_interp = c.value) ? "" : pug_interp)) + "\u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index9 in $$obj) {
      $$l++;
      var c = $$obj[pug_index9];
pug_html = pug_html + "\u003Cli\u003E" + (pug_escape(null == (pug_interp = c.value) ? "" : pug_interp)) + "\u003C\u002Fli\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ful\u003E";
}
if (cve.CNA_private && cve.CNA_private.internal_comments) {
pug_html = pug_html + "\u003Ch4\u003EINTERNAL COMMENTS:\u003C\u002Fh4\u003E\u003Cp\u003E";
pug_mixins["para"](cve.CNA_private.internal_comments);
pug_html = pug_html + "\u003C\u002Fp\u003E";
}
};
pug_html = pug_html + "\u003Cdiv class=\"big\"\u003E" + (pug_escape(null == (pug_interp = doc_id) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E";
if (doc) {
if (renderTemplate == 'default') {
delete doc._id;
pug_mixins["page"](doc);
}
else
if (renderTemplate != undefined) {
try {
{
pug_mixins[renderTemplate](doc);
}
} catch(e) {
{
delete doc._id;        
pug_mixins["page"](doc);
}
}
}
}
else {
pug_html = pug_html + "\u003Cdiv class=\"tred\"\u003EDocument not found\u003C\u002Fdiv\u003E";
}}.call(this,"Date" in locals_for_with?locals_for_with.Date:typeof Date!=="undefined"?Date:undefined,"Object" in locals_for_with?locals_for_with.Object:typeof Object!=="undefined"?Object:undefined,"cmap" in locals_for_with?locals_for_with.cmap:typeof cmap!=="undefined"?cmap:undefined,"defectURL" in locals_for_with?locals_for_with.defectURL:typeof defectURL!=="undefined"?defectURL:undefined,"doc" in locals_for_with?locals_for_with.doc:typeof doc!=="undefined"?doc:undefined,"doc_id" in locals_for_with?locals_for_with.doc_id:typeof doc_id!=="undefined"?doc_id:undefined,"isNaN" in locals_for_with?locals_for_with.isNaN:typeof isNaN!=="undefined"?isNaN:undefined,"renderTemplate" in locals_for_with?locals_for_with.renderTemplate:typeof renderTemplate!=="undefined"?renderTemplate:undefined,"textUtil" in locals_for_with?locals_for_with.textUtil:typeof textUtil!=="undefined"?textUtil:undefined));;return pug_html;}