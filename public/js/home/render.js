function pug_attr(t,e,n,r){if(!1===e||null==e||!e&&("class"===t||"style"===t))return"";if(!0===e)return" "+(r?t:t+'="'+t+'"');var f=typeof e;return"object"!==f&&"function"!==f||"function"!=typeof e.toJSON||(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;function pugRender(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (Array, Date, doc, doc_id, isNaN, renderTemplate) {pug_mixins["para"] = pug_interp = function(t, hypertext){
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
}
};
pug_mixins["mpara"] = pug_interp = function(l, hypertext){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (l) {
// iterate l
;(function(){
  var $$obj = l;
  if ('number' == typeof $$obj.length) {
      for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {
        var d = $$obj[pug_index1];
if (d.value) {
pug_mixins["para"](d.value, hypertext);
}
      }
  } else {
    var $$l = 0;
    for (var pug_index1 in $$obj) {
      $$l++;
      var d = $$obj[pug_index1];
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
pug_mixins["page"] = pug_interp = function(obj){
var block = (this && this.block), attributes = (this && this.attributes) || {};
if (obj !== null) {
if (typeof obj === 'string') {
if (obj.length < 20) {
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([obj], [true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = obj) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
}
else {
pug_html = pug_html + "\u003Cspan class=\"wrp\"\u003E" + (pug_escape(null == (pug_interp = obj) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
}
}
else
if (obj instanceof Array) {
if (obj.length > 0) {
pug_html = pug_html + "\u003Col\u003E";
// iterate obj
;(function(){
  var $$obj = obj;
  if ('number' == typeof $$obj.length) {
      for (var k = 0, $$l = $$obj.length; k < $$l; k++) {
        var v = $$obj[k];
pug_html = pug_html + "\u003Cli\u003E";
pug_mixins["page"](v);
pug_html = pug_html + "\u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var k in $$obj) {
      $$l++;
      var v = $$obj[k];
pug_html = pug_html + "\u003Cli\u003E";
pug_mixins["page"](v);
pug_html = pug_html + "\u003C\u002Fli\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fol\u003E";
}
}
else
if (typeof obj === 'object') {
// iterate obj
;(function(){
  var $$obj = obj;
  if ('number' == typeof $$obj.length) {
      for (var k = 0, $$l = $$obj.length; k < $$l; k++) {
        var v = $$obj[k];
if (obj.hasOwnProperty(k)) {
pug_html = pug_html + "\u003Cdiv class=\"indent\"\u003E\u003Cb" + (pug_attr("class", pug_classes(["ico",k], [false,true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = k) ? "" : pug_interp)) + ": \u003C\u002Fb\u003E ";
pug_mixins["page"](v);
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var k in $$obj) {
      $$l++;
      var v = $$obj[k];
if (obj.hasOwnProperty(k)) {
pug_html = pug_html + "\u003Cdiv class=\"indent\"\u003E\u003Cb" + (pug_attr("class", pug_classes(["ico",k], [false,true]), false, false)) + "\u003E" + (pug_escape(null == (pug_interp = k) ? "" : pug_interp)) + ": \u003C\u002Fb\u003E ";
pug_mixins["page"](v);
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
}
    }
  }
}).call(this);

}
else {
pug_html = pug_html + (pug_escape(null == (pug_interp = obj) ? "" : pug_interp));
}
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
}}.call(this,"Array" in locals_for_with?locals_for_with.Array:typeof Array!=="undefined"?Array:undefined,"Date" in locals_for_with?locals_for_with.Date:typeof Date!=="undefined"?Date:undefined,"doc" in locals_for_with?locals_for_with.doc:typeof doc!=="undefined"?doc:undefined,"doc_id" in locals_for_with?locals_for_with.doc_id:typeof doc_id!=="undefined"?doc_id:undefined,"isNaN" in locals_for_with?locals_for_with.isNaN:typeof isNaN!=="undefined"?isNaN:undefined,"renderTemplate" in locals_for_with?locals_for_with.renderTemplate:typeof renderTemplate!=="undefined"?renderTemplate:undefined));;return pug_html;}