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
/* globals wysihtml5 */
/* globals wysihtml5ParserRules */
/* globals wysihtml5ParserRules */
/* globals allowAjax */
/* globals docSchema */
/* globals custom_validators */
/* globals initJSON */
/* globals postUrl */
/* globals getChanges */
/* globals postURL */
/* globals idpath */

var infoMsg = document.getElementById('infoMsg');
var errMsg = document.getElementById('errMsg');
var save1 = document.getElementById('save1');
var save2 = document.getElementById('save2');
var editorLabel = document.getElementById('editorLabel');

var starting_value = {};
var sourceEditor;

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === "string" && schema.format === "radio") {
        return "radio";
    }
});

JSONEditor.defaults.templates.custom = function () {
    return {
        compile: function (template) {
            return function (context) {
                return eval(template);
            };
        }
    };
};

JSONEditor.defaults.editors.string = JSONEditor.defaults.editors.string.extend({
    addLink: function(link) {
        if(this.control) this.control.appendChild(link);
    },
    build: function() {
        this._super();
        if(this.label && this.options.class) {
            this.label.className = this.label.className + ' ' + this.options.class;
        }
        if(this.schema.examples && this.schema.examples.length > 0){
            var dlist = document.createElement('datalist');
            dlist.setAttribute('id', this.path + '-datalist');
            var eg = this.schema.examples;
            for(var i = 0; i< eg.length; i++) {
                var v = document.createElement('option');
                v.setAttribute('value', eg[i]);
                dlist.appendChild(v);
            }
            this.input.setAttribute('list', this.path + '-datalist');
            this.container.appendChild(dlist);
        }
    }
});
     
// allow file uploads
JSONEditor.defaults.options.upload = function (type, file, cbs) {

    //var reader = new FileReader();
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    fd.append('file1', file);
    this.xhr = xhr;
    var self = this;
    this.xhr.upload.addEventListener("loadstart", function (e) {
        cbs.updateProgress(0); //
    }, false);

    this.xhr.upload.addEventListener("progress", function (e) {
        if (e.lengthComputable) {
            var percentage = Math.round((e.loaded * 100) / e.total);
            cbs.updateProgress(percentage);
            //self.ctrl.update(percentage);
        }
    }, false);

    xhr.upload.addEventListener("load", function (e) {
        //self.ctrl.update(100);
        cbs.updateProgress(100);
        //var canvas = self.ctrl.ctx.canvas;
        //canvas.parentNode.removeChild(canvas);
    }, false);
    var uf = function (e) {
        cbs.failure('Upload failed:');
    };
    xhr.addEventListener("error", uf, false);
    xhr.addEventListener("abort", uf, false);

    xhr.upload.addEventListener("error", uf, false);
    xhr.upload.addEventListener("abort", uf, false);

    xhr.onreadystatechange = function (oEvent) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (xhr.response == '{"ok":"1"}') {
                    //console.log(xhr.responseText);
                    cbs.success(file.name);
                } else {
                    cbs.failure('Upload failed: ' + xhr.statusText);
                }
            } else if (xhr.status === 404) {
                cbs.failure('Upload failed: ID Not found. Try saving document first!');
            }
        }
    };

    xhr.open("POST", window.location + '/file');
    xhr.setRequestHeader('X-CSRF-Token', csrfToken);
    xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
    xhr.send(fd);
};

JSONEditor.defaults.editors.radio = JSONEditor.AbstractEditor.extend({
    setValue: function (value, initial) {
        value = this.typecast(value || '');

        // Sanitize value before setting it
        var sanitized = value;
        if (this.schema.enum.indexOf(sanitized) < 0) {
            sanitized = this.schema.enum[0];
        }

        if (this.value === sanitized) {
            return;
        }

        var self = this;
        for (var input in this.inputs) {
            if (input === sanitized) {

                this.inputs[input].checked = true;
                self.value = sanitized;
                self.jsoneditor.notifyWatchers(self.path);
                return false;
            }
        }
    },
    register: function () {
        this._super();
        if (!this.inputs) return;
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].setAttribute('name', this.formname);
        }
    },
    unregister: function () {
        this._super();
        if (!this.inputs) return;
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].removeAttribute('name');
        }
    },
    getNumColumns: function () {
        var longest_text = this.getTitle().length;
        for (var i = 0; i < this.schema.enum.length; i++) {
            longest_text = Math.max(longest_text, this.schema.enum[i].length + 4);
        }
        return Math.min(12, Math.max(longest_text / 7, 2));
    },
    typecast: function (value) {
        if (this.schema.type === "boolean") {
            return !!value;
        } else if (this.schema.type === "number") {
            return 1 * value;
        } else if (this.schema.type === "integer") {
            return Math.floor(value * 1);
        } else {
            return "" + value;
        }
    },
    getValue: function () {
        return this.value;
    },
    removeProperty: function () {
        this._super();
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].style.display = 'none';
        }
        if (this.description) this.description.style.display = 'none';
        this.theme.disableLabel(this.label);
    },
    addProperty: function () {
        this._super();
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].style.display = '';
        }
        if (this.description) this.description.style.display = '';
        this.theme.enableLabel(this.label);
    },
    sanitize: function (value) {
        if (this.schema.type === "number") {
            return 1 * value;
        } else if (this.schema.type === "integer") {
            return Math.floor(value * 1);
        } else {
            return "" + value;
        }
    },
    build: function () {
        var self = this,
            i;
        if (!this.options.compact) {
            this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
        }
        if (this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);

        this.select_options = {};
        this.select_values = {};

        var e = this.schema.enum || [];
        var options = [];
        for (i = 0; i < e.length; i++) {
            // If the sanitized value is different from the enum value, don't include it
            if (this.sanitize(e[i]) !== e[i]) continue;

            options.push(e[i] + "");
            this.select_values[e[i] + ""] = e[i];
        }

        this.input_type = 'radiogroup';
        this.inputs = {};
        this.controls = {};
        for (i = 0; i < options.length; i++) {
            this.inputs[options[i]] = this.theme.getRadio();
            this.inputs[options[i]].setAttribute('value', options[i]);
            this.inputs[options[i]].setAttribute('name', this.formname);
            this.inputs[options[i]].setAttribute('id', this.formname + options[i]);
            var label = this.theme.getRadioLabel((this.schema.options && this.schema.options.enum_titles && this.schema.options.enum_titles[i]) ?
                this.schema.options.enum_titles[i] :
                options[i]);
            label.setAttribute('for', this.formname + options[i]);
            label.setAttribute('class', 'icn lbl ' + options[i]);
            this.controls[options[i]] = this.theme.getFormControl(this.inputs[options[i]], label);
        }

        this.control = this.theme.getRadioGroupHolder(this.controls, this.label, this.description);
        this.container.appendChild(this.control);
        this.control.addEventListener('change', function (e) {
            e.preventDefault();
            e.stopPropagation();

            var val = e.target.value;

            var sanitized = val;
            if (self.schema.enum.indexOf(val) === -1) {
                sanitized = self.schema.enum[0];
            }

            self.value = sanitized;

            if (self.parent) self.parent.onChildEditorChange(self);
            else self.jsoneditor.onChange();
            self.jsoneditor.notifyWatchers(self.path);
        });
    },
    enable: function () {
        if (!this.always_disabled) {
            var opts = Object.keys(this.inputs);
            for (var i = 0; i < opts.length; i++) {
                this.inputs[opts[i]].disabled = false;
            }
        }
        this._super();
    },
    disable: function () {
        //console.log(this.inputs);
        var opts = Object.keys(this.inputs);
        for (var i = 0; i < opts.length; i++) {
            this.inputs[opts[i]].disabled = true;
        }
        this._super();
    },
    destroy: function () {
        if (this.label) this.label.parentNode.removeChild(this.label);
        if (this.description) this.description.parentNode.removeChild(this.description);
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].parentNode.removeChild(this.inputs[i]);
        }
        this._super();
    }
});

function tzOffset(x) {
    var offset = new Date(x).getTimezoneOffset(),
        o = Math.abs(offset);
    return (offset < 0 ? "+" : "-") + ("00" + Math.floor(o / 60)).slice(-2) + ":" + ("00" + (o % 60)).slice(-2);
}

// The time is displayed/set in local times in the input,
//  but setValue, getValue use UTC. JSON output will be in UTC.
JSONEditor.defaults.editors.dateTime = JSONEditor.defaults.editors.string.extend({
    getValue: function () {
        if (this.value && this.value.length > 0) {
            if (this.value.match(/^\d{4}-\d{2}-\d{2}T[\d\:\.]+$/)) {
                this.value = this.value + tzOffset(this.value);
            }
            var d = new Date(this.value);
            if (d instanceof Date && !isNaN(d.getTime())) {
                return d.toISOString();
            } else {
                return this.value;
            }
        } else {
            return "";
        }
    },

    setValue: function (val) {
        if (val && this.value.match(/^\d{4}-\d{2}-\d{2}T[\d\:\.]+$/)) {
            val = val + tzOffset();
        }
        var d = new Date(val);
        if (d instanceof Date && !isNaN(d.getTime()) && d.getTime() > 0) {
            var x = new Date((d.getTime() - (d.getTimezoneOffset() * 60000)));
            this.value =
                this.input.value = x.toJSON().slice(0, 16);
        } else {
            this.value = this.input.value = "";
        }
        this.jsoneditor.notifyWatchers(this.path);
    },

    build: function () {
        this.schema.format = "datetime-local";
        this._super();
        this.input.className = "txt";
        var tzInfo = document.createElement('span');
        tzInfo.className = "lbl tgrey";
        tzInfo.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.input.parentNode.appendChild(tzInfo);
    }
});

JSONEditor.defaults.editors.taglist = JSONEditor.defaults.editors.string.extend({
    getValue: function () {
        if (this.input && this.input.value) {
            return this.input.value.split(/[\s,]+/);
        } else {
            return [];
        }
    },
    setValue: function (val) {
        if (val instanceof Array) {
            //this.value = val.split();
            this.input.value = val.join(' ');
        } else {
            this.input.value = val;
        }
        this.onChange(true);
    },

    build: function () {
        this.schema.format = "taglist";
        this._super();
    }
});

JSONEditor.defaults.editors.simplehtml = JSONEditor.defaults.editors.string.extend({
    getValue: function () {
        var ret = this._super();
        if(this.wysLoaded) {
            ret = this.wys.getValue();
        // } else if(this.input) {
        //    ret = this.input.value;
        }
        //console.log('GET: ' + this.wys + ' RE= ' + ret);
        return ret;
    },

    setValue: function(value,initial,from_template) {
        this._super(value,initial,from_template);
        if (this.wysLoaded) {
            this.wys.setValue(this.input.value);
            
            var sa = this.wys.getValue();
            if(sa != this.input.value) {
                this.input.value = sa;
                //console.log('Changed on setting value'+value);
                this.onChange(true);
            }
        //} else if(this.input) {
        //    this.input.value = value;
        } else {
            //console.log('Set before ready'+value)
        //    this.contentDiv.innerHTML = this.input.value;
        }
   },
    build: function () {
        this.schema.format = this.format = 'hidden';
//        this.schema.format = "simplehtml";
        this._super();
        this.toolbar = 
            document.getElementById('commentTemplate').getElementsByClassName('toolbar')[0].cloneNode(true);
        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'pur ht4 fil';
        this.toolbar.className = 'fil shd wht stk toolbar';
        this.input.parentNode.insertBefore(this.toolbar, this.input);
        this.input.parentNode.appendChild(this.contentDiv);
    },
        afterInputReady: function() {
        var self = this, options;
        //console.log('called after input ready' +  this.input.value); 
        var WYS = this.wys = new wysihtml5.Editor(this.contentDiv, {
            toolbar: this.toolbar,
            parserRules: wysihtml5ParserRules,
            showToolbarAfterInit: false,
        });
            
            
        this.wys.on('load', function() {
            self.wys.setValue(self.input.value);
            var sa = self.wys.getValue();
            if(sa != self.input.value) {
                self.input.value = sa;
                //console.log('Changed on setting input');
                //self.is_dirty = true;
                //self.onChange(true);
            }
            //console.log('Loaded');
            self.wysLoaded = true;            
        });
            
       /* this.wys.composer.doc.onkeyup = function () {
            self.value = self.input.value = self.wys.getValue();
            self.is_dirty = true;
            self.onChange(true);
        };*/
        this.wys.on('change', function() {
            self.value = self.input.value = self.wys.getValue();
            self.is_dirty = true;
            self.onChange(true);
            //console.log('Changed' + JSON.stringify(this))
        });
            
        this.wys.on("dragleave", function(event) {
              event.preventDefault();  
              event.stopPropagation();
        });

        this.wys.on("drop", function(event) {
              event.preventDefault();  
              event.stopPropagation();
              var dt = event.dataTransfer;
                        var files = dt.files;

              var reader = new FileReader();
              reader.onload = function (e) {
                  //var data = this.result;
                  self.wys.composer.commands.exec('insertImage',e.target.result);
                  self.value = self.input.value = self.wys.getValue();
                    self.is_dirty = true;
                    self.onChange(true);
                  
              };
              reader.readAsDataURL( files[0] );
          });
            
        this.wys.on("dragover", function(event) {
                  event.preventDefault();  
                  event.stopPropagation();
                  this.addClass('dragging');
        });
    },
});

// Instruct the json-editor to use the custom datetime-editor.
JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === "string" && schema.format === "datetime") {
        return "dateTime";
    }

});

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === "array" && schema.format === "taglist") {
        return "taglist";
    }

});

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === "string" && schema.format === "simplehtml") {
        return "simplehtml";
    }
});

JSONEditor.defaults.editors.upload =
    JSONEditor.defaults.editors.upload.extend({
        build: function () {
            this._super();
            this.uploader.className = "fbn";
            var a = document.createElement('a');
            a.className = 'fbn icn download';
            a.target = "_blank";
            this.control.replaceChild(a, this.label);
            this.control.appendChild(this.preview);
            this.label = this.title = a;
        },
        setValue: function (val) {
            if (this.value !== val) {
                this.title.href = window.location + '/file/' + encodeURIComponent(val);
                this.title.textContent = val;
                this._super(val);
            }
        },
        refreshPreview: function () {
            if (this.last_preview === this.preview_value) return;
            this.last_preview = this.preview_value;

            this.preview.innerHTML = '';

            if (!this.preview_value) return;

            var self = this;

            var mime = this.preview_value.match(/^data:([^;,]+)[;,]/);
            if (mime) mime = mime[1];
            if (!mime) mime = 'unknown';

            var file = this.uploader.files[0];

            this.preview.textContent = textUtil.fileSize(file.size);
            var uploadButton = this.getButton('Upload', 'upload', 'Upload');
            uploadButton.className ='btn icn indent sfe save';
            this.preview.appendChild(uploadButton);
            uploadButton.addEventListener('click', function (event) {
                event.preventDefault();

                uploadButton.setAttribute("disabled", "disabled");
                self.theme.removeInputError(self.uploader);

                if (self.theme.getProgressBar) {
                    self.progressBar = self.theme.getProgressBar();
                    self.preview.appendChild(self.progressBar);
                }

                self.jsoneditor.options.upload(self.path, file, {
                    success: function (url) {
                        self.setValue(url);

                        if (self.parent) self.parent.onChildEditorChange(self);
                        else self.jsoneditor.onChange();

                        if (self.progressBar) self.preview.removeChild(self.progressBar);
                        uploadButton.textContent = 'Done';
                        uploadButton.setAttribute('value', 'Done');
                        uploadButton.setAttribute('disabled', true);
                    },
                    failure: function (error) {
                        self.theme.addInputError(self.uploader, error);
                        if (self.progressBar) self.preview.removeChild(self.progressBar);
                        uploadButton.removeAttribute("disabled");
                        uploadButton.textContent = "Upload";

                    },
                    updateProgress: function (progress) {
                        if (self.progressBar) {
                            if (progress) self.theme.updateProgressBar(self.progressBar, progress);
                            else self.theme.updateProgressBarUnknown(self.progressBar);
                        }
                    }
                });
            });
        }
    });

JSONEditor.defaults.themes.custom = JSONEditor.AbstractTheme.extend({
    getBlockLink: function() {
        var link = document.createElement('a');
        return link;
    },
    getLinksHolder: function() {
            var el = document.createElement('span');
            return el;
      },
    getDescription: function (text) {
        var el = document.createElement('summary');
        el.innerHTML = text;
        return el;
    },
  getFormControl: function(label, input, description) {
    var el = document.createElement('div');
    el.className = 'form-control';
    //console.log(input.editor);
    if(label) {
        if(description)
            label.setAttribute('title', description.textContent);
        el.appendChild(label);
    }
    if(input.type === 'checkbox') {
      label.insertBefore(input,label.firstChild);
      if(description) el.appendChild(description);
    }
    else {
      if(input.type =='text'){
          input.className = 'icn txt';
          if(description)
              input.setAttribute('title', description.textContent);
      }
      input.setAttribute('placeholder', description ? description.textContent : '');
      input.setAttribute('autocomplete', 'on');
      el.appendChild(input);
    }
    return el;
  },
    getFormInputLabel: function (text) {
        var el = this._super(text);
        el.className = 'lbl icn ' + text;
        return el;
    },
    getFormInputDescription: function (text) {
        var el = this._super(text);
        return el;
    },
    getIndentedPanel: function () {
        var el = this._super();
        el.style = "indent";
        return el;
    },
    getChildEditorHolder: function () {
        var el = this._super();
        return el;
    },
    getHeaderButtonHolder: function () {
        var el = this.getButtonHolder();
        return el;
    },
    getHeader: function (text) {
        var el = document.createElement('b');
        if (typeof text === "string") {
            el.textContent = text;
            el.className = 'icn ' + text;
            //el.setAttribute('name',text);
        } else {
            text.className = 'icn ' + text.textContent;
            //el.setAttribute('name',text.textContent);
            el.appendChild(text);
        }
        return el;
    },
    getTable: function () {
        var el = this._super();
        el.className = 'tbl';
        return el;
    },
    getButton: function(text, icon, title) {
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'btn icn sml ' + icon;
        this.setButtonText(el,text,icon,title);
        return el;
    },
    addInputError: function (input, text) {
        input.style.boxShadow = "0px 0px 0px 3px rgba(252, 114, 114, 0.33)";        
        input.style.border = "1px solid coral";
        if (!input.errmsg) {
            var group = this.closest(input, '.form-control');
            input.errmsg = document.createElement('div');
            input.errmsg.setAttribute('class', 'pad tred');
            input.errmsg.style = input.errmsg.style || {};
            group.appendChild(input.errmsg);
        } else {
            input.errmsg.style.display = 'block';
        }

        input.errmsg.textContent = '';
        input.errmsg.appendChild(document.createTextNode(text));
    },
    removeInputError: function (input) {
        input.style.border = '';
        input.style.boxShadow = '';
        if (input.errmsg) input.errmsg.style.display = 'none';
    },
    getRadio: function () {
        var el = this.getFormInputField('radio');
        return el;
    },
    getRadioGroupHolder: function (controls, label, description) {
        var el = document.createElement('div');
        var radioGroup = document.createElement('div');
        radioGroup.className = 'rdg';

        if (label) {
            //label.style.display = 'inline-block';
            el.appendChild(label);
        }
        el.appendChild(radioGroup);
        for (var i in controls) {
            if (!controls.hasOwnProperty(i)) continue;
            radioGroup.appendChild(controls[i]);
        }

        if (description) el.appendChild(description);
        return el;
    },
    getRadioLabel: function (text) {
        var el = this.getFormInputLabel(text);
        return el;
    },
    getProgressBar: function () {
        var max = 100,
            start = 0;

        var progressBar = document.createElement('progress');
        progressBar.setAttribute('max', max);
        progressBar.setAttribute('value', start);
        return progressBar;
    },
    updateProgressBar: function (progressBar, progress) {
        if (!progressBar) return;
        progressBar.setAttribute('value', progress);
    },
    updateProgressBarUnknown: function (progressBar) {
        if (!progressBar) return;
        progressBar.removeAttribute('value');
    },
    getSelectInput: function(options) {
        var select = document.createElement('select');
        select.className = 'btn';
        if(options)     this.setSelectOptions(select, options);
        return select;
    },
    setGridColumnSize: function(el, size) {
      el.className = 'col s' + size;
    }
});
if (typeof(custom_validators) !== 'undefined'){
    JSONEditor.defaults.custom_validators = custom_validators;
}

var docEditorOptions = {
    // Enable fetching schemas via ajax
    ajax: allowAjax,
    theme: 'custom',
    disable_collapse: true,
    disable_array_reorder: true,
    disable_properties: true,
    disable_edit_json: true,
    disable_array_delete_last_row: true,
    disable_array_delete_all_rows: true,
    expand_height: true,
    input_width: '3em',
    input_height: '4em',
    template: 'custom',
    prompt_before_delete: false,
    ajaxBase: ajaxBase,
    // The schema for the editor
    schema: docSchema
    // Seed the form with a starting value
    //starting_value: {},

    // Disable additional properties
    //no_additional_properties: false,

    // Require all properties by default
    //required_by_default: false,
    //display_required_only: false
};
var docEditor;
/*
function hashChange() {
    if(window.location.hash) {
        var hash = window.location.hash.substring(1);
        if((hash) && document.getElementById(hash+'Tab')) {
            selected = hash+'Tab';
            var t = document.getElementById(selected);
            t.checked = true;
            var event = new Event('change');
            t.dispatchEvent(event);
        }
    }
}

window.onhashchange = hashChange;
*/
var selected = "editorTab";
if (typeof(defaultTab) !== 'undefined') {
    selected = defaultTab;
} else {
    if(window.location.hash) {
        var hash = window.location.hash.substring(1);
        if((hash) && document.getElementById(hash+'Tab')){
            selected = hash+'Tab';
            //console.log('DEFAULT ' + selected);
        }
    }
}
var insync = false;
function Tabs(tabGroupId, tabOpts, primary) {
    var elem = document.getElementById(tabGroupId);
    var tg = {
        changeIndex: [],
        primary: primary,
        tabOpts: tabOpts,
        tabId: [],
        element: elem,
        tabs: elem.getElementsByClassName("tab"),
    }; 
    for (var i = 0; i < tg.tabs.length; i++) {
        
        var tab = tg.tabs[i];
        //console.log(tab.nextElementSibling);
        tab.nextElementSibling._tgIndex = tab._tgIndex = i;
        if(tab.id){
            tg.tabId[i] = tab.id;
        }
        tg.changeIndex[i]=0;
        tab.addEventListener('change', function(event){
            //console.log('CLicked ' + JSON.stringify( event) + ' ; ' + event.target);
            tg.select(event, event.target);
        });
    }
    tg.changeIndex[0] = 1;
    tg.select = function (event, elem) {
        errMsg.textContent = "";
        var selected = elem._tgIndex;
        //Does the tab need an update?
        //console.log('===CLICK====' + selected + ' cI '  + tg.changeIndex);
        if (tg.changeIndex[selected] < Math.max(...tg.changeIndex)) {
            var val = tg.getValue();
            //console.log('VAL = ' + val);
            if (val) {
                if(selected != primary){
                    //console.log(' Then Setting ' + selected);
                    tg.setValue(selected, val);
                    tg.changeIndex[selected] = tg.changeIndex[primary];
                }
            } else {
                event.preventDefault();
                return;
            }
        }
        window.location.hash = tg.tabId[selected].replace(/Tab$/,'');
    },
    tg.getValue = function (i) {
        if(i == undefined) {
            var maxi = 0;
            for (var m = 0; m < tg.tabs.length; m++) {
                if (tg.changeIndex[m] > tg.changeIndex[maxi]) {
                    maxi = m;
                }
            }
            var src = tg.tabId[maxi];
            //console.log('Most current = ' + maxi);
            if (src && tg.tabOpts[src].validate) {
                    //console.log('Validating ' + src );
                    var ret = tg.tabOpts[src].validate();
                    //console.log(' Got = ' + ret)
                    if(ret == -1) {
                        //event.preventDefault();
                        return undefined;
                    }
            }
            var val = tg.getValue(maxi);
            var primaryChanged = false;
            if(maxi != primary) {
                //console.log(' First Setting ' + primary);
                tg.setValue(primary, val);
                primaryChanged = true;
                tg.changeIndex[primary] = tg.changeIndex[maxi];
                var primaryOpts = tg.tabOpts[tg.tabId[primary]];
                if (primaryOpts && primaryOpts.validate) {
                    //console.log('validating Primary');
                    primaryOpts.validate();
                }
            }
            if (!primaryChanged) {
                return val;
            }
            i = primary;
        }
        //console.log('geting tab '+i);
        if(tg.tabOpts[tg.tabId[i]] && tg.tabOpts[tg.tabId[i]].getValue) {
            return tg.tabOpts[tg.tabId[i]].getValue();
        } else {
            return undefined;
        }
    }
    tg.setValue = function (index, val) {
        //console.log('Seting tab '+index);
        if(tg.tabOpts[tg.tabId[index]] && tg.tabOpts[tg.tabId[index]].setValue) {
            return tg.tabOpts[tg.tabId[index]].setValue(val);
        }
    }
    tg.change = function(index) {
        if (!insync) {
            tg.changeIndex[index]++;
            errMsg.textContent = '';
            editorLabel.className = "lbl";
            infoMsg.textContent = 'Edited';
            var nid = getDocID();
            document.title = '• ' + (nid ? nid : 'Vulnogram');
            if (document.getElementById("save1")) {
                save2.className = "btn sfe gap save";
                save1.className = "btn sfe save";
            }
            //console.log('Inc '+ tg.tabId[index] + ' is ' + tg.changeIndex[index]);
        }
    }
    return tg;
};

var originalTitle = document.title;
var changes = true;

var autoButton = document.getElementById('auto');

autoButton.addEventListener('click', function (event) {
        event.preventDefault();
        var d = docEditor.getEditor('root.description.description_data');
        var docJSON = docEditor.getValue();
        var desc = d.getValue();
        if (d) {
            var i = desc.length;
            while (i--) {
                if (desc[i].value.length === 0) {
                    desc.splice(i, 1);
                }
            }
            var ptstring = textUtil.getProblemTypeString(docJSON);
            if (ptstring.length == 0) {
                ptstring = "A"
            }
            desc.push({
                lang: "eng",
                value: ptstring + " vulnerability in ____COMPONENT____ of " + textUtil.getProductList(docJSON) +
                    " allows ____ATTACKER/ATTACK____ to cause ____IMPACT____."
            });
            desc.push({
                lang: "eng",
                value: textUtil.getAffectedProductString(docJSON)
            });
            d.setValue(desc);
        } else {

        }
    });

if (document.getElementById('remove')) {
    document.getElementById('remove').addEventListener('click', function () {
        //var e = docEditor.getValue();
        if (confirm('Delete this ' + originalTitle + '?')) {
            fetch("", {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'CSRF-Token': csrfToken
                },
            }).then(function (response) {
                if (response.status == 200) {
                    infoMsg.textContent = "Deleted ";
                    errMsg.textContent = "";
                    window.location = "./";
                } else {
                    errMsg.textContent = "Error " + response.statusText;
                    infoMsg.textContent = "";
                }
            });
        }
    });
}

if (document.getElementById('save1') && document.getElementById('save2')) {
    document.getElementById('save1').addEventListener('click', save);
    document.getElementById('save2').addEventListener('click', save);
    document.getElementById('save2').removeAttribute("style");
}

var defaultTabs = {
    editorTab: {
        setValue: function (val) {
            insync = true;
            docEditor.setValue(val);
            insync = false;
        },
        getValue: function () {
            return docEditor.getValue();
        },
        validate: function (x) {
            var errors = [];
            if (x) {
                errors = docEditor.validate(x);
            } else {
                errors = docEditor.validate();
            }
            if (errors.length > 0) {
                docEditor.setOption('show_errors', 'always');
                errMsg.textContent = (errors.length > 1 ? errors.length + " errors found" : errors[0].path + ": " + errors[0].message);
                console.log(errors);
                editorLabel.className = "red lbl";
                return 0;
            } else {
                errMsg.textContent = "";
                editorLabel.className = "lbl";
                return 1;
            }
        }
    },
    sourceTab: {
        setValue: function (val) {
            if (sourceEditor == undefined) {
                sourceEditor = ace.edit("output");
                sourceEditor.getSession().setMode("ace/mode/json");
                sourceEditor.getSession().on('change', function () {
                    mainTabGroup.change(1);
                });
                sourceEditor.setOptions({
                    maxLines: 480,
                    wrap: true
                });
                sourceEditor.$blockScrolling = Infinity;
            }
            insync = true;
            sourceEditor.getSession().setValue(JSON.stringify(val, null, 2));
            sourceEditor.clearSelection();
            insync = false;
        },
        validate: function () {
            try {
                var hasError = false;
                var firsterror = null;
                var annotations = sourceEditor.getSession().getAnnotations();
                for (var l in annotations) {
                    var annotation = annotations[l];
                    if (annotation.type === "error") {
                        hasError = true;
                        firsterror = annotation;
                        //console.log('SOurce error'+annotation);
                        break;
                    }
                }
                if (!hasError) {
                    return 1;
                } else {
                    sourceEditor.moveCursorTo(firsterror.row, firsterror.column, false);
                    sourceEditor.clearSelection();
                    errMsg.textContent = 'Please fix error: ' + firsterror.text;
                    document.getElementById("sourceTab").checked = true;
                    return -1;
                }
            } catch (err) {
                errMsg.textContent = err.message;
                document.getElementById("sourceTab").checked = true;
                return -1;
            } finally {}
        },
        getValue: function () {
            return JSON.parse(sourceEditor.getSession().getValue());
        }
    }
};
if(typeof additionalTabs !== 'undefined') {
    Object.assign(defaultTabs, additionalTabs);
}
var mainTabGroup = new Tabs('mainTabGroup', defaultTabs, 0);
function loadJSON(res, id, message) {
    // workaround for JSON Editor issue with clearing arrays
    // https://github.com/jdorn/json-editor/issues/617
    if (docEditor) {
        docEditor.destroy();
    }
    docEditor = new JSONEditor(document.getElementById('docEditor'), docEditorOptions);
    docEditor.on('ready', async function () {
        await docEditor.root.setValue(res, true);
        infoMsg.textContent = message ? message : '';
        errMsg.textContent = "";
        if(id) {
            document.title = id;
        } else {
            var nid =  getDocID();
            document.title = nid ? nid : 'Vulnogram';
        }
        if (document.getElementById("save1")) {
            save2.className = "btn save gap";
            save1.className = "btn save";
        }
        if (message) {
            selected = "editorTab";
        }
        docEditor.watch('root', function(){mainTabGroup.change(0)});
        editorLabel.className = "lbl";
        postUrl = getDocID() ? './' + getDocID() : "./new";

        document.getElementById(selected).checked = true;
        var event = new Event('change');
        //document.getElementById(selected).dispatchEvent(event);
        setTimeout(function (){
            document.getElementById(selected).dispatchEvent(event);
        }, 50);

        // hack to auto generate description/ needs improvement
        var descDiv = document.querySelector('[data-schemapath="root.description"] b span');
        if (descDiv) {
            descDiv.appendChild(autoButton);
            autoButton.removeAttribute("style");
        }
    });
}

function save() {
    var j = mainTabGroup.getValue();
    if (!j){
        return;
    }
    infoMsg.textContent = "Saving...";
    fetch(postUrl ? postUrl : '', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            redirect: 'error',
            body: JSON.stringify(j),
        })
        .then(function (response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        })
        .then(function (res) {
            if (res.type == "go") {
                window.location.href = res.to;
            } else if (res.type == "err") {
                errMsg.textContent = res.msg;
                infoMsg.textContent = "";
            } else if (res.type == "saved") {
                infoMsg.textContent = "Saved";
                errMsg.textContent = "";
                document.title = originalTitle;
                // turn button to normal, indicate nothing to save,
                // but do not disable it.
                if (document.getElementById("save1")) {
                    save2.className = "btn save gap";
                    save1.className = "btn save";
                }
                getChanges(getDocID());
            }
            changes = 0;
        })
        .catch(function (error) {
            errMsg.textContent = error + ' Try reloading the page.';
        });
    // This is a trick for brower auto completion to work
        document.getElementById('docEditor').submit();

}

function getDocID() {
    var idEditor = docEditor.getEditor('root.' + idpath);
    if (idEditor) {
        var val = idEditor.getValue();
        if (val) {
            return val;
        } else {
            return null;
        }
    }
}
function copyText(element) {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
        document.execCommand("copy");
        document.selection.empty();
        infoMsg.textContent = 'Copied JSON to clipboard';
    } else if (window.getSelection) {
        var mrange = document.createRange();
        mrange.selectNode(element);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(mrange);
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
        infoMsg.textContent = 'Copied JSON to clipboard';
    }
}
function importFile(event, elem) {
    var file = document.getElementById("importJSON");
    file.click();
}
function loadFile(event, elem) {
    var file = elem.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            loadJSON(JSON.parse(evt.target.result), null, "Imported file");
        };
        reader.onerror = function (evt) {
            errMsg.textContent = "Error reading file";
        };
    }
}
function downloadFile(event, link) {
    var j = mainTabGroup.getValue();
    if (!j){
        event.preventDefault();
        alert('JSON Validation Failure: Fix the errors before downloading')
        return false;
    }
    var file = new File([textUtil.getMITREJSON(textUtil.reduceJSON(j))], getDocID() + '.json', {
        type: "text/plain",
        lastModified: new Date()
    });
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    // trick to get autocomplete work
    document.getElementById('docEditor').submit();

}
function downloadText(element, link) {
    var j = mainTabGroup.getValue();
    if (!j){
        event.preventDefault();
        alert('JSON Validation Failure: Fix the errors before downloading.')
        return false;
    }
    var file = new File([element.textContent], getDocID() + '.json', {
        type: "text/plain",
        lastModified: new Date()
    });
    link.href = URL.createObjectURL(file);
    link.download = file.name;
}
function downloadElement(id, link) {
    var svg = document.getElementById(id);
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(svg);
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    source.replace('</svg>', '</svg><style>{font-size:22px}</style>');
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    var file = new File([source], id + '.svg', {
        type: "text/svg",
        lastModified: new Date()
    });
    link.href = URL.createObjectURL(file);
    link.download = file.name;
}