// Copyright (c) 2018 Chandan B N. All rights reserved.
/* jshint esversion: 6 */
/* jshint browser:true */
/* jshint unused: false */
/* globals csrfToken */
/* globals ace */
/* globals JSONEditor */
/* globals pugRender */
/* globals textUtil */
/* globals schemaName */
/* globals SimpleHtml */
/* globals allowAjax */
/* globals docSchema */
/* globals custom_validators */
/* globals initJSON */
/* globals postUrl */
/* globals getChanges */
/* globals postURL */
/* globals idpath */
/* globals io */
/* globals realtimeEnabled */
/* globals realtimeConfig */
/* globals draftsEnabled */


var infoMsg = document.getElementById('infoMsg');
var errMsg = document.getElementById('errMsg');
var save1 = document.getElementById('save1');
var editorLabel = document.getElementById('editorLabel');
var iconTheme = 'vgi-';
var starting_value = {};
var sourceEditor;
var draftsBaseline = null;
var draftsFeatureEnabled = (typeof draftsEnabled === 'boolean') ? draftsEnabled : true;

export {
    infoMsg,
    errMsg,
    save1,
    editorLabel,
    iconTheme,
    starting_value,
    sourceEditor,
    draftsBaseline,
    draftsFeatureEnabled
};
