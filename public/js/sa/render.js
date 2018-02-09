function pug_attr(t,e,n,f){return e!==!1&&null!=e&&(e||"class"!==t&&"style"!==t)?e===!0?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||e.indexOf('"')===-1)?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)s=pug_classes(r[g]),s&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+="",";"!==r[r.length-1]?r+";":r}function pugRender(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (Array, Date, JSON, Object, String, cSum, cmap, conf, defectURL, diffline, doc, docs, id, isNaN, page, parseFloat, renderComplete, renderTemplate, schemaName, username) {pug_mixins["saSlide"] = pug_interp = function(doc,cmap, cSum){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Cli class=\"page\"\u003E" + (pug_escape(null == (pug_interp = doc.ID) ? "" : pug_interp)) + " " + (pug_escape(null == (pug_interp = doc.TITLE) ? "" : pug_interp)) + "\u003Col\u003E\u003Cli\u003EPR: ";
var bugs = cSum.aggregate.defect;
if (doc.defect) for(var d of doc.defect) { bugs.add(d)};
pug_html = pug_html + (pug_escape(null == (pug_interp = Array.from(bugs.values())) ? "" : pug_interp)) + "\u003C\u002Fli\u003E\u003Cli\u003ECVSS: ";
pug_mixins["renderVal"]('CVSSFull', cSum.maxCVSS);
pug_html = pug_html + "\u003C\u002Fli\u003E\u003Cli\u003EAffects: " + (pug_escape(null == (pug_interp = doc.PRODUCT_AFFECTED) ? "" : pug_interp)) + "\u003C\u002Fli\u003E\u003Cli\u003E";
pug_mixins["mpara"](doc.description);
pug_html = pug_html + "\u003C\u002Fli\u003E\u003Cli\u003ESolution: ";
pug_mixins["mpara"](doc.solution);
pug_html = pug_html + "\u003C\u002Fli\u003E\u003C\u002Fol\u003E\u003C\u002Fli\u003E";
};
pug_mixins["saPage"] = pug_interp = function(doc,cmap, cSum){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Ch2\u003E" + (pug_escape(null == (pug_interp = doc.ID) ? "" : pug_interp)) + " " + (pug_escape(null == (pug_interp = doc.TITLE) ? "" : pug_interp)) + "\u003C\u002Fh2\u003E\u003Ch4\u003EPRODUCT AFFECTED:\u003C\u002Fh4\u003E\u003Cp\u003E" + (pug_escape(null == (pug_interp = doc.PRODUCT_AFFECTED) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003Ch4\u003EPROBLEM:\u003C\u002Fh4\u003E";
pug_mixins["mpara"](doc.description);
if (cSum) {
if (cSum.idSet) {
pug_html = pug_html + "\u003Ctable class=\"striped\"\u003E\u003Ctr class=\"rowHead\"\u003E\u003Cth\u003ECVE\u003C\u002Fth\u003E\u003Cth\u003ECVSS\u003C\u002Fth\u003E\u003Cth\u003ESummary\u003C\u002Fth\u003E\u003C\u002Ftr\u003E";
// iterate cSum.idSet
;(function(){
  var $$obj = cSum.idSet;
  if ('number' == typeof $$obj.length) {
      for (var id = 0, $$l = $$obj.length; id < $$l; id++) {
        var x = $$obj[id];
pug_html = pug_html + "\u003Ctr\u003E\u003Ctd\u003E" + (pug_escape(null == (pug_interp = id) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
if (cmap[id] && cmap[id].impact) {
pug_mixins["renderVal"]('CVSSFull', cmap[id].impact.cvss);
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
if (cSum.summary[id]) {
pug_html = pug_html + (pug_escape(null == (pug_interp = cSum.summary[id]) ? "" : pug_interp));
}
else
if (cmap[id] && cmap[id].CVE_data_meta) {
pug_html = pug_html + (pug_escape(null == (pug_interp = cmap[id].CVE_data_meta.TITLE) ? "" : pug_interp));
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
pug_mixins["renderVal"]('CVSSFull', cmap[id].impact.cvss);
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
if (cSum.summary[id]) {
pug_html = pug_html + (pug_escape(null == (pug_interp = cSum.summary[id]) ? "" : pug_interp));
}
else
if (cmap[id] && cmap[id].CVE_data_meta) {
pug_html = pug_html + (pug_escape(null == (pug_interp = cmap[id].CVE_data_meta.TITLE) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftable\u003E";
}
}
pug_html = pug_html + "\u003Ch4\u003ESOLUTION:\u003C\u002Fh4\u003E";
pug_mixins["mpara"](doc.solution);
pug_mixins["aggpara"](cSum.aggregate['solution']);
var bugs = cSum.aggregate.defect;
if (doc.defect) for(var d of doc.defect) { bugs.add(d)};
if (bugs.size > 0) {
pug_html = pug_html + "\u003Cp\u003E ";
if ((doc.CVE_list.length > 1)) {
pug_html = pug_html + "These issues are ";
}
else {
pug_html = pug_html + "This issue is ";
}
pug_html = pug_html + "being tracked as PR ";
pug_mixins["linklist"](Array.from(bugs.values()), defectURL);
pug_html = pug_html + ".\u003C\u002Fp\u003E";
}
pug_html = pug_html + "\u003Ch4\u003EWORKAROUND:\u003C\u002Fh4\u003E";
pug_mixins["mpara"](doc.work_around);
pug_mixins["aggpara"](cSum.aggregate['work_around']);
pug_html = pug_html + "\u003Ch4\u003EMODIFICATION HISTORY:\u003C\u002Fh4\u003E";
if (doc.DATE_PUBLIC) {
pug_html = pug_html + "\u003Cp\u003E\u003Cul\u003E\u003Cli\u003E";
pug_mixins["renderVal"]('date',doc.DATE_PUBLIC);
pug_html = pug_html + ": Initial Publication.\u003C\u002Fli\u003E\u003C\u002Ful\u003E\u003C\u002Fp\u003E";
}
pug_html = pug_html + "\u003Ch4\u003ERELATED LINKS:\u003C\u002Fh4\u003E\u003Cul\u003E";
if (cSum.urlSet) {
// iterate cSum.urlSet
;(function(){
  var $$obj = cSum.urlSet;
  if ('number' == typeof $$obj.length) {
      for (var t = 0, $$l = $$obj.length; t < $$l; t++) {
        var u = $$obj[t];
pug_html = pug_html + "\u003Cli\u003E\u003Ca" + (pug_attr("href", t, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = u) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var t in $$obj) {
      $$l++;
      var u = $$obj[t];
pug_html = pug_html + "\u003Cli\u003E\u003Ca" + (pug_attr("href", t, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = u) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
    }
  }
}).call(this);

}
pug_html = pug_html + "\u003C\u002Ful\u003E\u003Ch4\u003ECVSS SCORE:\u003C\u002Fh4\u003E\u003Cp\u003E";
pug_mixins["renderVal"]('CVSSFull', cSum.maxCVSS);
pug_html = pug_html + "\u003C\u002Fp\u003E\u003Ch4\u003ERISK LEVEL:\u003C\u002Fh4\u003E\u003Cp\u003E" + (pug_escape(null == (pug_interp = cSum.maxCVSS.baseSeverity) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";
if (cSum.aggregate['credit'] && Object.keys(cSum.aggregate['credit']).length > 0) {
pug_html = pug_html + "\u003Ch4\u003EACKNOWLEDGEMENTS:\u003C\u002Fh4\u003E";
pug_mixins["aggpara"](cSum.aggregate['credit']);
}
};
pug_mixins["para"] = pug_interp = function(t){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (t) {
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
};
pug_mixins["mpara"] = pug_interp = function(l){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (l) {
// iterate l
;(function(){
  var $$obj = l;
  if ('number' == typeof $$obj.length) {
      for (var pug_index3 = 0, $$l = $$obj.length; pug_index3 < $$l; pug_index3++) {
        var d = $$obj[pug_index3];
if (d.value) {
pug_mixins["para"](d.value);
}
      }
  } else {
    var $$l = 0;
    for (var pug_index3 in $$obj) {
      $$l++;
      var d = $$obj[pug_index3];
if (d.value) {
pug_mixins["para"](d.value);
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
pug_mixins["renderVal"] = pug_interp = function(name, value, sum){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (value != null) {
switch (name){
case 'ID':
pug_html = pug_html + "\u003Ca" + (" class=\"nobr\""+pug_attr("href", '/' + schemaName +'/'+ value, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
  break;
case 'CVE':
if (value instanceof Array) {
// iterate value
;(function(){
  var $$obj = value;
  if ('number' == typeof $$obj.length) {
      for (var pug_index6 = 0, $$l = $$obj.length; pug_index6 < $$l; pug_index6++) {
        var val = $$obj[pug_index6];
pug_mixins["renderVal"](name, val, sum);
pug_html = pug_html + " ";
      }
  } else {
    var $$l = 0;
    for (var pug_index6 in $$obj) {
      $$l++;
      var val = $$obj[pug_index6];
pug_mixins["renderVal"](name, val, sum);
pug_html = pug_html + " ";
    }
  }
}).call(this);

}
else {
pug_html = pug_html + "\u003Ca" + (" class=\"nobr\""+pug_attr("href", "/cve/" + value, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
  break;
case 'Draft':
pug_html = pug_html + "\u003Ca" + (pug_attr("href", "#" + value, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
  break;
case 'date':
if (value instanceof Date) {
pug_html = pug_html + "\u003Cspan class=\"nobr\"\u003E" + (pug_escape(null == (pug_interp = value.getFullYear()) ? "" : pug_interp)) + "-" + (pug_escape(null == (pug_interp = value.getMonth()+1) ? "" : pug_interp)) + "-" + (pug_escape(null == (pug_interp = value.getDate()) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
}
else {
pug_html = pug_html + "\u003Cspan class=\"nobr\"\u003E" + (pug_escape(null == (pug_interp = value.substr(0,10)) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
}
  break;
case 'state':
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([value], [true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
case 'ToDo':
if (value.length > 0) {
pug_html = pug_html + "\u003Cb class=\"badge\"\u003E" + (pug_escape(null == (pug_interp = value.length) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
  break;
case 'owner':
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes(["monogram",value.charAt(0)], [false,true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
case 'File':
pug_html = pug_html + "\u003Ca" + (pug_attr("href", page+(page.endsWith('/')? '':'/')+value, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
  break;
case 'Filetype':
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes(["square",value.charAt(0)], [false,true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
case 'CVSS':
var s = parseFloat(value)
if (isNaN(s) || s<0 || s>10) {
pug_html = pug_html + (pug_escape(null == (pug_interp = value) ? "" : pug_interp));
}
else
if (s == 0) {
pug_html = pug_html + "\u003Cb class=\"tag NONE\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else
if (value <= 3.9) {
pug_html = pug_html + "\u003Cb class=\"tag LOW\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else
if (value <= 6.9) {
pug_html = pug_html + "\u003Cb class=\"tag MEDIUM\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else
if (value <= 8.9) {
pug_html = pug_html + "\u003Cb class=\"tag HIGH\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else
if (value <=10) {
pug_html = pug_html + "\u003Cb class=\"tag CRITICAL\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = value) ? "" : pug_interp));
}
  break;
case 'CVSSFull':
pug_html = pug_html + (pug_escape(null == (pug_interp = value.baseScore.toFixed(1)) ? "" : pug_interp)) + " ";
if (value.version >= "3.0") {
pug_html = pug_html + "(\u003Ca" + (pug_attr("href", "https://cvssjs.github.io/#" + value.vectorString, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value.vectorString) ? "" : pug_interp)) + "\u003C\u002Fa\u003E)";
}
else {
pug_html = pug_html + "\u003Ca" + (pug_attr("href", 'https://nvd.nist.gov/vuln-metrics/cvss/v2-calculator?vector='+value.vectorString, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value.vectorString) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
  break;
case 'Defect':
if (!sum.Defect) {sum.Defect = {} }

var defects = value
if (typeof defects === 'string' || defects instanceof String) {defects = value.split(/\s+/)}
// iterate defects
;(function(){
  var $$obj = defects;
  if ('number' == typeof $$obj.length) {
      for (var pug_index7 = 0, $$l = $$obj.length; pug_index7 < $$l; pug_index7++) {
        var d = $$obj[pug_index7];
sum.Defect[d]++;
if (conf.defectURL) {
pug_html = pug_html + "\u003Ca" + (pug_attr("href", conf.defectURL + d, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = d) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = d) ? "" : pug_interp));
}
pug_html = pug_html + " ";
      }
  } else {
    var $$l = 0;
    for (var pug_index7 in $$obj) {
      $$l++;
      var d = $$obj[pug_index7];
sum.Defect[d]++;
if (conf.defectURL) {
pug_html = pug_html + "\u003Ca" + (pug_attr("href", conf.defectURL + d, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = d) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = d) ? "" : pug_interp));
}
pug_html = pug_html + " ";
    }
  }
}).call(this);

  break;
default:
if (value instanceof Array) {
// iterate value
;(function(){
  var $$obj = value;
  if ('number' == typeof $$obj.length) {
      for (var pug_index8 = 0, $$l = $$obj.length; pug_index8 < $$l; pug_index8++) {
        var v = $$obj[pug_index8];
pug_mixins["renderVal"](name, v, sum);
pug_html = pug_html + " ";
      }
  } else {
    var $$l = 0;
    for (var pug_index8 in $$obj) {
      $$l++;
      var v = $$obj[pug_index8];
pug_mixins["renderVal"](name, v, sum);
pug_html = pug_html + " ";
    }
  }
}).call(this);

}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = value) ? "" : pug_interp));
}
  break;
}
}
};
pug_mixins["renderCell"] = pug_interp = function(name, value, sum){
var block = (this && this.block), attributes = (this && this.attributes) || {};
switch (name){
case 'CVSS':
pug_html = pug_html + "\u003Ctd" + (pug_attr("class", pug_classes([name], [true]), false, false)+pug_attr("data-sort", value ? value.toFixed(3) : false, true, false)) + "\u003E";
pug_mixins["renderVal"](name, value, sum);
pug_html = pug_html + "\u003C\u002Ftd\u003E";
  break;
default:
pug_html = pug_html + "\u003Ctd" + (pug_attr("class", pug_classes([name], [true]), false, false)) + "\u003E";
pug_mixins["renderVal"](name, value, sum);
pug_html = pug_html + "\u003C\u002Ftd\u003E";
  break;
}
};





































































































































































































































pug_mixins["parseObject"] = pug_interp = function(obj){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (obj !== null) {
if (typeof obj === 'string') {
pug_html = pug_html + (pug_escape(null == (pug_interp = obj) ? "" : pug_interp));
}
else
if (typeof obj === 'object') {
// iterate obj
;(function(){
  var $$obj = obj;
  if ('number' == typeof $$obj.length) {
      for (var k = 0, $$l = $$obj.length; k < $$l; k++) {
        var v = $$obj[k];
pug_html = pug_html + "\u003Cdiv class=\"indent\"\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = k) ? "" : pug_interp)) + "\u003C\u002Fb\u003E: ";
if (typeof v === 'string') {
pug_html = pug_html + (pug_escape(null == (pug_interp = v) ? "" : pug_interp));
}
else {
pug_html = pug_html + "\u003Cdiv class=\"indent\"\u003E";
pug_mixins["parseObject"](v);
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
      }
  } else {
    var $$l = 0;
    for (var k in $$obj) {
      $$l++;
      var v = $$obj[k];
pug_html = pug_html + "\u003Cdiv class=\"indent\"\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = k) ? "" : pug_interp)) + "\u003C\u002Fb\u003E: ";
if (typeof v === 'string') {
pug_html = pug_html + (pug_escape(null == (pug_interp = v) ? "" : pug_interp));
}
else {
pug_html = pug_html + "\u003Cdiv class=\"indent\"\u003E";
pug_mixins["parseObject"](v);
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
    }
  }
}).call(this);

}
}
};
pug_mixins["comments"] = pug_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Cdiv class=\"page\" id=\"newComment\"\u003E\u003Cform class=\"editor\" onsubmit=\"sendComment(this);return false;\"\u003E\u003Cinput" + (" type=\"hidden\" name=\"id\""+pug_attr("value", id, true, false)) + "\u002F\u003E\u003Cdt\u003E\u003Cb" + (pug_attr("class", pug_classes(["monogram",username.charAt(0)], [false,true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = username) ? "" : pug_interp)) + "\u003C\u002Fb\u003E\u003C\u002Fdt\u003E\u003Ctextarea rows=\"6\" name=\"text\" onkeyup=\"setCommentButton(this, this.form.button)\" onblur=\"setCommentButton(this, this.form.button)\"\u003E\u003C\u002Ftextarea\u003E\u003Cbutton class=\"button\" name=\"button\" disabled=\"disabled\"\u003EAdd comment\u003C\u002Fbutton\u003E\u003C\u002Fform\u003E\u003C\u002Fdiv\u003E";
// iterate docs
;(function(){
  var $$obj = docs;
  if ('number' == typeof $$obj.length) {
      for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
        var c = $$obj[i];
pug_html = pug_html + "\u003Cdiv class=\"page\"\u003E\u003Cdt\u003E \u003Cb" + (pug_attr("class", pug_classes(["monogram",c.author.charAt(0)], [false,true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = c.author) ? "" : pug_interp)) + "\u003C\u002Fb\u003E commented on  " + (pug_escape(null == (pug_interp = new Date(c.createdAt).toLocaleDateString("en-US",{year: 'numeric', month: 'short', day: 'numeric'})) ? "" : pug_interp)) + " ";
if ((c.createdAt != c.updatedAt)) {
pug_html = pug_html + "(updated " + (pug_escape(null == (pug_interp = new Date(c.updatedAt).toLocaleDateString("en-US",{year: 'numeric', month: 'short', day: 'numeric'})) ? "" : pug_interp)) + ")";
}
pug_html = pug_html + ":  ";
if ((c.author == username)) {
pug_html = pug_html + "\u003Cbutton onclick=\"editPost(this.parentNode)\"\u003Eupdate\u003C\u002Fbutton\u003E";
}
pug_html = pug_html + "\u003C\u002Fdt\u003E\u003Cpre class=\"commentText\"\u003E" + (pug_escape(null == (pug_interp = c.body) ? "" : pug_interp)) + "\u003C\u002Fpre\u003E\u003Cinput" + (" type=\"hidden\" name=\"slug\""+pug_attr("value", c.slug, true, false)) + "\u002F\u003E\u003Cinput" + (" type=\"hidden\" name=\"date\""+pug_attr("value", c.createdAt, true, false)) + "\u002F\u003E\u003C\u002Fdiv\u003E";
      }
  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;
      var c = $$obj[i];
pug_html = pug_html + "\u003Cdiv class=\"page\"\u003E\u003Cdt\u003E \u003Cb" + (pug_attr("class", pug_classes(["monogram",c.author.charAt(0)], [false,true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = c.author) ? "" : pug_interp)) + "\u003C\u002Fb\u003E commented on  " + (pug_escape(null == (pug_interp = new Date(c.createdAt).toLocaleDateString("en-US",{year: 'numeric', month: 'short', day: 'numeric'})) ? "" : pug_interp)) + " ";
if ((c.createdAt != c.updatedAt)) {
pug_html = pug_html + "(updated " + (pug_escape(null == (pug_interp = new Date(c.updatedAt).toLocaleDateString("en-US",{year: 'numeric', month: 'short', day: 'numeric'})) ? "" : pug_interp)) + ")";
}
pug_html = pug_html + ":  ";
if ((c.author == username)) {
pug_html = pug_html + "\u003Cbutton onclick=\"editPost(this.parentNode)\"\u003Eupdate\u003C\u002Fbutton\u003E";
}
pug_html = pug_html + "\u003C\u002Fdt\u003E\u003Cpre class=\"commentText\"\u003E" + (pug_escape(null == (pug_interp = c.body) ? "" : pug_interp)) + "\u003C\u002Fpre\u003E\u003Cinput" + (" type=\"hidden\" name=\"slug\""+pug_attr("value", c.slug, true, false)) + "\u002F\u003E\u003Cinput" + (" type=\"hidden\" name=\"date\""+pug_attr("value", c.createdAt, true, false)) + "\u002F\u003E\u003C\u002Fdiv\u003E";
    }
  }
}).call(this);

};
pug_mixins["changes"] = pug_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var past = {add: 'added', remove: 'removed', replace: 'changed', move: 'moved', copy: 'copied'}
pug_html = pug_html + "\u003Ctable class=\"diff\"\u003E";
// iterate docs
;(function(){
  var $$obj = docs;
  if ('number' == typeof $$obj.length) {
      for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
        var v = $$obj[i];
pug_html = pug_html + "\u003Ctbody\u003E";
// iterate v.body.patch
;(function(){
  var $$obj = v.body.patch;
  if ('number' == typeof $$obj.length) {
      for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
        var op = $$obj[i];
pug_html = pug_html + "\u003Ctr class=\"head\"\u003E\u003Ctd colspan=\"3\"\u003EVersion " + (pug_escape(null == (pug_interp = v.__v) ? "" : pug_interp)) + " \u003Cb\u003E";
pug_mixins["renderVal"]('owner', v.author);
pug_html = pug_html + "\u003C\u002Fb\u003E " + (pug_escape(null == (pug_interp = past[op.op] ? past[op.op] : op.op) ? "" : pug_interp)) + " \u003Cb\u003E" + (pug_escape(null == (pug_interp = op.path) ? "" : pug_interp)) + "\u003C\u002Fb\u003E on ";
pug_mixins["renderVal"]('date', v.updatedAt);
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr" + (pug_attr("class", pug_classes(["change",op.op], [false,true]), false, false)) + "\u003E";
if (op.op == 'remove') {
op.old = op.value
delete op.value
}
if (op.op == 'replace' && typeof op.old === 'string' && typeof op.value === 'string') {
var diffs = diffline(op.old, op.value);
pug_html = pug_html + "\u003Ctd\u003E\u003Cpre\u003E";
// iterate diffs.lhs
;(function(){
  var $$obj = diffs.lhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index25 = 0, $$l = $$obj.length; pug_index25 < $$l; pug_index25++) {
        var s = $$obj[pug_index25];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"del\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
      }
  } else {
    var $$l = 0;
    for (var pug_index25 in $$obj) {
      $$l++;
      var s = $$obj[pug_index25];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"del\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fpre\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E\u003Cpre\u003E";
// iterate diffs.rhs
;(function(){
  var $$obj = diffs.rhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index26 = 0, $$l = $$obj.length; pug_index26 < $$l; pug_index26++) {
        var s = $$obj[pug_index26];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"add\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
      }
  } else {
    var $$l = 0;
    for (var pug_index26 in $$obj) {
      $$l++;
      var s = $$obj[pug_index26];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"add\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fpre\u003E\u003C\u002Ftd\u003E";
}
else {
pug_html = pug_html + "\u003Ctd\u003E";
if (op.old instanceof Object) {
pug_html = pug_html + "\u003Cpre\u003E" + (pug_escape(null == (pug_interp = JSON.stringify(op.old, null, 3)) ? "" : pug_interp)) + "\u003C\u002Fpre\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = op.old) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E";
if (op.value instanceof Object) {
pug_html = pug_html + "\u003Cpre\u003E" + (pug_escape(null == (pug_interp = JSON.stringify(op.value, null, 3)) ? "" : pug_interp)) + "\u003C\u002Fpre\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = op.value) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Ftd\u003E";
}
pug_html = pug_html + "\u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;
      var op = $$obj[i];
pug_html = pug_html + "\u003Ctr class=\"head\"\u003E\u003Ctd colspan=\"3\"\u003EVersion " + (pug_escape(null == (pug_interp = v.__v) ? "" : pug_interp)) + " \u003Cb\u003E";
pug_mixins["renderVal"]('owner', v.author);
pug_html = pug_html + "\u003C\u002Fb\u003E " + (pug_escape(null == (pug_interp = past[op.op] ? past[op.op] : op.op) ? "" : pug_interp)) + " \u003Cb\u003E" + (pug_escape(null == (pug_interp = op.path) ? "" : pug_interp)) + "\u003C\u002Fb\u003E on ";
pug_mixins["renderVal"]('date', v.updatedAt);
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr" + (pug_attr("class", pug_classes(["change",op.op], [false,true]), false, false)) + "\u003E";
if (op.op == 'remove') {
op.old = op.value
delete op.value
}
if (op.op == 'replace' && typeof op.old === 'string' && typeof op.value === 'string') {
var diffs = diffline(op.old, op.value);
pug_html = pug_html + "\u003Ctd\u003E\u003Cpre\u003E";
// iterate diffs.lhs
;(function(){
  var $$obj = diffs.lhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index27 = 0, $$l = $$obj.length; pug_index27 < $$l; pug_index27++) {
        var s = $$obj[pug_index27];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"del\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
      }
  } else {
    var $$l = 0;
    for (var pug_index27 in $$obj) {
      $$l++;
      var s = $$obj[pug_index27];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"del\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fpre\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E\u003Cpre\u003E";
// iterate diffs.rhs
;(function(){
  var $$obj = diffs.rhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index28 = 0, $$l = $$obj.length; pug_index28 < $$l; pug_index28++) {
        var s = $$obj[pug_index28];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"add\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
      }
  } else {
    var $$l = 0;
    for (var pug_index28 in $$obj) {
      $$l++;
      var s = $$obj[pug_index28];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"add\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fpre\u003E\u003C\u002Ftd\u003E";
}
else {
pug_html = pug_html + "\u003Ctd\u003E";
if (op.old instanceof Object) {
pug_html = pug_html + "\u003Cpre\u003E" + (pug_escape(null == (pug_interp = JSON.stringify(op.old, null, 3)) ? "" : pug_interp)) + "\u003C\u002Fpre\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = op.old) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E";
if (op.value instanceof Object) {
pug_html = pug_html + "\u003Cpre\u003E" + (pug_escape(null == (pug_interp = JSON.stringify(op.value, null, 3)) ? "" : pug_interp)) + "\u003C\u002Fpre\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = op.value) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Ftd\u003E";
}
pug_html = pug_html + "\u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftbody\u003E";
      }
  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;
      var v = $$obj[i];
pug_html = pug_html + "\u003Ctbody\u003E";
// iterate v.body.patch
;(function(){
  var $$obj = v.body.patch;
  if ('number' == typeof $$obj.length) {
      for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
        var op = $$obj[i];
pug_html = pug_html + "\u003Ctr class=\"head\"\u003E\u003Ctd colspan=\"3\"\u003EVersion " + (pug_escape(null == (pug_interp = v.__v) ? "" : pug_interp)) + " \u003Cb\u003E";
pug_mixins["renderVal"]('owner', v.author);
pug_html = pug_html + "\u003C\u002Fb\u003E " + (pug_escape(null == (pug_interp = past[op.op] ? past[op.op] : op.op) ? "" : pug_interp)) + " \u003Cb\u003E" + (pug_escape(null == (pug_interp = op.path) ? "" : pug_interp)) + "\u003C\u002Fb\u003E on ";
pug_mixins["renderVal"]('date', v.updatedAt);
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr" + (pug_attr("class", pug_classes(["change",op.op], [false,true]), false, false)) + "\u003E";
if (op.op == 'remove') {
op.old = op.value
delete op.value
}
if (op.op == 'replace' && typeof op.old === 'string' && typeof op.value === 'string') {
var diffs = diffline(op.old, op.value);
pug_html = pug_html + "\u003Ctd\u003E\u003Cpre\u003E";
// iterate diffs.lhs
;(function(){
  var $$obj = diffs.lhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index30 = 0, $$l = $$obj.length; pug_index30 < $$l; pug_index30++) {
        var s = $$obj[pug_index30];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"del\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
      }
  } else {
    var $$l = 0;
    for (var pug_index30 in $$obj) {
      $$l++;
      var s = $$obj[pug_index30];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"del\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fpre\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E\u003Cpre\u003E";
// iterate diffs.rhs
;(function(){
  var $$obj = diffs.rhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index31 = 0, $$l = $$obj.length; pug_index31 < $$l; pug_index31++) {
        var s = $$obj[pug_index31];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"add\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
      }
  } else {
    var $$l = 0;
    for (var pug_index31 in $$obj) {
      $$l++;
      var s = $$obj[pug_index31];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"add\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fpre\u003E\u003C\u002Ftd\u003E";
}
else {
pug_html = pug_html + "\u003Ctd\u003E";
if (op.old instanceof Object) {
pug_html = pug_html + "\u003Cpre\u003E" + (pug_escape(null == (pug_interp = JSON.stringify(op.old, null, 3)) ? "" : pug_interp)) + "\u003C\u002Fpre\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = op.old) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E";
if (op.value instanceof Object) {
pug_html = pug_html + "\u003Cpre\u003E" + (pug_escape(null == (pug_interp = JSON.stringify(op.value, null, 3)) ? "" : pug_interp)) + "\u003C\u002Fpre\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = op.value) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Ftd\u003E";
}
pug_html = pug_html + "\u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;
      var op = $$obj[i];
pug_html = pug_html + "\u003Ctr class=\"head\"\u003E\u003Ctd colspan=\"3\"\u003EVersion " + (pug_escape(null == (pug_interp = v.__v) ? "" : pug_interp)) + " \u003Cb\u003E";
pug_mixins["renderVal"]('owner', v.author);
pug_html = pug_html + "\u003C\u002Fb\u003E " + (pug_escape(null == (pug_interp = past[op.op] ? past[op.op] : op.op) ? "" : pug_interp)) + " \u003Cb\u003E" + (pug_escape(null == (pug_interp = op.path) ? "" : pug_interp)) + "\u003C\u002Fb\u003E on ";
pug_mixins["renderVal"]('date', v.updatedAt);
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr" + (pug_attr("class", pug_classes(["change",op.op], [false,true]), false, false)) + "\u003E";
if (op.op == 'remove') {
op.old = op.value
delete op.value
}
if (op.op == 'replace' && typeof op.old === 'string' && typeof op.value === 'string') {
var diffs = diffline(op.old, op.value);
pug_html = pug_html + "\u003Ctd\u003E\u003Cpre\u003E";
// iterate diffs.lhs
;(function(){
  var $$obj = diffs.lhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index32 = 0, $$l = $$obj.length; pug_index32 < $$l; pug_index32++) {
        var s = $$obj[pug_index32];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"del\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
      }
  } else {
    var $$l = 0;
    for (var pug_index32 in $$obj) {
      $$l++;
      var s = $$obj[pug_index32];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"del\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fpre\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E\u003Cpre\u003E";
// iterate diffs.rhs
;(function(){
  var $$obj = diffs.rhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index33 = 0, $$l = $$obj.length; pug_index33 < $$l; pug_index33++) {
        var s = $$obj[pug_index33];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"add\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
      }
  } else {
    var $$l = 0;
    for (var pug_index33 in $$obj) {
      $$l++;
      var s = $$obj[pug_index33];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"add\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fpre\u003E\u003C\u002Ftd\u003E";
}
else {
pug_html = pug_html + "\u003Ctd\u003E";
if (op.old instanceof Object) {
pug_html = pug_html + "\u003Cpre\u003E" + (pug_escape(null == (pug_interp = JSON.stringify(op.old, null, 3)) ? "" : pug_interp)) + "\u003C\u002Fpre\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = op.old) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E";
if (op.value instanceof Object) {
pug_html = pug_html + "\u003Cpre\u003E" + (pug_escape(null == (pug_interp = JSON.stringify(op.value, null, 3)) ? "" : pug_interp)) + "\u003C\u002Fpre\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = op.value) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Ftd\u003E";
}
pug_html = pug_html + "\u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftbody\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftable\u003E";
};
if (renderTemplate == 'advisory') {
pug_mixins["saPage"](doc, cmap, cSum);
renderComplete = true
}
if (renderTemplate == 'advisorySlide') {
pug_mixins["saSlide"](doc, cmap, cSum);
renderComplete = true
}
if (!renderComplete) {
switch (renderTemplate){
case 'comments':
pug_mixins["comments"]();
  break;
case 'changes':
pug_mixins["changes"]();
  break;
default:
pug_html = pug_html + "\u003C!--+parseObject(doc)--\u003E";
  break;
}
}}.call(this,"Array" in locals_for_with?locals_for_with.Array:typeof Array!=="undefined"?Array:undefined,"Date" in locals_for_with?locals_for_with.Date:typeof Date!=="undefined"?Date:undefined,"JSON" in locals_for_with?locals_for_with.JSON:typeof JSON!=="undefined"?JSON:undefined,"Object" in locals_for_with?locals_for_with.Object:typeof Object!=="undefined"?Object:undefined,"String" in locals_for_with?locals_for_with.String:typeof String!=="undefined"?String:undefined,"cSum" in locals_for_with?locals_for_with.cSum:typeof cSum!=="undefined"?cSum:undefined,"cmap" in locals_for_with?locals_for_with.cmap:typeof cmap!=="undefined"?cmap:undefined,"conf" in locals_for_with?locals_for_with.conf:typeof conf!=="undefined"?conf:undefined,"defectURL" in locals_for_with?locals_for_with.defectURL:typeof defectURL!=="undefined"?defectURL:undefined,"diffline" in locals_for_with?locals_for_with.diffline:typeof diffline!=="undefined"?diffline:undefined,"doc" in locals_for_with?locals_for_with.doc:typeof doc!=="undefined"?doc:undefined,"docs" in locals_for_with?locals_for_with.docs:typeof docs!=="undefined"?docs:undefined,"id" in locals_for_with?locals_for_with.id:typeof id!=="undefined"?id:undefined,"isNaN" in locals_for_with?locals_for_with.isNaN:typeof isNaN!=="undefined"?isNaN:undefined,"page" in locals_for_with?locals_for_with.page:typeof page!=="undefined"?page:undefined,"parseFloat" in locals_for_with?locals_for_with.parseFloat:typeof parseFloat!=="undefined"?parseFloat:undefined,"renderComplete" in locals_for_with?locals_for_with.renderComplete:typeof renderComplete!=="undefined"?renderComplete:undefined,"renderTemplate" in locals_for_with?locals_for_with.renderTemplate:typeof renderTemplate!=="undefined"?renderTemplate:undefined,"schemaName" in locals_for_with?locals_for_with.schemaName:typeof schemaName!=="undefined"?schemaName:undefined,"username" in locals_for_with?locals_for_with.username:typeof username!=="undefined"?username:undefined));;return pug_html;}