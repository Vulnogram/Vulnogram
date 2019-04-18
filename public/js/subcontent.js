function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function subdocRender(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (Array, Date, JSON, Math, Number, Object, Set, String, bulkInput, columns, conf, csrfToken, ctemplate, current, doc_id, docs, fields, files, id, isNaN, limit, onclick, page, pages, parseFloat, qs, query, rowCount, schemaName, tTime, textUtil, total, username) {pug_mixins["renderVal"] = pug_interp = function(name, value, sum){
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
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var val = $$obj[pug_index0];
pug_mixins["renderVal"](name, val, sum);
pug_html = pug_html + " ";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var val = $$obj[pug_index0];
pug_mixins["renderVal"](name, val, sum);
pug_html = pug_html + " ";
    }
  }
}).call(this);

}
else {
if (fields !=undefined && fields.CVE != undefined && fields.CVE.link) {
pug_html = pug_html + "\u003Ca" + (pug_attr("href", fields.CVE.link + value, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + "\u003Ca" + (pug_attr("href", "/cve/" + value, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
}
  break;
case 'Draft':
pug_html = pug_html + "\u003Ca" + (pug_attr("href", "#" + value, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
  break;
case 'yyyymmdd':
var v = false;
if (value instanceof Date) { v = value;} else {
var timestamp = Date.parse(value);
v = isNaN(timestamp) ? false : new Date(timestamp)
}
if (v) {
pug_html = pug_html + (pug_escape(null == (pug_interp = v.toJSON().substr(0,10)) ? "" : pug_interp));
}
  break;
case 'date':
var v = false;
if (value instanceof Date) { v = value;} else {
var timestamp = Date.parse(value);
v = isNaN(timestamp) ? false : new Date(timestamp)
}
if (v) {
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes(["nobr","date y"+ (new Date() > v ? Math.floor(Math.log2((new Date()).getFullYear()-v.getFullYear()+1)*2) : 'f tag')], [false,true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = v.toJSON().substr(0,10)) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
}
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
pug_html = pug_html + "\u003Cb class=\"rnd tag NONE\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else
if (value <= 3.9) {
pug_html = pug_html + "\u003Cb class=\"rnd tag LOW\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else
if (value <= 6.9) {
pug_html = pug_html + "\u003Cb class=\"rnd tag MEDIUM\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else
if (value <= 8.9) {
pug_html = pug_html + "\u003Cb class=\"rnd tag HIGH\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else
if (value <=10) {
pug_html = pug_html + "\u003Cb class=\"rnd tag CRITICAL\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
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
if (typeof defects === 'number') {defects = [value]}
// iterate defects
;(function(){
  var $$obj = defects;
  if ('number' == typeof $$obj.length) {
      for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {
        var d = $$obj[pug_index1];
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
    for (var pug_index1 in $$obj) {
      $$l++;
      var d = $$obj[pug_index1];
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
case 'level':
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes(["nobr","icn","l" + value.charAt(0)], [false,false,true]), false, false)+pug_attr("title", value, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
case 'scopes':
// iterate value
;(function(){
  var $$obj = value;
  if ('number' == typeof $$obj.length) {
      for (var pug_index2 = 0, $$l = $$obj.length; pug_index2 < $$l; pug_index2++) {
        var s = $$obj[pug_index2];
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes(["icn",s.Resolution,s.State,s['Resolution-Reason']?s['Resolution-Reason'].replace(/\s/g,''):null], [false,true,true,true]), false, false)+pug_attr("title", [s['Planned-Release'],s.State,s.Resolution,s['Resolution-Reason']].join(' - '), true, false)) + "\u003E" + (pug_escape(null == (pug_interp = s['Planned-Release']) ? "" : pug_interp)) + "\u003Cspan class=\"extra\"\u003E " + (pug_escape(null == (pug_interp = s.Resolution ? s.Resolution : s.State) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fspan\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index2 in $$obj) {
      $$l++;
      var s = $$obj[pug_index2];
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes(["icn",s.Resolution,s.State,s['Resolution-Reason']?s['Resolution-Reason'].replace(/\s/g,''):null], [false,true,true,true]), false, false)+pug_attr("title", [s['Planned-Release'],s.State,s.Resolution,s['Resolution-Reason']].join(' - '), true, false)) + "\u003E" + (pug_escape(null == (pug_interp = s['Planned-Release']) ? "" : pug_interp)) + "\u003Cspan class=\"extra\"\u003E " + (pug_escape(null == (pug_interp = s.Resolution ? s.Resolution : s.State) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fspan\u003E";
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
      for (var pug_index3 = 0, $$l = $$obj.length; pug_index3 < $$l; pug_index3++) {
        var v = $$obj[pug_index3];
pug_mixins["renderVal"](name, v, sum);
pug_html = pug_html + " ";
      }
  } else {
    var $$l = 0;
    for (var pug_index3 in $$obj) {
      $$l++;
      var v = $$obj[pug_index3];
pug_mixins["renderVal"](name, v, sum);
pug_html = pug_html + " ";
    }
  }
}).call(this);

}
else
if (value instanceof Date) {
pug_mixins["renderVal"]('date', value, sum);
}
else
if (typeof value === 'object') {
// iterate value
;(function(){
  var $$obj = value;
  if ('number' == typeof $$obj.length) {
      for (var k = 0, $$l = $$obj.length; k < $$l; k++) {
        var v = $$obj[k];
pug_html = pug_html + "\u003Cp\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = k) ? "" : pug_interp)) + "\u003C\u002Fb\u003E ";
pug_mixins["renderVal"](k, v, sum);
pug_html = pug_html + "\u003C\u002Fp\u003E";
      }
  } else {
    var $$l = 0;
    for (var k in $$obj) {
      $$l++;
      var v = $$obj[k];
pug_html = pug_html + "\u003Cp\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = k) ? "" : pug_interp)) + "\u003C\u002Fb\u003E ";
pug_mixins["renderVal"](k, v, sum);
pug_html = pug_html + "\u003C\u002Fp\u003E";
    }
  }
}).call(this);

}
else {
if (fields && fields[name]) {
if (fields[name].link) {
pug_html = pug_html + "\u003Ca" + (pug_attr("class", pug_classes([fields[name].class], [true]), false, false)+pug_attr("href", fields[name].link+value, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else
if (fields[name].class) {
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([fields[name].class + ' '+value], [true]), false, false)+pug_attr("title", value, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = value) ? "" : pug_interp));
}
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = value) ? "" : pug_interp));
}
}
  break;
}
}
};
pug_mixins["renderCell"] = pug_interp = function(name, value, sum){
var block = (this && this.block), attributes = (this && this.attributes) || {};
switch (name){
case 'CVE':
pug_html = pug_html + "\u003Ctd class=\"CVE\" style=\"width:8em;\"\u003E";
pug_mixins["renderVal"](name, value, sum);
pug_html = pug_html + "\u003C\u002Ftd\u003E";
  break;
case 'CVSS':
pug_html = pug_html + "\u003Ctd" + (" class=\"CVSS\""+pug_attr("data-sort", value ? value.toFixed(3) : false, true, false)) + "\u003E";
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
pug_mixins["hyperlevel"] = pug_interp = function(obj, name){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var value = obj[name];
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes(["nobr","icn","l" + value.charAt(0)], [false,false,true]), false, false)+pug_attr("title", value, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
};
pug_mixins["hyperscopes"] = pug_interp = function(obj, name){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var value = obj[name];
// iterate value
;(function(){
  var $$obj = value;
  if ('number' == typeof $$obj.length) {
      for (var pug_index5 = 0, $$l = $$obj.length; pug_index5 < $$l; pug_index5++) {
        var s = $$obj[pug_index5];
pug_html = pug_html + ("\u003Cspan" + (pug_attr("class", pug_classes(["icn",s.Resolution,s.State,s['Resolution-Reason']?s['Resolution-Reason'].replace(/\s/g,''):null], [false,true,true,true]), false, false)+pug_attr("title", [s['Planned-Release'],s.State,s.Resolution,s['Resolution-Reason']].join(' - '), true, false)) + "\u003E" + (pug_escape(null == (pug_interp = s['Planned-Release']) ? "" : pug_interp)) + "\u003Cspan class=\"extra\"\u003E " + (pug_escape(null == (pug_interp = s.Resolution ? s.Resolution : s.State) ? "" : pug_interp)));
if (s['Resolution-Reason']) {
pug_html = pug_html + (" " + (pug_escape(null == (pug_interp = s['Resolution-Reason']) ? "" : pug_interp)));
}
pug_html = pug_html + "\u003C\u002Fspan\u003E\u003C\u002Fspan\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index5 in $$obj) {
      $$l++;
      var s = $$obj[pug_index5];
pug_html = pug_html + ("\u003Cspan" + (pug_attr("class", pug_classes(["icn",s.Resolution,s.State,s['Resolution-Reason']?s['Resolution-Reason'].replace(/\s/g,''):null], [false,true,true,true]), false, false)+pug_attr("title", [s['Planned-Release'],s.State,s.Resolution,s['Resolution-Reason']].join(' - '), true, false)) + "\u003E" + (pug_escape(null == (pug_interp = s['Planned-Release']) ? "" : pug_interp)) + "\u003Cspan class=\"extra\"\u003E " + (pug_escape(null == (pug_interp = s.Resolution ? s.Resolution : s.State) ? "" : pug_interp)));
if (s['Resolution-Reason']) {
pug_html = pug_html + (" " + (pug_escape(null == (pug_interp = s['Resolution-Reason']) ? "" : pug_interp)));
}
pug_html = pug_html + "\u003C\u002Fspan\u003E\u003C\u002Fspan\u003E";
    }
  }
}).call(this);

};
pug_mixins["hyperCVSS"] = pug_interp = function(obj,name){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var value = obj[name]
var s = parseFloat(value)
if (isNaN(s) || s<0 || s>10) {
pug_html = pug_html + (pug_escape(null == (pug_interp = value) ? "" : pug_interp));
}
else
if (s == 0) {
pug_html = pug_html + "\u003Cb class=\"rnd tag-s NONE\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else
if (value <= 3.9) {
pug_html = pug_html + "\u003Cb class=\"rnd tag-s LOW\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else
if (value <= 6.9) {
pug_html = pug_html + "\u003Cb class=\"rnd tag-s MEDIUM\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else
if (value <= 8.9) {
pug_html = pug_html + "\u003Cb class=\"rnd tag-s HIGH\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else
if (value <=10) {
pug_html = pug_html + "\u003Cb class=\"rnd tag-s CRITICAL\"\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = value) ? "" : pug_interp));
}
};
pug_mixins["hypersize"] = pug_interp = function(obj, name){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if ((obj[name])) {
pug_html = pug_html + (pug_escape(null == (pug_interp = textUtil.fileSize(obj[name])) ? "" : pug_interp));
}
};
pug_mixins["hyperdate"] = pug_interp = function(obj, name){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var v = false;
var value = obj[name];
if (value instanceof Date) { v = value;} else {
var timestamp = Date.parse(value);
v = isNaN(timestamp) ? false : new Date(timestamp)
}
if (v) {
var nowt = Date.now();
var vtime = v.getTime();
var delta = nowt-vtime;
var hidey = '', hidem = '', hidet = '';
if (Math.abs(delta) > 43000000) { hidet = 'hid';}
// if (Math.abs(delta) < 43000000) { hidem = 'invis'; hidey = 'invis' } else if (Math.abs(delta) < 15770000000) { hidet = 'invis'; hidey = ' invis'} else { hidet = 'hid'}
var cl = "date y"+ (nowt > vtime ? Math.floor(Math.log2((delta/31536000000)+1)*2) : 'f tag-s');
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes(["nobr",cl], [false,true]), false, false)+pug_attr("title", v.toString(), true, false)) + "\u003E\u003Cspan" + (pug_attr("class", pug_classes(["nobr",hidey], [false,true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = v.toLocaleDateString("de-US", {year:"numeric"})+ '-') ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003Cspan" + (pug_attr("class", pug_classes(["nobr",hidem], [false,true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = v.toLocaleDateString("de-US", {month:"2-digit",day: "2-digit"})) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003Cspan" + (pug_attr("class", pug_classes(["nobr",hidet], [false,true]), false, false)) + "\u003E " + (pug_escape(null == (pug_interp = v.toLocaleTimeString("de-US", {hour:"2-digit", minute:"2-digit"})) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fspan\u003E";
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = obj[name]) ? "" : pug_interp));
}
};
pug_mixins["hyperVal"] = pug_interp = function(obj, name){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var value = (obj !== Object(obj) || Array.isArray(obj))? obj : obj[name];
if (value instanceof Date || name == 'date' || name == 'updatedAt' || name == 'createdAt') {
pug_mixins["hyperdate"](obj, name);
}
else {
switch (name){
case 'size':
pug_mixins["hypersize"](obj, name);
  break;
case 'level':
pug_mixins["hyperlevel"](obj, name);
  break;
case 'CVSS':
pug_mixins["hyperCVSS"](obj, name);
  break;
case 'scopes':
pug_mixins["hyperscopes"](obj, name);
  break;
default:
if (fields && fields[name]) {
var cls = fields[name].class ? fields[name].class : '';
var onlick = fields[name].onclick ? fields[name].onclick : false;
if (fields[name].xref && fields[name].xref.class) {
cls = cls + obj[fields[name].xref.class]
}
if (fields[name].href != undefined) {
var href = fields[name].href;
var target = (fields[name].target ? fields[name].target : (href && href.startsWith('http')?"_blank":false))
if (fields[name].xref && fields[name].xref.href) {
href = href + obj[fields[name].xref.href];
pug_html = pug_html + "\u003Ca" + (pug_attr("class", pug_classes([cls], [true]), false, false)+pug_attr("target", target, true, false)+pug_attr("href", href, true, false)+pug_attr("onclick", onclick, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {
if (Array.isArray(value)) {
// iterate value
;(function(){
  var $$obj = value;
  if ('number' == typeof $$obj.length) {
      for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
        var v = $$obj[i];
pug_mixins["hyperVal"](v,name);
pug_html = pug_html + " ";
      }
  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;
      var v = $$obj[i];
pug_mixins["hyperVal"](v,name);
pug_html = pug_html + " ";
    }
  }
}).call(this);

}
else {
href = href+(value ? value : '');
pug_html = pug_html + "\u003Ca" + (pug_attr("class", pug_classes([cls], [true]), false, false)+pug_attr("target", target, true, false)+pug_attr("href", href, true, false)+pug_attr("onclick", onclick, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
}
}
else {
if (Array.isArray(value)) {
// iterate value
;(function(){
  var $$obj = value;
  if ('number' == typeof $$obj.length) {
      for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
        var v = $$obj[i];
pug_mixins["hyperVal"](v, name);
pug_html = pug_html + " ";
      }
  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;
      var v = $$obj[i];
pug_mixins["hyperVal"](v, name);
pug_html = pug_html + " ";
    }
  }
}).call(this);

}
else {
if ((typeof value === 'string') && value.match(/^[a-zA-Z0-9\-_]{1,30}$/) || typeof value === 'boolean') {
cls = (cls ? cls + ' ' : '')+ value
}
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([cls], [true]), false, false)+pug_attr("title", value, true, false)+pug_attr("onclick", onlick, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = value) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
}
}
}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = value) ? "" : pug_interp));
}
  break;
}
}
};
pug_mixins["facetChart"] = pug_interp = function(facet, query, tfacet){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if ((total > 0)) {
pug_html = pug_html + "\u003C!-- && facet.length \u003E 0 && (Object.keys(facet[0]).length)--\u003E\u003Cform" + (" id=\"chartForm\""+pug_attr("action", '/'+schemaName, true, false)+" method=\"GET\" onchange=\"document.getElementById('filter').className='indent btn sfe'\"") + "\u003E";
if (query && query.q) {
pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\" name=\"q\""+pug_attr("value", (Array.isArray(query.q) ? query.q.join(' ') : query.q), true, false)) + "\u002F\u003E";
}
if (tfacet && tfacet.length && tfacet.length > 0) {
// iterate tfacet[0]
;(function(){
  var $$obj = tfacet[0];
  if ('number' == typeof $$obj.length) {
      for (var field = 0, $$l = $$obj.length; field < $$l; field++) {
        var values = $$obj[field];
// iterate values
;(function(){
  var $$obj = values;
  if ('number' == typeof $$obj.length) {
      for (var pug_index9 = 0, $$l = $$obj.length; pug_index9 < $$l; pug_index9++) {
        var v = $$obj[pug_index9];
if ((v._id == query[field] || ((typeof query[field] === 'string') && query[field].split(',').includes(v._id)) || ((query[field] instanceof Array) && query[field].includes(v._id)))) {
pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug_attr("name", field, true, false)+pug_attr("value", v._id, true, false)) + "\u002F\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var pug_index9 in $$obj) {
      $$l++;
      var v = $$obj[pug_index9];
if ((v._id == query[field] || ((typeof query[field] === 'string') && query[field].split(',').includes(v._id)) || ((query[field] instanceof Array) && query[field].includes(v._id)))) {
pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug_attr("name", field, true, false)+pug_attr("value", v._id, true, false)) + "\u002F\u003E";
}
    }
  }
}).call(this);

      }
  } else {
    var $$l = 0;
    for (var field in $$obj) {
      $$l++;
      var values = $$obj[field];
// iterate values
;(function(){
  var $$obj = values;
  if ('number' == typeof $$obj.length) {
      for (var pug_index10 = 0, $$l = $$obj.length; pug_index10 < $$l; pug_index10++) {
        var v = $$obj[pug_index10];
if ((v._id == query[field] || ((typeof query[field] === 'string') && query[field].split(',').includes(v._id)) || ((query[field] instanceof Array) && query[field].includes(v._id)))) {
pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug_attr("name", field, true, false)+pug_attr("value", v._id, true, false)) + "\u002F\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var pug_index10 in $$obj) {
      $$l++;
      var v = $$obj[pug_index10];
if ((v._id == query[field] || ((typeof query[field] === 'string') && query[field].split(',').includes(v._id)) || ((query[field] instanceof Array) && query[field].includes(v._id)))) {
pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\""+pug_attr("name", field, true, false)+pug_attr("value", v._id, true, false)) + "\u002F\u003E";
}
    }
  }
}).call(this);

    }
  }
}).call(this);

}
if (facet.length > 0 && (Object.keys(facet[0]).length)) {
pug_html = pug_html + "\u003Cdiv class=\"ins hig flx wlp pad\"\u003E";
// iterate facet[0]
;(function(){
  var $$obj = facet[0];
  if ('number' == typeof $$obj.length) {
      for (var field = 0, $$l = $$obj.length; field < $$l; field++) {
        var values = $$obj[field];
pug_html = pug_html + "\u003Cdiv" + (pug_attr("class", pug_classes(["wht","rnd","shd","chart",field], [false,false,false,false,true]), false, false)) + "\u003E\u003Clabel" + (pug_attr("class", pug_classes(["ico",field], [false,true]), false, false)+pug_attr("for", 'flt'+field, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = field) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E\u003Cinput" + (" class=\"expand\""+pug_attr("id", "flt"+field, true, false)+" type=\"checkbox\"") + "\u002F\u003E";
// iterate values
;(function(){
  var $$obj = values;
  if ('number' == typeof $$obj.length) {
      for (var pug_index12 = 0, $$l = $$obj.length; pug_index12 < $$l; pug_index12++) {
        var v = $$obj[pug_index12];
pug_html = pug_html + "\u003Cdiv" + (" class=\"bar\""+pug_attr("style", pug_style("width:" + Math.round(v.count/total*170.0+1) + "px"), true, false)) + "\u003E\u003Cinput" + (" type=\"checkbox\""+pug_attr("id", field+v._id, true, false)+pug_attr("name", field, true, false)+pug_attr("value", v._id ? v._id : '', true, false)+pug_attr("checked", (v._id != '' && query[field] && query[field].includes(v._id)) || (v._id === '' && query[field] && typeof query[field] != 'string' && query[field].includes('')), true, false)) + "\u002F\u003E\u003Clabel" + (pug_attr("class", pug_classes(["otl",v._id + (fields[field].class? ' ' + fields[field].class : '')], [false,true]), false, false)+pug_attr("for", field+v._id, true, false)+pug_attr("title", v._id+ " (" + v.count + ")", true, false)) + "\u003E" + (pug_escape(null == (pug_interp = v._id) ? "" : pug_interp)) + "\u003Cbr\u002F\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = v.count) ? "" : pug_interp)) + "\u003C\u002Fb\u003E\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index12 in $$obj) {
      $$l++;
      var v = $$obj[pug_index12];
pug_html = pug_html + "\u003Cdiv" + (" class=\"bar\""+pug_attr("style", pug_style("width:" + Math.round(v.count/total*170.0+1) + "px"), true, false)) + "\u003E\u003Cinput" + (" type=\"checkbox\""+pug_attr("id", field+v._id, true, false)+pug_attr("name", field, true, false)+pug_attr("value", v._id ? v._id : '', true, false)+pug_attr("checked", (v._id != '' && query[field] && query[field].includes(v._id)) || (v._id === '' && query[field] && typeof query[field] != 'string' && query[field].includes('')), true, false)) + "\u002F\u003E\u003Clabel" + (pug_attr("class", pug_classes(["otl",v._id + (fields[field].class? ' ' + fields[field].class : '')], [false,true]), false, false)+pug_attr("for", field+v._id, true, false)+pug_attr("title", v._id+ " (" + v.count + ")", true, false)) + "\u003E" + (pug_escape(null == (pug_interp = v._id) ? "" : pug_interp)) + "\u003Cbr\u002F\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = v.count) ? "" : pug_interp)) + "\u003C\u002Fb\u003E\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003Clabel" + (pug_attr("for", "flt"+field, true, false)) + "\u003E\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
      }
  } else {
    var $$l = 0;
    for (var field in $$obj) {
      $$l++;
      var values = $$obj[field];
pug_html = pug_html + "\u003Cdiv" + (pug_attr("class", pug_classes(["wht","rnd","shd","chart",field], [false,false,false,false,true]), false, false)) + "\u003E\u003Clabel" + (pug_attr("class", pug_classes(["ico",field], [false,true]), false, false)+pug_attr("for", 'flt'+field, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = field) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E\u003Cinput" + (" class=\"expand\""+pug_attr("id", "flt"+field, true, false)+" type=\"checkbox\"") + "\u002F\u003E";
// iterate values
;(function(){
  var $$obj = values;
  if ('number' == typeof $$obj.length) {
      for (var pug_index13 = 0, $$l = $$obj.length; pug_index13 < $$l; pug_index13++) {
        var v = $$obj[pug_index13];
pug_html = pug_html + "\u003Cdiv" + (" class=\"bar\""+pug_attr("style", pug_style("width:" + Math.round(v.count/total*170.0+1) + "px"), true, false)) + "\u003E\u003Cinput" + (" type=\"checkbox\""+pug_attr("id", field+v._id, true, false)+pug_attr("name", field, true, false)+pug_attr("value", v._id ? v._id : '', true, false)+pug_attr("checked", (v._id != '' && query[field] && query[field].includes(v._id)) || (v._id === '' && query[field] && typeof query[field] != 'string' && query[field].includes('')), true, false)) + "\u002F\u003E\u003Clabel" + (pug_attr("class", pug_classes(["otl",v._id + (fields[field].class? ' ' + fields[field].class : '')], [false,true]), false, false)+pug_attr("for", field+v._id, true, false)+pug_attr("title", v._id+ " (" + v.count + ")", true, false)) + "\u003E" + (pug_escape(null == (pug_interp = v._id) ? "" : pug_interp)) + "\u003Cbr\u002F\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = v.count) ? "" : pug_interp)) + "\u003C\u002Fb\u003E\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index13 in $$obj) {
      $$l++;
      var v = $$obj[pug_index13];
pug_html = pug_html + "\u003Cdiv" + (" class=\"bar\""+pug_attr("style", pug_style("width:" + Math.round(v.count/total*170.0+1) + "px"), true, false)) + "\u003E\u003Cinput" + (" type=\"checkbox\""+pug_attr("id", field+v._id, true, false)+pug_attr("name", field, true, false)+pug_attr("value", v._id ? v._id : '', true, false)+pug_attr("checked", (v._id != '' && query[field] && query[field].includes(v._id)) || (v._id === '' && query[field] && typeof query[field] != 'string' && query[field].includes('')), true, false)) + "\u002F\u003E\u003Clabel" + (pug_attr("class", pug_classes(["otl",v._id + (fields[field].class? ' ' + fields[field].class : '')], [false,true]), false, false)+pug_attr("for", field+v._id, true, false)+pug_attr("title", v._id+ " (" + v.count + ")", true, false)) + "\u003E" + (pug_escape(null == (pug_interp = v._id) ? "" : pug_interp)) + "\u003Cbr\u002F\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = v.count) ? "" : pug_interp)) + "\u003C\u002Fb\u003E\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003Clabel" + (pug_attr("for", "flt"+field, true, false)) + "\u003E\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003Cdiv class=\"right gap\"\u003E\u003Cinput class=\"indent btn\" id=\"filter\" type=\"submit\" value=\"Filter\"\u002F\u003E\u003Ca" + (" class=\"indent btn\""+pug_attr("href", "/" + schemaName, true, false)+" type=\"submit\" value=\"Clear\"") + "\u003EClear\u003C\u002Fa\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
}
if (pages > 1) {
// iterate columns
;(function(){
  var $$obj = columns;
  if ('number' == typeof $$obj.length) {
      for (var pug_index14 = 0, $$l = $$obj.length; pug_index14 < $$l; pug_index14++) {
        var c = $$obj[pug_index14];
pug_html = pug_html + "\u003Cbutton" + (" class=\"hid\""+pug_attr("id", "sort"+c, true, false)+" name=\"sort\""+pug_attr("value", (query.sort=="-" + c ? "" : "-") + c, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = c) ? "" : pug_interp)) + "\u003C\u002Fbutton\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index14 in $$obj) {
      $$l++;
      var c = $$obj[pug_index14];
pug_html = pug_html + "\u003Cbutton" + (" class=\"hid\""+pug_attr("id", "sort"+c, true, false)+" name=\"sort\""+pug_attr("value", (query.sort=="-" + c ? "" : "-") + c, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = c) ? "" : pug_interp)) + "\u003C\u002Fbutton\u003E";
    }
  }
}).call(this);

}
pug_html = pug_html + "\u003C\u002Fform\u003E";
}
};
pug_mixins["paginate"] = pug_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (total > 0) {
pages = Number(pages)
current = Number(current)
query ? delete query.page : '';
var bs = '?' + (qs ? qs.stringify(query) : '')  + '&page=';
var kin = 3;
pug_html = pug_html + "\u003Cform class=\"ban pad\" action=\"\" method=\"GET\" style=\"flex-grow:1;\" onsubmit=\"var cf = document.getElementById(&quot;chartForm&quot;); if(cf.q == undefined){var qin = document.createElement(&quot;input&quot;); qin.setAttribute(&quot;name&quot;,&quot;q&quot;);qin.setAttribute(&quot;type&quot;,&quot;hidden&quot;); cf.appendChild(qin)}; cf.q.value=this.q.value; cf.submit(); return false;\"\u003E";
var searchString = query ? (Array.isArray(query.q) ? query.q.join(' '): query.q) : "";
delete query.q;
pug_html = pug_html + "\u003C!--each i, d in query--\u003E\u003C!--    input(type=\"hidden\",name=d,value=i)--\u003E\u003Cspan class=\"right\"\u003E";
if (pages <= 1) {
pug_html = pug_html + ("Found " + (pug_escape(null == (pug_interp = total) ? "" : pug_interp)));
}
if (pages > 1) {
pug_html = pug_html + "\u003Cspan class=\"pagination\"\u003EShowing " + (pug_escape(null == (pug_interp = ((current-1)*limit + 1)) ? "" : pug_interp)) + " - " + (pug_escape(null == (pug_interp = current*limit > total ? total : current*limit) ? "" : pug_interp)) + " of " + (pug_escape(null == (pug_interp = total) ? "" : pug_interp)) + " ";
if (current == 1) {
pug_html = pug_html + "\u003Ca class=\"btn pur\"\u003E1\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + "\u003Ca" + (" class=\"btn\""+pug_attr("href", bs + '1', true, false)) + "\u003E1\u003C\u002Fa\u003E";
}
var i =  (current > kin ? (current - kin + 1) : 2)
if (i != 2) {
if ((i == 3)) {
pug_html = pug_html + "\u003Ca" + (" class=\"btn\""+pug_attr("href", bs+2, true, false)) + "\u003E2\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + "\u003Cb class=\"lbl\"\u003E∙ ∙ ∙\u003C\u002Fb\u003E";
}
}
while (((i <= (current + kin - 1)) && (i < pages))) {
if (i==current) {
pug_html = pug_html + "\u003Ca class=\"btn pur\"\u003E" + (pug_escape(null == (pug_interp = i) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + "\u003Ca" + (" class=\"btn\""+pug_attr("href", bs + i, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = i) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
if (i==(current + kin - 1) && i < pages -1) {
pug_html = pug_html + "\u003Cb class=\"lbl\"\u003E∙ ∙ ∙\u003C\u002Fb\u003E";
}
i++;
}
if (current == pages) {
pug_html = pug_html + "\u003Ca class=\"btn pur\"\u003E" + (pug_escape(null == (pug_interp = pages) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + "\u003Ca" + (" class=\"btn\""+pug_attr("href", bs+pages, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = pages) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
pug_html = pug_html + "\u003C\u002Fspan\u003E";
}
pug_html = pug_html + "\u003C\u002Fspan\u003E \u003Cspan class=\"indent out\"\u003E\u003Cinput" + (" class=\"txt\""+" size=\"20\" type=\"text\" name=\"q\" placeholder=\" Filter results \""+pug_attr("value", searchString, true, false)+" results=\"10\""+pug_attr("required", true, true, false)) + "\u002F\u003E\u003Cinput class=\"btn\" type=\"submit\" value=\"filter\"\u002F\u003E\u003C\u002Fspan\u003E \u003Clabel class=\"lbl icn fold\" for=\"compactTable\" onclick=\"this.setAttribute('val', document.getElementById(this.getAttribute('for')).checked)\" val=\"\"\u003E\u003C\u002Flabel\u003E\u003C\u002Fform\u003E";
}
};
pug_mixins["bulkTable"] = pug_interp = function(docs, columns, id){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (!docs || docs.length == 0) {
pug_html = pug_html + "\u003Cp\u003E\u003Cb\u003ENo items found!\u003C\u002Fb\u003E\u003C\u002Fp\u003E";
}
else {
var rowCount = 0;
var sum = {}, showCheckboxes = false; 
if (bulkInput) { showCheckboxes = (Object.keys(bulkInput).length !== 0)}
pug_html = pug_html + "\u003Cform" + (" autocomplete=\"off\""+pug_attr("action", '/'+schemaName+'/update', true, false)+" method=\"POST\"") + "\u003E\u003Cinput class=\"hid compactTable\" id=\"compactTable\" type=\"checkbox\" checked=\"checked\"\u002F\u003E";
pug_mixins["table"](docs, columns, showCheckboxes, id);
pug_html = pug_html + "\u003Cinput" + (" type=\"hidden\" name=\"_csrf\""+pug_attr("value", csrfToken, true, false)) + "\u002F\u003E\u003Cdiv class=\"pad flx\"\u003E";
if (showCheckboxes) {
pug_html = pug_html + "\u003Cdiv class=\"left pad\"\u003E";
// iterate bulkInput
;(function(){
  var $$obj = bulkInput;
  if ('number' == typeof $$obj.length) {
      for (var name = 0, $$l = $$obj.length; name < $$l; name++) {
        var spec = $$obj[name];
pug_html = pug_html + "\u003Cdiv class=\"indent out\"\u003E\u003Clabel" + (pug_attr("class", pug_classes(["lbl","icn",name], [false,false,true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = name) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
if (spec.type && spec.type == "select") {
pug_html = pug_html + "\u003Cselect" + (" class=\"btn\""+pug_attr("name", name, true, false)) + "\u003E\u003Coption" + (pug_attr("selected", true, true, false)+pug_attr("value", true, true, false)) + "\u003E- Select -\u003C\u002Foption\u003E";
// iterate spec.enum
;(function(){
  var $$obj = spec.enum;
  if ('number' == typeof $$obj.length) {
      for (var pug_index16 = 0, $$l = $$obj.length; pug_index16 < $$l; pug_index16++) {
        var v = $$obj[pug_index16];
pug_html = pug_html + "\u003Coption" + (pug_attr("value", v, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = v) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index16 in $$obj) {
      $$l++;
      var v = $$obj[pug_index16];
pug_html = pug_html + "\u003Coption" + (pug_attr("value", v, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = v) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fselect\u003E";
}
else {
pug_html = pug_html + "\u003Cinput" + (" class=\"txt\""+pug_attr("name", name, true, false)) + "\u002F\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
      }
  } else {
    var $$l = 0;
    for (var name in $$obj) {
      $$l++;
      var spec = $$obj[name];
pug_html = pug_html + "\u003Cdiv class=\"indent out\"\u003E\u003Clabel" + (pug_attr("class", pug_classes(["lbl","icn",name], [false,false,true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = name) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
if (spec.type && spec.type == "select") {
pug_html = pug_html + "\u003Cselect" + (" class=\"btn\""+pug_attr("name", name, true, false)) + "\u003E\u003Coption" + (pug_attr("selected", true, true, false)+pug_attr("value", true, true, false)) + "\u003E- Select -\u003C\u002Foption\u003E";
// iterate spec.enum
;(function(){
  var $$obj = spec.enum;
  if ('number' == typeof $$obj.length) {
      for (var pug_index17 = 0, $$l = $$obj.length; pug_index17 < $$l; pug_index17++) {
        var v = $$obj[pug_index17];
pug_html = pug_html + "\u003Coption" + (pug_attr("value", v, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = v) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index17 in $$obj) {
      $$l++;
      var v = $$obj[pug_index17];
pug_html = pug_html + "\u003Coption" + (pug_attr("value", v, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = v) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fselect\u003E";
}
else {
pug_html = pug_html + "\u003Cinput" + (" class=\"txt\""+pug_attr("name", name, true, false)) + "\u002F\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003Cdiv class=\"left nobr pad\"\u003E\u003Cinput class=\"btn\" type=\"submit\" value=\"Update\"\u002F\u003E\u003Cinput class=\"btn\" type=\"reset\"\u002F\u003E\u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C\u002Fform\u003E";
pug_mixins["distinctSummary"](docs, columns);
}
};
pug_mixins["distinctSummary"] = pug_interp = function(docs, columns){
var block = (this && this.block), attributes = (this && this.attributes) || {};
tTime = new Date()
// iterate columns
;(function(){
  var $$obj = columns;
  if ('number' == typeof $$obj.length) {
      for (var pug_index18 = 0, $$l = $$obj.length; pug_index18 < $$l; pug_index18++) {
        var column = $$obj[pug_index18];
if (fields[column] && fields[column].showDistinct) {
var unique = [...new Set(docs.map(item => item[column]).reduce((a, b) => a.concat(b), []))];
pug_html = pug_html + "\u003Cp\u003E\u003Csmall\u003EDisplayed  \u003Cb\u003E" + (pug_escape(null == (pug_interp = column) ? "" : pug_interp)) + "\u003C\u002Fb\u003Es (" + (pug_escape(null == (pug_interp = unique.length) ? "" : pug_interp)) + "):  " + (pug_escape(null == (pug_interp = unique.join(', ')) ? "" : pug_interp)) + "\u003C\u002Fsmall\u003E\u003C\u002Fp\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var pug_index18 in $$obj) {
      $$l++;
      var column = $$obj[pug_index18];
if (fields[column] && fields[column].showDistinct) {
var unique = [...new Set(docs.map(item => item[column]).reduce((a, b) => a.concat(b), []))];
pug_html = pug_html + "\u003Cp\u003E\u003Csmall\u003EDisplayed  \u003Cb\u003E" + (pug_escape(null == (pug_interp = column) ? "" : pug_interp)) + "\u003C\u002Fb\u003Es (" + (pug_escape(null == (pug_interp = unique.length) ? "" : pug_interp)) + "):  " + (pug_escape(null == (pug_interp = unique.join(', ')) ? "" : pug_interp)) + "\u003C\u002Fsmall\u003E\u003C\u002Fp\u003E";
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C!--b= (Date.now() - tTime.getTime())--\u003E\u003C!--b msec--\u003E";
};
pug_mixins["table"] = pug_interp = function(docs, columns, showCheckboxes, id){
var block = (this && this.block), attributes = (this && this.attributes) || {};
tTime = new Date()
if (!docs || docs.length == 0) {
pug_html = pug_html + "\u003Cp\u003E\u003Cb\u003ENo items found!\u003C\u002Fb\u003E\u003C\u002Fp\u003E";
}
else {
pug_html = pug_html + "\u003Ctable" + (" class=\"tbl wht sortable\""+pug_attr("id", id, true, false)) + "\u003E";
if (fields) {
pug_html = pug_html + "\u003Ccolgroup\u003E";
if (showCheckboxes) {
pug_html = pug_html + "\u003Ccol\u002F\u003E";
}
// iterate columns
;(function(){
  var $$obj = columns;
  if ('number' == typeof $$obj.length) {
      for (var pug_index19 = 0, $$l = $$obj.length; pug_index19 < $$l; pug_index19++) {
        var column = $$obj[pug_index19];
pug_html = pug_html + "\u003Ccol" + (pug_attr("class", pug_classes([fields[column]? fields[column].class:''], [true]), false, false)) + "\u002F\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index19 in $$obj) {
      $$l++;
      var column = $$obj[pug_index19];
pug_html = pug_html + "\u003Ccol" + (pug_attr("class", pug_classes([fields[column]? fields[column].class:''], [true]), false, false)) + "\u002F\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fcolgroup\u003E";
}
pug_html = pug_html + "\u003Cthead class=\"hig\"\u003E\u003Ctr\u003E";
if (showCheckboxes) {
pug_html = pug_html + "\u003Cth data-sort-method=\"none\"\u003E\u003Cinput type=\"checkbox\" onClick=\"var cs = document.getElementsByClassName(&quot;rowCheck&quot;);for(c=0;c&lt;cs.length;c++){cs[c].checked=this.checked}\"\u002F\u003E\u003C\u002Fth\u003E";
}
// iterate columns
;(function(){
  var $$obj = columns;
  if ('number' == typeof $$obj.length) {
      for (var pug_index20 = 0, $$l = $$obj.length; pug_index20 < $$l; pug_index20++) {
        var column = $$obj[pug_index20];
if (pages > 1) {
pug_html = pug_html + "\u003Cth class=\"sortth nobr pointer\"\u003E\u003Clabel" + (pug_attr("class", pug_classes(["block","pointer",(query ? (query['sort'] == column ? 'sortup': (query['sort'] == "-" + column ? 'sortdown' : '')): null)], [false,false,true]), false, false)+pug_attr("for", 'sort'+column, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = column) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E\u003C\u002Fth\u003E";
}
else {
switch (column){
case 'CVSS':
pug_html = pug_html + "\u003Cth class=\"pointer\" data-sort-method=\"number\"\u003ECVSS\u003C\u002Fth\u003E";
  break;
default:
pug_html = pug_html + "\u003Cth\u003E" + (pug_escape(null == (pug_interp = column) ? "" : pug_interp)) + "\u003C\u002Fth\u003E";
  break;
}
}
      }
  } else {
    var $$l = 0;
    for (var pug_index20 in $$obj) {
      $$l++;
      var column = $$obj[pug_index20];
if (pages > 1) {
pug_html = pug_html + "\u003Cth class=\"sortth nobr pointer\"\u003E\u003Clabel" + (pug_attr("class", pug_classes(["block","pointer",(query ? (query['sort'] == column ? 'sortup': (query['sort'] == "-" + column ? 'sortdown' : '')): null)], [false,false,true]), false, false)+pug_attr("for", 'sort'+column, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = column) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E\u003C\u002Fth\u003E";
}
else {
switch (column){
case 'CVSS':
pug_html = pug_html + "\u003Cth class=\"pointer\" data-sort-method=\"number\"\u003ECVSS\u003C\u002Fth\u003E";
  break;
default:
pug_html = pug_html + "\u003Cth\u003E" + (pug_escape(null == (pug_interp = column) ? "" : pug_interp)) + "\u003C\u002Fth\u003E";
  break;
}
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftr\u003E\u003C\u002Fthead\u003E\u003Ctbody\u003E";
// iterate docs
;(function(){
  var $$obj = docs;
  if ('number' == typeof $$obj.length) {
      for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
        var doc = $$obj[i];
rowCount ++
pug_html = pug_html + "\u003Ctr\u003E";
if (showCheckboxes) {
pug_html = pug_html + "\u003Ctd class=\"rowCheckLabel\"\u003E\u003Clabel class=\"rowCheckLabel\"\u003E\u003Cinput" + (" class=\"rowCheck\""+" type=\"checkbox\""+pug_attr("name", columns[0], true, false)+pug_attr("value", doc[columns[0]], true, false)) + "\u002F\u003E\u003C\u002Flabel\u003E\u003C\u002Ftd\u003E";
}
// iterate columns
;(function(){
  var $$obj = columns;
  if ('number' == typeof $$obj.length) {
      for (var pug_index22 = 0, $$l = $$obj.length; pug_index22 < $$l; pug_index22++) {
        var column = $$obj[pug_index22];
pug_html = pug_html + "\u003Ctd" + (pug_attr("class", pug_classes([column], [true]), false, false)) + "\u003E";
pug_mixins["hyperVal"](doc, column);
pug_html = pug_html + "\u003C\u002Ftd\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index22 in $$obj) {
      $$l++;
      var column = $$obj[pug_index22];
pug_html = pug_html + "\u003Ctd" + (pug_attr("class", pug_classes([column], [true]), false, false)) + "\u003E";
pug_mixins["hyperVal"](doc, column);
pug_html = pug_html + "\u003C\u002Ftd\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;
      var doc = $$obj[i];
rowCount ++
pug_html = pug_html + "\u003Ctr\u003E";
if (showCheckboxes) {
pug_html = pug_html + "\u003Ctd class=\"rowCheckLabel\"\u003E\u003Clabel class=\"rowCheckLabel\"\u003E\u003Cinput" + (" class=\"rowCheck\""+" type=\"checkbox\""+pug_attr("name", columns[0], true, false)+pug_attr("value", doc[columns[0]], true, false)) + "\u002F\u003E\u003C\u002Flabel\u003E\u003C\u002Ftd\u003E";
}
// iterate columns
;(function(){
  var $$obj = columns;
  if ('number' == typeof $$obj.length) {
      for (var pug_index23 = 0, $$l = $$obj.length; pug_index23 < $$l; pug_index23++) {
        var column = $$obj[pug_index23];
pug_html = pug_html + "\u003Ctd" + (pug_attr("class", pug_classes([column], [true]), false, false)) + "\u003E";
pug_mixins["hyperVal"](doc, column);
pug_html = pug_html + "\u003C\u002Ftd\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index23 in $$obj) {
      $$l++;
      var column = $$obj[pug_index23];
pug_html = pug_html + "\u003Ctd" + (pug_attr("class", pug_classes([column], [true]), false, false)) + "\u003E";
pug_mixins["hyperVal"](doc, column);
pug_html = pug_html + "\u003C\u002Ftd\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftbody\u003E\u003C\u002Ftable\u003E\u003C!--b= (Date.now() - tTime.getTime())--\u003E\u003C!--b  msec--\u003E";
}
};
pug_mixins["tablesort"] = pug_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Cscript src=\"\u002Fjs\u002Ftablesort.min.js\"\u003E\u003C\u002Fscript\u003E\u003Cscript\u003Evar tables = document.getElementsByClassName('sortable')\nfor (var i = 0; i \u003C tables.length; i++) {\n    new Tablesort(tables[i]);\n}\n\n\u003C\u002Fscript\u003E";
};
pug_mixins["usercss"] = pug_interp = function(docs){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Cstyle\u003E";
// iterate docs
;(function(){
  var $$obj = docs;
  if ('number' == typeof $$obj.length) {
      for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
        var v = $$obj[i];
if (v.emoji) {
pug_html = pug_html + (pug_escape(null == (pug_interp = 'monogram ' + v.username.charAt(0) + ':before : {content:"'+ v.emoji +'"}') ? "" : pug_interp));
}
      }
  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;
      var v = $$obj[i];
if (v.emoji) {
pug_html = pug_html + (pug_escape(null == (pug_interp = 'monogram ' + v.username.charAt(0) + ':before : {content:"'+ v.emoji +'"}') ? "" : pug_interp));
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fstyle\u003E";
};
pug_mixins["expand"] = pug_interp = function(x){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Clabel\u003E\u003Cinput class=\"hid expnd\" type=\"checkbox\" checked=\"\"\u002F\u003E\u003Cdiv\u003E" + (pug_escape(null == (pug_interp = x) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E\u003C\u002Flabel\u003E";
};
pug_mixins["asis"] = pug_interp = function(x){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + (null == (pug_interp = x) ? "" : pug_interp);
};
pug_mixins["files"] = pug_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Cdiv class=\"rnd hig gap wlp ins\"\u003E\u003Cdiv class=\"pad\"\u003E\u003Cb class=\"icn Attachments\"\u003EAttachments\u003C\u002Fb\u003E\u003Cdiv id=\"fileList\"\u003E";
pug_mixins["fileList"]();
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cform class=\"pad\"\u003E\u003Cinput class=\"fbn\" id=\"file1\" name=\"file1\" type=\"file\" multiple=\"multiple\" onchange=\"preview(this,event)\"\u002F\u003E\u003Cinput class=\"txt\" size=\"40em\" name=\"comment\" placeholder=\"Description of the attachment(s)\"\u002F\u003E\u003Cbutton class=\"btn icn indent save\" id=\"upb\" onclick=\"attach(this, event)\"\u003EAttach\u003C\u002Fbutton\u003E\u003Cprogress class=\"hid\" name=\"prg\"\u003E\u003C\u002Fprogress\u003E\u003Cdiv class=\"indent indent filePreview\"\u003E\u003C\u002Fdiv\u003E\u003C\u002Fform\u003E\u003C\u002Fdiv\u003E";
};
pug_mixins["fileList"] = pug_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if ((files && files.length>0)) {
fields = {name: {href:'/'+schemaName+'/' + doc_id + '/file/', class: 'icn ', target:'_blank', xref: {class: 'type'}}, user: {class: 'ico'}, delete: {class: 'ico delete',onclick:'fileDelete(this)'}};
pug_mixins["table"](files, ['name','comment','size','updatedAt','user','delete']);
}
};
pug_mixins["commentBox"] = pug_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Cdiv class=\"hid\" id=\"commentTemplate\"\u003E\u003Cform class=\"bor shd rnd gap pad\" onsubmit=\"sendComment(this);return false;\"\u003E\u003Cinput" + (" type=\"hidden\" name=\"id\""+pug_attr("value", id, true, false)) + "\u002F\u003E\u003Cdiv class=\"toolbar\"\u003E\u003Cdiv\u003E\u003Cspan class=\"btg indent\"\u003E\u003Ca class=\"sbn icn bold\" data-wysihtml5-command=\"bold\" title=\"Bold CTRL+B\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn italic\" data-wysihtml5-command=\"italic\" title=\"Italic CTRL+I\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn underline\" data-wysihtml5-command=\"underline\" title=\"Underline CTRL+U\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn highlight\" data-wysihtml5-command=\"bgColorStyle\" title=\"highlight\" color=\"#666699\" data-wysihtml5-command-value=\"#effa66\"\u003E\u003C\u002Fa\u003E\u003C!-- \u003Ca class=\"fbn icn strikethrough\" data-wysihtml5-command=\"strike\" title=\"Strike\"\u003E\u003C\u002Fa\u003E--\u003E\u003C\u002Fspan\u003E\u003Cspan class=\"btg indent\"\u003E\u003Ca class=\"sbn icn htmlp\" data-wysihtml5-command=\"formatBlock\" data-wysihtml5-command-value=\"p\" title=\"paragraph style\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn htmlh1\" data-wysihtml5-command=\"formatBlock\" data-wysihtml5-command-value=\"h1\" title=\"Heading 1\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn htmlh2\" data-wysihtml5-command=\"formatBlock\" data-wysihtml5-command-value=\"h2\" title=\"Heading 2\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn htmlh3\" data-wysihtml5-command=\"formatBlock\" data-wysihtml5-command-value=\"h3\" title=\"Heading 3\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"wysihtml5-command-active sbn icn clear\" data-wysihtml5-command=\"formatBlock\" data-wysihtml5-command-blank-value=\"true\" unselectable=\"on\" title=\"Clear styles\"\u003E\u003C\u002Fa\u003E\u003C\u002Fspan\u003E\u003Cspan class=\"btg indent\"\u003E\u003Ca class=\"sbn icn link\" data-wysihtml5-command=\"createLink\" title=\"Hyperlink\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn unlink\" data-wysihtml5-command=\"removeLink\" title=\"Unlink\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn image\" data-wysihtml5-command=\"insertImage\" title=\"Insert image\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn code\" data-wysihtml5-command=\"formatBlock\" data-wysihtml5-command-value=\"pre\" title=\"Code text\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn quote\" data-wysihtml5-command=\"formatBlock\" data-wysihtml5-command-value=\"blockquote\" title=\"Block quote\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn table\" data-wysihtml5-command=\"createTable\" title=\"Insert Table\"\u003E\u003C\u002Fa\u003E\u003C\u002Fspan\u003E\u003Cspan class=\"btg indent\"\u003E\u003Ca class=\"sbn icn ulist\" data-wysihtml5-command=\"insertUnorderedList\" title=\"Bulletted list\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn olist\" data-wysihtml5-command=\"insertOrderedList\" title=\"Numbered list\"\u003E\u003C\u002Fa\u003E\u003C\u002Fspan\u003E\u003Cspan class=\"btg indent\"\u003E\u003Ca class=\"sbn icn undo\" data-wysihtml5-command=\"undo\" title=\"Undo\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn redo\" data-wysihtml5-command=\"redo\" title=\"Redo\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn html\" data-wysihtml5-action=\"change_view\" title=\"HTML source view\"\u003E\u003C\u002Fa\u003E\u003C\u002Fspan\u003E\u003Cspan class=\"btg indent\" data-wysihtml5-hiddentools=\"table\" style=\"display: none;\"\u003E\u003Ca class=\"sbn icn addabove\" data-wysihtml5-command=\"addTableCells\" data-wysihtml5-command-value=\"above\" title=\"Insert row above\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn addbelow\" data-wysihtml5-command=\"addTableCells\" data-wysihtml5-command-value=\"below\" title=\"Insert row below\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn addbefore\" data-wysihtml5-command=\"addTableCells\" data-wysihtml5-command-value=\"before\" title=\"Insert column before\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn addafter\" data-wysihtml5-command=\"addTableCells\" data-wysihtml5-command-value=\"after\" title=\"Insert column after\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn delrow\" data-wysihtml5-command=\"deleteTableCells\" data-wysihtml5-command-value=\"row\" title=\"Delete row\"\u003E\u003C\u002Fa\u003E\u003Ca class=\"sbn icn delcol\" data-wysihtml5-command=\"deleteTableCells\" data-wysihtml5-command-value=\"column\" title=\"Delete column\"\u003E\u003C\u002Fa\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003Cdiv data-wysihtml5-dialog=\"createLink\" style=\"display: none;\"\u003E\u003Clabel class=\"lbl sml icn link\"\u003ELink: \u003C\u002Flabel\u003E\u003Cinput class=\"icn txt\" size=\"90\" data-wysihtml5-dialog-field=\"href\" value=\"https:\u002F\u002F\" title=\"URL\"\u002F\u003E\u003Ca class=\"btn icn extlink\" onclick=\"window.open(this.previousElementSibling.value)\"\u003EOpen\u003C\u002Fa\u003E\u003Ca class=\"btn indent icn ok\" data-wysihtml5-dialog-action=\"save\"\u003EOK\u003C\u002Fa\u003E\u003Ca class=\"btn icn cancel\" data-wysihtml5-dialog-action=\"cancel\"\u003ECancel\u003C\u002Fa\u003E\u003C\u002Fdiv\u003E\u003Cdiv data-wysihtml5-dialog=\"insertImage\" style=\"display: none;\"\u003E\u003Clabel class=\"lbl icn link\"\u003EURL\u003C\u002Flabel\u003E\u003Cinput class=\"icn txt\" data-wysihtml5-dialog-field=\"src\" size=\"50\" value=\"https:\u002F\u002F\"\u002F\u003E\u003Clabel class=\"lbl\"\u003Eor\u003C\u002Flabel\u003E\u003Clabel class=\"btn icn folder\" title=\"Browse for local images to insert\"\u003EInsert Image ..\u003Cinput class=\"hid\" type=\"file\" onchange=\"loadimg.call(this, event)\" accept=\"image\u002F*\"\u002F\u003E\u003C\u002Flabel\u003E\u003Ca class=\"btn indent icn ok\" data-wysihtml5-dialog-action=\"save\"\u003EOK\u003C\u002Fa\u003E\u003Ca class=\"btn icn cancel\" data-wysihtml5-dialog-action=\"cancel\"\u003ECancel\u003C\u002Fa\u003E\u003C\u002Fdiv\u003E\u003Cdiv data-wysihtml5-dialog=\"createTable\" style=\"display: none;\"\u003E\u003Clabel class=\"icn table lbl\"\u003ERows: \u003C\u002Flabel\u003E\u003Cinput class=\"txt\" type=\"text\" data-wysihtml5-dialog-field=\"rows\"\u002F\u003E\u003Clabel class=\"lbl\"\u003ECols: \u003C\u002Flabel\u003E\u003Cinput class=\"txt\" type=\"text\" data-wysihtml5-dialog-field=\"cols\"\u002F\u003E\u003Ca class=\"btn icn ok indent\" data-wysihtml5-dialog-action=\"save\"\u003EOK\u003C\u002Fa\u003E\u003Ca class=\"btn icn cancel\" data-wysihtml5-dialog-action=\"cancel\"\u003ECancel\u003C\u002Fa\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"wysihtml5-editor fil txt\" style=\"min-height:10em\"\u003E\u003C\u002Fdiv\u003E\u003C!--, onkeyup=\"this.form.button.disabled=this.value ? false : true\",onblur=\"this.form.button.disabled=this.value ? false : true\")--\u003E\u003C!--#addCommentText.wysDiv(onkeyup=\"setCommentButton(this, this.form.button)\",onblur=\"setCommentButton(this, this.form.button)\")--\u003E\u003Cbutton class=\"btn gap sml\" type=\"submit\" name=\"button\" disabled=\"disabled\"\u003EAdd comment\u003C\u002Fbutton\u003E\u003C\u002Fform\u003E\u003C\u002Fdiv\u003E";
};
pug_mixins["comments"] = pug_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (docs) {
// iterate docs
;(function(){
  var $$obj = docs;
  if ('number' == typeof $$obj.length) {
      for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
        var c = $$obj[i];
pug_html = pug_html + "\u003Cdiv" + (pug_attr("class", pug_classes(["shd","rnd","bor","pad","gap",c._id? 'lyel': 'wht'], [false,false,false,false,false,true]), false, false)) + "\u003E\u003Cdt\u003E ";
var cd = new Date(c.createdAt);
var ud = new Date(c.updatedAt);
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes(["pad3","lbl","icn",c.subject ? 'Email' : c.author], [false,false,false,true]), false, false)) + "\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = c.author) ? "" : pug_interp)) + "\u003C\u002Fb\u003E&nbsp;on  " + (pug_escape(null == (pug_interp = cd.toLocaleDateString("en-US",{year: 'numeric', month: 'short', day: 'numeric'})) ? "" : pug_interp)) + " ";
if ((c.updatedAt && (cd.getTime() !== ud.getTime()))) {
pug_html = pug_html + "(updated " + (pug_escape(null == (pug_interp = ud.toLocaleDateString("en-US",{year: 'numeric', month: 'short', day: 'numeric'})) ? "" : pug_interp)) + ")";
}
pug_html = pug_html + " \u003C\u002Fspan\u003E";
if ((c.author == username)) {
pug_html = pug_html + "\u003Cbutton class=\"btn sml\" onclick=\"editPost(this.parentNode)\"\u003Eupdate\u003C\u002Fbutton\u003E";
}
pug_html = pug_html + " -  \u003Cb class=\"lbl\"\u003E" + (pug_escape(null == (pug_interp = c.title) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
if (c._id) {
pug_html = pug_html + "\u003Ca" + (" class=\"lbl icn extlink\""+pug_attr("href", '/mail/'+c._id, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = c.subject) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + "\u003Cb class=\"lbl\"\u003E" + (pug_escape(null == (pug_interp = c.subject) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
pug_html = pug_html + "\u003C\u002Fdt\u003E\u003Cdiv class=\"wysihtml5-editor fil\"\u003E";
if (c.hypertext) {
pug_mixins["asis"](c.hypertext);
}
else
if (c.body) {
pug_html = pug_html + "\u003Cdiv class=\"wrp\"\u003E" + (pug_escape(null == (pug_interp = c.body) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E";
}
else {
pug_html = pug_html + "\u003Ci class=\"tgrey\"\u003ENo content\u003C\u002Fi\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003Cinput" + (" type=\"hidden\" name=\"slug\""+pug_attr("value", c.slug, true, false)) + "\u002F\u003E\u003Cinput" + (" type=\"hidden\" name=\"date\""+pug_attr("value", c.createdAt, true, false)) + "\u002F\u003E\u003C\u002Fdiv\u003E";
      }
  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;
      var c = $$obj[i];
pug_html = pug_html + "\u003Cdiv" + (pug_attr("class", pug_classes(["shd","rnd","bor","pad","gap",c._id? 'lyel': 'wht'], [false,false,false,false,false,true]), false, false)) + "\u003E\u003Cdt\u003E ";
var cd = new Date(c.createdAt);
var ud = new Date(c.updatedAt);
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes(["pad3","lbl","icn",c.subject ? 'Email' : c.author], [false,false,false,true]), false, false)) + "\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = c.author) ? "" : pug_interp)) + "\u003C\u002Fb\u003E&nbsp;on  " + (pug_escape(null == (pug_interp = cd.toLocaleDateString("en-US",{year: 'numeric', month: 'short', day: 'numeric'})) ? "" : pug_interp)) + " ";
if ((c.updatedAt && (cd.getTime() !== ud.getTime()))) {
pug_html = pug_html + "(updated " + (pug_escape(null == (pug_interp = ud.toLocaleDateString("en-US",{year: 'numeric', month: 'short', day: 'numeric'})) ? "" : pug_interp)) + ")";
}
pug_html = pug_html + " \u003C\u002Fspan\u003E";
if ((c.author == username)) {
pug_html = pug_html + "\u003Cbutton class=\"btn sml\" onclick=\"editPost(this.parentNode)\"\u003Eupdate\u003C\u002Fbutton\u003E";
}
pug_html = pug_html + " -  \u003Cb class=\"lbl\"\u003E" + (pug_escape(null == (pug_interp = c.title) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
if (c._id) {
pug_html = pug_html + "\u003Ca" + (" class=\"lbl icn extlink\""+pug_attr("href", '/mail/'+c._id, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = c.subject) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {
pug_html = pug_html + "\u003Cb class=\"lbl\"\u003E" + (pug_escape(null == (pug_interp = c.subject) ? "" : pug_interp)) + "\u003C\u002Fb\u003E";
}
pug_html = pug_html + "\u003C\u002Fdt\u003E\u003Cdiv class=\"wysihtml5-editor fil\"\u003E";
if (c.hypertext) {
pug_mixins["asis"](c.hypertext);
}
else
if (c.body) {
pug_html = pug_html + "\u003Cdiv class=\"wrp\"\u003E" + (pug_escape(null == (pug_interp = c.body) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E";
}
else {
pug_html = pug_html + "\u003Ci class=\"tgrey\"\u003ENo content\u003C\u002Fi\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003Cinput" + (" type=\"hidden\" name=\"slug\""+pug_attr("value", c.slug, true, false)) + "\u002F\u003E\u003Cinput" + (" type=\"hidden\" name=\"date\""+pug_attr("value", c.createdAt, true, false)) + "\u002F\u003E\u003C\u002Fdiv\u003E";
    }
  }
}).call(this);

}
};
pug_mixins["changeIcon"] = pug_interp = function(op){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (op == 'remove') {
pug_html = pug_html + "\u003Cspan class=\"lbl\"\u003E&rarr; \u003C\u002Fspan\u003E\u003Cspan class=\"lbl icn rejected\"\u003E\u003C\u002Fspan\u003E";
}
else
if (op == 'add') {
pug_html = pug_html + "+";
}
else {
pug_html = pug_html + "\u003Cspan class=\"lbl\"\u003E&rarr;  \u003C\u002Fspan\u003E";
}
};
pug_mixins["changes"] = pug_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var past = {add: 'added', remove: 'removed', replace: 'changed', move: 'moved', copy: 'copied'}
pug_html = pug_html + "\u003Ctable class=\"diff\"\u003E";
if (docs) {
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
pug_html = pug_html + "\u003Ctr class=\"hig\"\u003E\u003Ctd class=\"pad\" colspan=\"3\"\u003E\u003Cspan" + (pug_attr("class", pug_classes(["ico",v.author], [false,true]), false, false)) + "\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = v.author) ? "" : pug_interp)) + "\u003C\u002Fb\u003E on ";
pug_mixins["renderVal"]('date', v? v.updatedAt:'');
pug_html = pug_html + " " + (pug_escape(null == (pug_interp = past[op.op] ? past[op.op] : op.op) ? "" : pug_interp)) + " \u003Cb\u003E" + (pug_escape(null == (pug_interp = op.path) ? "" : pug_interp)) + "\u003C\u002Fb\u003E\u003C\u002Fspan\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr" + (pug_attr("class", pug_classes(["change",op.op], [false,true]), false, false)) + "\u003E";
if (op.op == 'remove') {
op.old = op.value
delete op.value
}
if (op.op == 'replace' && typeof op.old === 'string' && typeof op.value === 'string') {
var diffs = textUtil.diffline(op.old, op.value);
pug_html = pug_html + "\u003Ctd\u003E\u003Cpre class=\"pre\"\u003E";
// iterate diffs.lhs
;(function(){
  var $$obj = diffs.lhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index28 = 0, $$l = $$obj.length; pug_index28 < $$l; pug_index28++) {
        var s = $$obj[pug_index28];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"red\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
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
pug_html = pug_html + "\u003Cspan class=\"red\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fpre\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E";
pug_mixins["changeIcon"](op.op);
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E\u003Cpre class=\"pre\"\u003E";
// iterate diffs.rhs
;(function(){
  var $$obj = diffs.rhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index29 = 0, $$l = $$obj.length; pug_index29 < $$l; pug_index29++) {
        var s = $$obj[pug_index29];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"grn\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
      }
  } else {
    var $$l = 0;
    for (var pug_index29 in $$obj) {
      $$l++;
      var s = $$obj[pug_index29];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"grn\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
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
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
pug_mixins["changeIcon"](op.op);
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
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
pug_html = pug_html + "\u003Ctr class=\"hig\"\u003E\u003Ctd class=\"pad\" colspan=\"3\"\u003E\u003Cspan" + (pug_attr("class", pug_classes(["ico",v.author], [false,true]), false, false)) + "\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = v.author) ? "" : pug_interp)) + "\u003C\u002Fb\u003E on ";
pug_mixins["renderVal"]('date', v? v.updatedAt:'');
pug_html = pug_html + " " + (pug_escape(null == (pug_interp = past[op.op] ? past[op.op] : op.op) ? "" : pug_interp)) + " \u003Cb\u003E" + (pug_escape(null == (pug_interp = op.path) ? "" : pug_interp)) + "\u003C\u002Fb\u003E\u003C\u002Fspan\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr" + (pug_attr("class", pug_classes(["change",op.op], [false,true]), false, false)) + "\u003E";
if (op.op == 'remove') {
op.old = op.value
delete op.value
}
if (op.op == 'replace' && typeof op.old === 'string' && typeof op.value === 'string') {
var diffs = textUtil.diffline(op.old, op.value);
pug_html = pug_html + "\u003Ctd\u003E\u003Cpre class=\"pre\"\u003E";
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
pug_html = pug_html + "\u003Cspan class=\"red\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
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
pug_html = pug_html + "\u003Cspan class=\"red\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fpre\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E";
pug_mixins["changeIcon"](op.op);
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E\u003Cpre class=\"pre\"\u003E";
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
pug_html = pug_html + "\u003Cspan class=\"grn\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
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
pug_html = pug_html + "\u003Cspan class=\"grn\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
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
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
pug_mixins["changeIcon"](op.op);
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
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
pug_html = pug_html + "\u003Ctr class=\"hig\"\u003E\u003Ctd class=\"pad\" colspan=\"3\"\u003E\u003Cspan" + (pug_attr("class", pug_classes(["ico",v.author], [false,true]), false, false)) + "\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = v.author) ? "" : pug_interp)) + "\u003C\u002Fb\u003E on ";
pug_mixins["renderVal"]('date', v? v.updatedAt:'');
pug_html = pug_html + " " + (pug_escape(null == (pug_interp = past[op.op] ? past[op.op] : op.op) ? "" : pug_interp)) + " \u003Cb\u003E" + (pug_escape(null == (pug_interp = op.path) ? "" : pug_interp)) + "\u003C\u002Fb\u003E\u003C\u002Fspan\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr" + (pug_attr("class", pug_classes(["change",op.op], [false,true]), false, false)) + "\u003E";
if (op.op == 'remove') {
op.old = op.value
delete op.value
}
if (op.op == 'replace' && typeof op.old === 'string' && typeof op.value === 'string') {
var diffs = textUtil.diffline(op.old, op.value);
pug_html = pug_html + "\u003Ctd\u003E\u003Cpre class=\"pre\"\u003E";
// iterate diffs.lhs
;(function(){
  var $$obj = diffs.lhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index33 = 0, $$l = $$obj.length; pug_index33 < $$l; pug_index33++) {
        var s = $$obj[pug_index33];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"red\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
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
pug_html = pug_html + "\u003Cspan class=\"red\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fpre\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E";
pug_mixins["changeIcon"](op.op);
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E\u003Cpre class=\"pre\"\u003E";
// iterate diffs.rhs
;(function(){
  var $$obj = diffs.rhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index34 = 0, $$l = $$obj.length; pug_index34 < $$l; pug_index34++) {
        var s = $$obj[pug_index34];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"grn\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
      }
  } else {
    var $$l = 0;
    for (var pug_index34 in $$obj) {
      $$l++;
      var s = $$obj[pug_index34];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"grn\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
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
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
pug_mixins["changeIcon"](op.op);
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
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
pug_html = pug_html + "\u003Ctr class=\"hig\"\u003E\u003Ctd class=\"pad\" colspan=\"3\"\u003E\u003Cspan" + (pug_attr("class", pug_classes(["ico",v.author], [false,true]), false, false)) + "\u003E\u003Cb\u003E" + (pug_escape(null == (pug_interp = v.author) ? "" : pug_interp)) + "\u003C\u002Fb\u003E on ";
pug_mixins["renderVal"]('date', v? v.updatedAt:'');
pug_html = pug_html + " " + (pug_escape(null == (pug_interp = past[op.op] ? past[op.op] : op.op) ? "" : pug_interp)) + " \u003Cb\u003E" + (pug_escape(null == (pug_interp = op.path) ? "" : pug_interp)) + "\u003C\u002Fb\u003E\u003C\u002Fspan\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003Ctr" + (pug_attr("class", pug_classes(["change",op.op], [false,true]), false, false)) + "\u003E";
if (op.op == 'remove') {
op.old = op.value
delete op.value
}
if (op.op == 'replace' && typeof op.old === 'string' && typeof op.value === 'string') {
var diffs = textUtil.diffline(op.old, op.value);
pug_html = pug_html + "\u003Ctd\u003E\u003Cpre class=\"pre\"\u003E";
// iterate diffs.lhs
;(function(){
  var $$obj = diffs.lhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index35 = 0, $$l = $$obj.length; pug_index35 < $$l; pug_index35++) {
        var s = $$obj[pug_index35];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"red\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
      }
  } else {
    var $$l = 0;
    for (var pug_index35 in $$obj) {
      $$l++;
      var s = $$obj[pug_index35];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"red\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fpre\u003E\u003C\u002Ftd\u003E\u003Ctd\u003E";
pug_mixins["changeIcon"](op.op);
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E\u003Cpre class=\"pre\"\u003E";
// iterate diffs.rhs
;(function(){
  var $$obj = diffs.rhs;
  if ('number' == typeof $$obj.length) {
      for (var pug_index36 = 0, $$l = $$obj.length; pug_index36 < $$l; pug_index36++) {
        var s = $$obj[pug_index36];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"grn\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
  break;
}
      }
  } else {
    var $$l = 0;
    for (var pug_index36 in $$obj) {
      $$l++;
      var s = $$obj[pug_index36];
switch (s.t){
case 0:
pug_html = pug_html + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp));
  break;
case 1:
pug_html = pug_html + "\u003Cspan class=\"grn\"\u003E" + (pug_escape(null == (pug_interp = s.str) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
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
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
pug_mixins["changeIcon"](op.op);
pug_html = pug_html + "\u003C\u002Ftd\u003E\u003Ctd\u003E";
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

}
pug_html = pug_html + "\u003C\u002Ftable\u003E";
};
pug_mixins["filePreview"] = pug_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_mixins["table"](docs,columns);
};
if (ctemplate != undefined) {
pug_mixins[ctemplate]();
}}.call(this,"Array" in locals_for_with?locals_for_with.Array:typeof Array!=="undefined"?Array:undefined,"Date" in locals_for_with?locals_for_with.Date:typeof Date!=="undefined"?Date:undefined,"JSON" in locals_for_with?locals_for_with.JSON:typeof JSON!=="undefined"?JSON:undefined,"Math" in locals_for_with?locals_for_with.Math:typeof Math!=="undefined"?Math:undefined,"Number" in locals_for_with?locals_for_with.Number:typeof Number!=="undefined"?Number:undefined,"Object" in locals_for_with?locals_for_with.Object:typeof Object!=="undefined"?Object:undefined,"Set" in locals_for_with?locals_for_with.Set:typeof Set!=="undefined"?Set:undefined,"String" in locals_for_with?locals_for_with.String:typeof String!=="undefined"?String:undefined,"bulkInput" in locals_for_with?locals_for_with.bulkInput:typeof bulkInput!=="undefined"?bulkInput:undefined,"columns" in locals_for_with?locals_for_with.columns:typeof columns!=="undefined"?columns:undefined,"conf" in locals_for_with?locals_for_with.conf:typeof conf!=="undefined"?conf:undefined,"csrfToken" in locals_for_with?locals_for_with.csrfToken:typeof csrfToken!=="undefined"?csrfToken:undefined,"ctemplate" in locals_for_with?locals_for_with.ctemplate:typeof ctemplate!=="undefined"?ctemplate:undefined,"current" in locals_for_with?locals_for_with.current:typeof current!=="undefined"?current:undefined,"doc_id" in locals_for_with?locals_for_with.doc_id:typeof doc_id!=="undefined"?doc_id:undefined,"docs" in locals_for_with?locals_for_with.docs:typeof docs!=="undefined"?docs:undefined,"fields" in locals_for_with?locals_for_with.fields:typeof fields!=="undefined"?fields:undefined,"files" in locals_for_with?locals_for_with.files:typeof files!=="undefined"?files:undefined,"id" in locals_for_with?locals_for_with.id:typeof id!=="undefined"?id:undefined,"isNaN" in locals_for_with?locals_for_with.isNaN:typeof isNaN!=="undefined"?isNaN:undefined,"limit" in locals_for_with?locals_for_with.limit:typeof limit!=="undefined"?limit:undefined,"onclick" in locals_for_with?locals_for_with.onclick:typeof onclick!=="undefined"?onclick:undefined,"page" in locals_for_with?locals_for_with.page:typeof page!=="undefined"?page:undefined,"pages" in locals_for_with?locals_for_with.pages:typeof pages!=="undefined"?pages:undefined,"parseFloat" in locals_for_with?locals_for_with.parseFloat:typeof parseFloat!=="undefined"?parseFloat:undefined,"qs" in locals_for_with?locals_for_with.qs:typeof qs!=="undefined"?qs:undefined,"query" in locals_for_with?locals_for_with.query:typeof query!=="undefined"?query:undefined,"rowCount" in locals_for_with?locals_for_with.rowCount:typeof rowCount!=="undefined"?rowCount:undefined,"schemaName" in locals_for_with?locals_for_with.schemaName:typeof schemaName!=="undefined"?schemaName:undefined,"tTime" in locals_for_with?locals_for_with.tTime:typeof tTime!=="undefined"?tTime:undefined,"textUtil" in locals_for_with?locals_for_with.textUtil:typeof textUtil!=="undefined"?textUtil:undefined,"total" in locals_for_with?locals_for_with.total:typeof total!=="undefined"?total:undefined,"username" in locals_for_with?locals_for_with.username:typeof username!=="undefined"?username:undefined));;return pug_html;}