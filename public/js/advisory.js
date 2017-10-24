function pug_attr(t,e,n,f){return e!==!1&&null!=e&&(e||"class"!==t&&"style"!==t)?e===!0?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||e.indexOf('"')===-1)?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;function advisoryTemplate(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (textUtil) {pug_mixins["para"] = pug_interp = function(t){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (t) {
// iterate t.split(/\n/)
;(function(){
  var $$obj = t.split(/\n/);
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var line = $$obj[pug_index0];
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
    for (var pug_index0 in $$obj) {
      $$l++;
      var line = $$obj[pug_index0];
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
};
pug_mixins["page"] = pug_interp = function(cve){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var cveid = cve.CVE_data_meta.ID.match(/^CVE-[0-9-]+$/)? cve.CVE_data_meta.ID : 'CVE-yyyy-nnnn'
pug_html = pug_html + "\u003Ch2\u003E" + (pug_escape(null == (pug_interp = cve.CVE_data_meta.TITLE + ' (' + cveid + ')') ? "" : pug_interp)) + "\u003C\u002Fh2\u003E\u003Ch4\u003EPRODUCT AFFECTED:\u003C\u002Fh4\u003E\u003Cp\u003E" + (pug_escape(null == (pug_interp = textUtil.getProductAffected(cve)) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003Ch4\u003EPROBLEM:\u003C\u002Fh4\u003E";
// iterate cve.description.description_data
;(function(){
  var $$obj = cve.description.description_data;
  if ('number' == typeof $$obj.length) {
      for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {
        var d = $$obj[pug_index1];
pug_mixins["para"](d.value);
      }
  } else {
    var $$l = 0;
    for (var pug_index1 in $$obj) {
      $$l++;
      var d = $$obj[pug_index1];
pug_mixins["para"](d.value);
    }
  }
}).call(this);

if (cve.configuration) {
// iterate cve.configuration
;(function(){
  var $$obj = cve.configuration;
  if ('number' == typeof $$obj.length) {
      for (var pug_index2 = 0, $$l = $$obj.length; pug_index2 < $$l; pug_index2++) {
        var c = $$obj[pug_index2];
pug_mixins["para"](c.value);
      }
  } else {
    var $$l = 0;
    for (var pug_index2 in $$obj) {
      $$l++;
      var c = $$obj[pug_index2];
pug_mixins["para"](c.value);
    }
  }
}).call(this);

}
if (cve.exploit) {
pug_mixins["para"](cve.exploit);
}
pug_html = pug_html + "\u003Cp\u003EThis issue has been assigned \u003Ca" + (pug_attr("href", "http://cve.mitre.org/cgi-bin/cvename.cgi?name="+cveid, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = cveid) ? "" : pug_interp)) + "\u003C\u002Fa\u003E.\u003C\u002Fp\u003E\u003Ch4\u003ESOLUTION:\u003C\u002Fh4\u003E";
pug_mixins["para"](cve.solution);
pug_html = pug_html + "\u003Ch4\u003EWORKAROUND:\u003C\u002Fh4\u003E";
if (cve.work_around) {
// iterate cve.work_around
;(function(){
  var $$obj = cve.work_around;
  if ('number' == typeof $$obj.length) {
      for (var pug_index3 = 0, $$l = $$obj.length; pug_index3 < $$l; pug_index3++) {
        var w = $$obj[pug_index3];
pug_mixins["para"](w.value);
      }
  } else {
    var $$l = 0;
    for (var pug_index3 in $$obj) {
      $$l++;
      var w = $$obj[pug_index3];
pug_mixins["para"](w.value);
    }
  }
}).call(this);

}
pug_html = pug_html + "\u003Ch4\u003EMODIFICATION HISTORY:\u003C\u002Fh4\u003E\u003Cp\u003E\u003Cul\u003E\u003Cli\u003E" + (pug_escape(null == (pug_interp = cve.CVE_data_meta.DATE_PUBLIC + ": Initial Publication.") ? "" : pug_interp)) + "\u003C\u002Fli\u003E\u003C\u002Ful\u003E\u003C\u002Fp\u003E\u003Ch4\u003ERELATED LINKS:\u003C\u002Fh4\u003E\u003Cul\u003E";
if (cve.CVE_data_meta.ID) {
pug_html = pug_html + "\u003Cli\u003E\u003Ca" + (pug_attr("href", "http://cve.mitre.org/cgi-bin/cvename.cgi?name="+cveid, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = cveid + " at cve.mitre.org") ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
}
// iterate cve.references.reference_data
;(function(){
  var $$obj = cve.references.reference_data;
  if ('number' == typeof $$obj.length) {
      for (var pug_index4 = 0, $$l = $$obj.length; pug_index4 < $$l; pug_index4++) {
        var r = $$obj[pug_index4];
pug_html = pug_html + "\u003Cli\u003E\u003Ca" + (pug_attr("href", r.url, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = r.url) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index4 in $$obj) {
      $$l++;
      var r = $$obj[pug_index4];
pug_html = pug_html + "\u003Cli\u003E\u003Ca" + (pug_attr("href", r.url, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = r.url) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ful\u003E\u003Ch4\u003ECVSS SCORE:\u003C\u002Fh4\u003E";
if (cve.impact && cve.impact.cvss) {
pug_html = pug_html + "\u003Cp\u003E";
if (cve.impact.cvss.baseScore >= 0) {
pug_html = pug_html + (pug_escape(null == (pug_interp = cve.impact.cvss.baseScore) ? "" : pug_interp));
}
if (cve.impact.cvss.vectorString) {
pug_html = pug_html + " (\u003Ca" + (pug_attr("href", "https://cvssjs.github.io/#" + cve.impact.cvss.vectorString, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = cve.impact.cvss.vectorString) ? "" : pug_interp)) + "\u003C\u002Fa\u003E)";
}
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
      for (var pug_index5 = 0, $$l = $$obj.length; pug_index5 < $$l; pug_index5++) {
        var c = $$obj[pug_index5];
pug_html = pug_html + "\u003Cli\u003E" + (pug_escape(null == (pug_interp = c) ? "" : pug_interp)) + "\u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index5 in $$obj) {
      $$l++;
      var c = $$obj[pug_index5];
pug_html = pug_html + "\u003Cli\u003E" + (pug_escape(null == (pug_interp = c) ? "" : pug_interp)) + "\u003C\u002Fli\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ful\u003E";
}
};



















































pug_mixins["page"](locals);}.call(this,"textUtil" in locals_for_with?locals_for_with.textUtil:typeof textUtil!=="undefined"?textUtil:undefined));;return pug_html;} function pug_attr(t,e,n,f){return e!==!1&&null!=e&&(e||"class"!==t&&"style"!==t)?e===!0?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||e.indexOf('"')===-1)?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;function mitrewebTemplate(locals) {var pug_html = "", pug_mixins = {}, pug_interp;pug_mixins["page"] = pug_interp = function(cve){
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
pug_mixins["page"](locals);;return pug_html;}