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
var iconTheme = 'vgi-';
var starting_value = {};
var sourceEditor;

JSONEditor.defaults.languages.en.error_oneOf = "Please fill in the required fields *";

JSONEditor.AbstractEditor.prototype.showStar = function () {
    return this.isRequired() && !(this.schema.readOnly || this.schema.readonly || this.schema.template)
}

JSONEditor.AbstractEditor.prototype.addLinks = function () {
    /* Add links */
    if (!this.no_link_holder) {
      this.link_holder = this.theme.getLinksHolder()
      /* if description element exists, insert the link before */
      if (typeof this.description !== 'undefined') this.description.parentNode.insertBefore(this.link_holder, this.description)
      /* otherwise just insert link at bottom of container */
      else this.container.appendChild(this.link_holder)
      if (this.schema.links) {
        for (let i = 0; i < this.schema.links.length; i++) {
            var link = this.schema.links[i];
            //todo: refactor
            var style = null;
            if(link.class) {
                style=link.class;
                delete link.class;
            }
            var h = this.getLink(link);
            if(style) {
                    h.setAttribute('class', style);
                    h.removeAttribute('style')
            }
            if(link.style) {
                h.setAttribute('style', link.style);
            }
            if(link.title) {
                h.setAttribute('title', link.title);
            }
            if(link.target === false) {
                h.removeAttribute('target')
            } else {
                h.setAttribute('target', link.target)
            }
            if(link.onclick) {
                h.setAttribute('onclick', link.onclick);
            }
            if(link.place == "container" && this.container) {
                this.container.appendChild(h);
            } else if (link.place == "header" && this.header) {
                this.header.appendChild(h);
            } else {
                this.addLink(h)
            }
        }
      }
    }
  }

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === "string" && schema.format === "radio") {
        return "radio";
    }
});

JSONEditor.defaults.templates.custom = function () {
    return {
        compile: function (template) {
            return function (context) {
                // context contains values of watched fields.
                // XXX: careful with remote JSON schemas.
                var ret = eval(template);
                return ret;
            };
        }
    };
};

JSONEditor.defaults.editors.array = class mystring extends JSONEditor.defaults.editors.array {
    build() {
        super.build();
        if (this.header) {
            if(this.options.class) {
                this.header.className = 'lbl ' + this.options.class;
            }
            if(this.showStar()){
                this.header.className = this.header.className + ' req'; 
            }
        }
    }
    /* move the delete button next to object title */
    _createDeleteButton (i, holder) {
        var r = super._createDeleteButton(i, holder);
        r.setAttribute('class', 'sbn vgi-cancel');
        r.innerHTML = '';
        r.parentNode.setAttribute("vg","obj-del");
        if(!this.options.disable_array_add) {
            r.parentNode.parentNode.setAttribute("vg","array-obj");
        }
        return r;
    }
}

JSONEditor.defaults.editors.table = class mystring extends JSONEditor.defaults.editors.table {
    build() {
        super.build();
        if (this.header) {
            if(this.options.class) {
                this.header.className = 'lbl ' + this.options.class;
            }
            if(this.showStar()){
                this.header.className = this.header.className + ' req'; 
            } 
        }
    }
}

JSONEditor.defaults.editors.object = class mystring extends JSONEditor.defaults.editors.object {
    build() {
        super.build();
        if (this.title) {
            if(this.options.class) {
                this.title.className = this.title.className + ' ' + this.options.class;
            }
            if(this.showStar()){
                this.title.className = this.title.className + ' req'; 
            }    
        }
        if(this.container && this.options.containerClass) {
            this.container.className = this.container.className + ' ' + this.options.containerClass;
        }
    }
    getValue () {
        if (!this.dependenciesFulfilled) {
          return undefined
        }
        const result = this.value;
        const isEmpty = obj => typeof obj === 'undefined' || obj === '' ||
        (
          obj === Object(obj) &&
          Object.keys(obj).length === 0 &&
          obj.constructor === Object
        ) || (Array.isArray(obj) && obj.length === 0)
        if (result && (this.jsoneditor.options.remove_empty_properties || this.options.remove_empty_properties)) {
          Object.keys(result).forEach(key => {
            var req = (Array.isArray(this.schema.required)) && this.schema.required.includes(key);
            if (isEmpty(result[key]) && !req) {
              delete result[key]
            }
          })
        }
        return result
    }
}

JSONEditor.defaults.editors.number = class mystring extends JSONEditor.defaults.editors.number {
    build() {
        super.build();
        if(this.label && this.options.class) {
            this.label.className = this.label.className + ' ' + this.options.class;
            if(this.showStar()){
                this.label.className = this.label.className + ' req'; 
            }
        }
        if(this.options.formClass) {
            this.control.className = this.control.className + ' ' + this.options.formClass;
        }
        //Use html5 datalist to show examples 
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
            this.input.type='search';
            this.container.appendChild(dlist);
        }
    }
}

JSONEditor.defaults.editors.string = class mystring extends JSONEditor.defaults.editors.string {

    build() {
        super.build();
        if(this.label && this.options.class) {
            this.label.className = this.label.className + ' ' + this.options.class;
            if(this.showStar()){
                this.label.className = this.label.className + ' req'; 
            }
        }
        if(this.options.formClass) {
            this.control.className = this.control.className + ' ' + this.options.formClass;
        }
        //Use html5 datalist to show examples 
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
            this.input.type='search';
            this.container.appendChild(dlist);
        }
    }
};

//use for unique Idenifiers for an element's id attributes
var uid = 1;

JSONEditor.defaults.editors.radio = class radio extends JSONEditor.AbstractEditor {
    setValue(value, initial) {
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
    }
    register() {
        super.register();
        if (!this.inputs) return;
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].setAttribute('name', this.formname);
        }
    }
    unregister(){
        super.unregister();
        if (!this.inputs) return;
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].removeAttribute('name');
        }
    }
    getNumColumns() {
        var longest_text = this.getTitle().length;
        for (var i = 0; i < this.schema.enum.length; i++) {
            longest_text = Math.max(longest_text, this.schema.enum[i].length + 4);
        }
        return Math.min(12, Math.max(longest_text / 7, 2));
    }
    typecast(value) {
        if (this.schema.type === "boolean") {
            return !!value;
        } else if (this.schema.type === "number") {
            return 1 * value;
        } else if (this.schema.type === "integer") {
            return Math.floor(value * 1);
        } else {
            return "" + value;
        }
    }
    getValue() {
        return this.value;
    }
    removeProperty() {
        super.removeProperty();
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].style.display = 'none';
        }
        if (this.description) this.description.style.display = 'none';
        this.theme.disableLabel(this.label);
    }
    addProperty() {
        super.addProperty();
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].style.display = '';
        }
        if (this.description) this.description.style.display = '';
        this.theme.enableLabel(this.label);
    }
    sanitize(value) {
        if (this.schema.type === "number") {
            return 1 * value;
        } else if (this.schema.type === "integer") {
            return Math.floor(value * 1);
        } else {
            return "" + value;
        }
    }
    build() {
        var self = this,
            i;
        if (!this.options.compact) {
            this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
        }
        if(this.label && this.options.class) {
            this.label.className = this.label.className + ' ' + this.options.class;
            if(this.showStar()){
                this.label.className = this.label.className + ' req'; 
            }
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
            var xid = uid++;
            this.inputs[options[i]].setAttribute('id', xid);
            var label = this.theme.getRadioLabel((this.schema.options && this.schema.options.enum_titles && this.schema.options.enum_titles[i]) ?
                this.schema.options.enum_titles[i] :
                options[i]);
            label.setAttribute('for', xid);
            var rdicon = null;
            if(this.options.icons && this.options.icons[options[i]]) {
                rdicon = this.options.icons[options[i]];
            } else if (iconMap[options[i]]) {
                rdicon = iconMap[options[i]];
            }
            label.setAttribute('class', 'lbl' + (rdicon ? ' ' + iconTheme + rdicon  : ''));
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
    }
    enable() {
        if (!this.always_disabled) {
            var opts = Object.keys(this.inputs);
            for (var i = 0; i < opts.length; i++) {
                this.inputs[opts[i]].disabled = false;
            }
        }
        super.enable();
    }
    disable() {
        //console.log(this.inputs);
        var opts = Object.keys(this.inputs);
        for (var i = 0; i < opts.length; i++) {
            this.inputs[opts[i]].disabled = true;
        }
        super.disable();
    }
    destroy() {
        if (this.label) this.label.parentNode.removeChild(this.label);
        if (this.description) this.description.parentNode.removeChild(this.description);
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].parentNode.removeChild(this.inputs[i]);
        }
        super.destroy();
    }
};

function tzOffset(x) {
    var offset = new Date(x).getTimezoneOffset(),
        o = Math.abs(offset);
    return (offset < 0 ? "+" : "-") + ("00" + Math.floor(o / 60)).slice(-2) + ":" + ("00" + (o % 60)).slice(-2);
}

// The time is displayed/set in local times in the input,
//  but setValue, getValue use UTC. JSON output will be in UTC.
const localTZ = (new Date).toLocaleString("en", {timeZoneName: "short"}).split(" ").pop();
JSONEditor.defaults.editors.dateTime = class dateTime extends JSONEditor.defaults.editors.string{
    getValue() {
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
    }
    setValue(val) {
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
    }
    build() {
        this.schema.format = "datetime-local";
        super.build();
        this.input.className = "txt";
        this.input.setAttribute("tz", localTZ);
    }
};


JSONEditor.defaults.editors.taglist = class taglist extends JSONEditor.defaults.editors.string {
    getValue() {
        if(this.tagify && this.tagify.value) {
            return this.tagify.value.map(item => item.value);
        } else {
            return [];
        }
    }
    setValue(val) {
        if (val instanceof Array) {
            this.tagify.removeAllTags();
            this.tagify.addTags(val);
        } else {
            this.tagify.addTags(val.split(','));
        }
        this.onChange(true);
    }
    build() {
        this.schema.format = "taglist";
        super.build();
        //console.log('list'+ this.schema.items.examples);
        this.tagify = new Tagify(this.input, {
            whitelist: this.schema.items.enum ? this.schema.items.enum : (this.schema.items.examples ? this.schema.items.examples : []),
            enforceWhitelist: this.schema.items.enum ? true : false,
            maxTags: this.schema.maxItems ? this.schema.maxItems : 512,
            dropdown: {
              maxItems: 40,           // <- mixumum allowed rendered suggestions
              classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
              enabled: 0,             // <- show suggestions on focus
              closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
            }
          })
        if(this.options && this.options.inputAttributes && this.options.inputAttributes.placeholder) {
            this.input.setAttribute('placeholder', this.options.inputAttributes.placeholder)
        }
    }
};

JSONEditor.defaults.editors.simplehtml = class simplehtml extends JSONEditor.defaults.editors.string {
    getValue() {
        var ret = super.getValue();
        if(this.wysLoaded) {
            ret = this.wys.getValue();
        }
        return ret;
    }

    setValue (value,initial,from_template) {
        super.setValue(value,initial,from_template);
        if (this.wysLoaded) {
            // get current value from HTML editor
            var priorVal = this.wys.getValue();

            // set the new value (and let HTML editor perform DOM sanitization)
            this.wys.setValue(value);

            // get the new value from the HTML editor
            var currentVal = this.wys.getValue();

            // if they are different trigger a change event.
            if(priorVal != currentVal) {
                this.input.value = currentVal;
                this.onChange(true);
            }
        } else {
        }
   }
    build() {
        this.schema.format = this.format = 'hidden';
//        this.schema.format = "simplehtml";
        super.build();
        if(this.label && this.options.class) {
            this.label.className = this.label.className + ' ' + this.options.class;
            if(this.showStar()){
                this.label.className = this.label.className + ' req'; 
            }
        }
        this.control.className = 'simplehtml form-control bor';
        this.toolbar = document.createElement('div');
        this.toolbar.innerHTML = '<div class="toolbar"><div><span class="btg indent"><a class="sbn vgi-bold" data-wysihtml5-command="bold" title="Bold CTRL+B" href="javascript:;" unselectable="on"></a><a class="sbn vgi-italic" data-wysihtml5-command="italic" title="Italic CTRL+I" href="javascript:;" unselectable="on"></a><a class="sbn vgi-underline" data-wysihtml5-command="underline" title="Underline CTRL+U" href="javascript:;" unselectable="on"></a><a class="sbn vgi-highlight" data-wysihtml5-command="bgColorStyle" title="highlight" color="#666699" data-wysihtml5-command-value="#effa66" href="javascript:;" unselectable="on"></a><!-- <a class="fbn icn strikethrough" data-wysihtml5-command="strike" title="Strike"></a>--></span><span class="btg indent"><a class="sbn vgi-p" data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="p" title="paragraph style" href="javascript:;" unselectable="on"></a><a class="sbn vgi-h1" data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h1" title="Heading 1" href="javascript:;" unselectable="on"></a><a class="sbn vgi-h2" data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h2" title="Heading 2" href="javascript:;" unselectable="on"></a><a class="sbn vgi-h3" data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h3" title="Heading 3" href="javascript:;" unselectable="on"></a><a class="sbn vgi-noformat" data-wysihtml5-command="formatBlock" data-wysihtml5-command-blank-value="true" unselectable="on" title="Clear styles" href="javascript:;"></a></span><span class="btg indent"><a class="sbn vgi-link" data-wysihtml5-command="createLink" title="Hyperlink" href="javascript:;" unselectable="on"></a><a class="sbn vgi-unlink" data-wysihtml5-command="removeLink" title="Unlink" href="javascript:;" unselectable="on"></a><a class="sbn vgi-pic" data-wysihtml5-command="insertImage" title="Insert image" href="javascript:;" unselectable="on"></a><a class="sbn vgi-console" data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="tt" title="Code text" href="javascript:;" unselectable="on"></a><a class="sbn vgi-quote" data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="blockquote" title="Block quote" href="javascript:;" unselectable="on"></a><a class="sbn vgi-table" data-wysihtml5-command="createTable" title="Insert Table" href="javascript:;" unselectable="on"></a></span><span class="btg indent"><a class="sbn vgi-bullet" data-wysihtml5-command="insertUnorderedList" title="Bulletted list" href="javascript:;" unselectable="on"></a><a class="sbn vgi-numbered" data-wysihtml5-command="insertOrderedList" title="Numbered list" href="javascript:;" unselectable="on"></a></span><span class="btg indent"><a class="sbn vgi-undo" data-wysihtml5-command="undo" title="Undo" href="javascript:;" unselectable="on"></a><a class="sbn vgi-redo" data-wysihtml5-command="redo" title="Redo" href="javascript:;" unselectable="on"></a><a class="sbn vgi-markup" data-wysihtml5-action="change_view" title="HTML source view" href="javascript:;" unselectable="on"></a></span><span class="btg indent" data-wysihtml5-hiddentools="table" style="display: none;"><a class="sbn vgi-add-row-top" data-wysihtml5-command="addTableCells" data-wysihtml5-command-value="above" title="Insert row above" href="javascript:;" unselectable="on"></a><a class="sbn vgi-add-row-down" data-wysihtml5-command="addTableCells" data-wysihtml5-command-value="below" title="Insert row below" href="javascript:;" unselectable="on"></a><a class="sbn vgi-add-col-left" data-wysihtml5-command="addTableCells" data-wysihtml5-command-value="before" title="Insert column before" href="javascript:;" unselectable="on"></a><a class="sbn vgi-add-col-right" data-wysihtml5-command="addTableCells" data-wysihtml5-command-value="after" title="Insert column after" href="javascript:;" unselectable="on"></a><a class="sbn vgi-row-red" data-wysihtml5-command="deleteTableCells" data-wysihtml5-command-value="row" title="Delete row" href="javascript:;" unselectable="on"></a><a class="sbn vgi-col-red" data-wysihtml5-command="deleteTableCells" data-wysihtml5-command-value="column" title="Delete column" href="javascript:;" unselectable="on"></a></span></div><div data-wysihtml5-dialog="createLink" style="display: none;"><label class="lbl sml vgi-link">Link: </label><input class="vgi-text" size="90" data-wysihtml5-dialog-field="href" value="https://" title="URL"><a class="btn vgi-ext" onclick="window.open(this.previousElementSibling.value)">Open</a><a class="btn indent vgi-ok" data-wysihtml5-dialog-action="save">OK</a><a class="btn vgi-cancel" data-wysihtml5-dialog-action="cancel">Cancel</a></div><div data-wysihtml5-dialog="insertImage" style="display: none;"><label class="lbl vgi-link">URL</label><input class="vgi-txt" data-wysihtml5-dialog-field="src" size="50" value="https://"><label class="lbl">or</label><label class="btn vgi-folder" title="Browse for local images to insert">Insert Image ..<input class="hid" type="file" onchange="loadimg.call(this, event)" accept="image/*"></label><a class="btn indent vgi-ok" data-wysihtml5-dialog-action="save">OK</a><a class="btn vgi-cancel" data-wysihtml5-dialog-action="cancel">Cancel</a></div><div data-wysihtml5-dialog="createTable" style="display: none;"><label class="vgi-table lbl">Rows: </label><input class="txt" type="text" data-wysihtml5-dialog-field="rows"><label class="lbl">Cols: </label><input class="txt" type="text" data-wysihtml5-dialog-field="cols"><a class="btn vgi-ok indent" data-wysihtml5-dialog-action="save">OK</a><a class="btn vgi-cancel" data-wysihtml5-dialog-action="cancel">Cancel</a></div></div>'
        //document.getElementById('commentTemplate')?.getElementsByClassName('toolbar')[0].cloneNode(true);
        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'pur ht4 fil';
        if (this.toolbar) {
            this.toolbar.className = 'fil shd wht stk toolbar';
            this.input.parentNode.insertBefore(this.toolbar, this.input);
        }
        this.input.parentNode.appendChild(this.contentDiv);
    }
    afterInputReady () {
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
    }
    showValidationErrors(errs) {
        var self = this;

        if(this.jsoneditor.options.show_errors === "always") {}
        else if(!this.is_dirty && this.previous_error_setting===this.jsoneditor.options.show_errors) return;
        
        this.previous_error_setting = this.jsoneditor.options.show_errors;
    
        var messages = [];
        errs.forEach(i => {
            if(i.path === self.path) {
                messages.push(i.message);
            }
        });    
        if(messages.length) {
          this.theme.addInputError(this.control, messages.join('. ')+'.');
        }
        else {
          this.theme.removeInputError(this.control);
        }
    }
};

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
/*
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
*/

var iconMapping = {
    collapse: 'down',
      expand: 'add',
      delete: 'cancel',
      edit: 'edit',
      add: 'add',
      cancel: 'cancel',
      save: 'save',
      moveup: 'up',
      movedown: 'down'
};

JSONEditor.defaults.iconlibs.vgi = class CustomIconLib extends JSONEditor.AbstractIconLib {
    constructor () {
      super();
      this.mapping = iconMapping;
      this.icon_prefix = 'vgi-';
    }
  }

JSONEditor.defaults.options.iconlib = 'vgi';

JSONEditor.defaults.themes.customTheme = class customTheme extends JSONEditor.AbstractTheme{
    getBlockLink() {
        var link = document.createElement('a');
        return link;
    }
    getLinksHolder() {
            var el = document.createElement('span');
            return el;
      }
    getDescription (text) {
        var el = document.createElement('summary');
        return el;
    }
  getFormControl(label, input, description, infoText) {
      var el = super.getFormControl(label, input, description, infoText);
      if(input.type =='text')
        input.className = 'txt';
      return el;
  }
    getFormInputLabel(text) {
        var el = super.getFormInputLabel(text);
        el.className = 'lbl' + (iconMap[text]? ' ' + iconTheme + iconMap[text] : '');
        return el;
    }
  /*  getIndentedPanel() {
        var el = super.getIndentedPanel();
    //    el.classList.add("indent");
        return el;
    }*/
    getHeader(text) {
        var el = document.createElement('span');
        if (typeof text === "string") {
            el.textContent = text;
            if(iconMap[text])
                el.className =  iconTheme + iconMap[text];
        } else {
            if(iconMap[text.textContent])
                text.className = iconTheme + iconMap[text.textContent];
            el.appendChild(text);
        }
        return el;
    }
    getTable() {
        var el = super.getTable();
        el.className = 'tbl';
        return el;
    }
    getTableHeaderCell (text) {
            const el = document.createElement('b')
            if(this.options && this.options.class) {
                el.className = this.options.class
            } else if(iconMap[text]) {
                el.className = iconTheme + iconMap[text];
            }
            el.textContent = text == ' ' ? '': text;
            const t = document.createElement('th');
            t.appendChild(el);
            return t
    }
    getButton(text, icon, title) {
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'btn';
        this.setButtonText(el,text,icon,title);
        return el;
    }
    addInputError(input, text) {
        try {
            input.setCustomValidity(text);
            input.onfocus = function(){ this.reportValidity(); }
            input.oninput = function(){ this.setAttribute("novalidate", true); this.setCustomValidity('')}
        } catch(e) {}
        input.style.boxShadow = "0px 0px 0px 2px rgba(252, 114, 114, 0.33)";        
        input.style.border = "1px solid coral";
        if(text && text != 'Value required.') {
            if (!input.errmsg) {
                var group = this.closest(input, '.form-control');
               /* var label = group.getElementsByClassName('lbl');
                if(label && label[0]){
                    group = label[0];
                }*/
                input.errmsg = document.createElement('div');
                //input.errmsg.setAttribute('class', 'lbl tred indent');
                input.errmsg.style = input.errmsg.style || {};
                group.appendChild(input.errmsg);
            } else {
                input.errmsg.style.display = 'block';
            }
            input.errmsg.setAttribute('class', 'lbl tred indent');
            input.errmsg.textContent = '';
            input.errmsg.appendChild(document.createTextNode(' ' + text));
        }
        if(input.errmsg) {
            input.errmsg.setAttribute('class', 'lbl tred indent');
        }
    }
    removeInputError(input) {
        try{
        input.setCustomValidity('');
        } catch(e) {}
        input.style.border = '';
        input.style.boxShadow = '';
        if (input.errmsg) input.errmsg.style.display = 'none';
    }
    getRadio() {
        var el = this.getFormInputField('radio');
        return el;
    }
    getRadioGroupHolder(controls, label, description) {
        var el = document.createElement('div');
        var radioGroup = document.createElement('div');
        radioGroup.className = 'rdg';

        if (label) {
            el.appendChild(label);
        }
        el.appendChild(radioGroup);
        for (var i in controls) {
            if (!controls.hasOwnProperty(i)) continue;
            radioGroup.appendChild(controls[i]);
        }

        if (description) el.appendChild(description);
        return el;
    }
    getRadioLabel(text) {
        var el = this.getFormInputLabel(text);
        return el;
    }
    getProgressBar() {
        var max = 100,
            start = 0;

        var progressBar = document.createElement('progress');
        progressBar.setAttribute('max', max);
        progressBar.setAttribute('value', start);
        return progressBar;
    }
    updateProgressBar(progressBar, progress) {
        if (!progressBar) return;
        progressBar.setAttribute('value', progress);
    }
    updateProgressBarUnknown(progressBar) {
        if (!progressBar) return;
        progressBar.removeAttribute('value');
    }
    /*getSelectInput(options) {
        var select = document.createElement('select');
        //select.className = 'txt';
        if(options)     this.setSelectOptions(select, options);
        return select;
    }*/
    setGridColumnSize(el, size) {
      el.className = el.className + ' col s' + size;
    } 
    getSwitcher (options) {
        const switcher = this.getSelectInput(options, false);
        switcher.classList.add('je-switcher');
        if(! /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            switcher.classList.add('rdg');
            switcher.setAttribute('size',2);
        }
        return switcher
    }
};

JSONEditor.defaults.themes.customTheme.rules = {};

if (typeof(custom_validators) !== 'undefined'){
    JSONEditor.defaults.custom_validators = custom_validators;
}

var docEditorOptions = {
    // Enable fetching schemas via ajax
    ajax: allowAjax,
    theme: 'customTheme',
    show_errors: 'always',
    disable_collapse: true,
    disable_array_reorder: true,
    disable_properties: true,
    disable_edit_json: true,
    disable_array_delete_last_row: true,
    disable_array_delete_all_rows: true,
    input_width: '3em',
    input_height: '4em',
    template: 'custom',
    prompt_before_delete: false,
    ajaxBase: ajaxBase,
    schema: docSchema,
    // Seed the form with a starting value
    //starting_value: {},

    // Disable additional properties
    //no_additional_properties: false,

    // Require all properties by default
    //required_by_default: false,
    remove_empty_properties: true
    //display_required_only: true
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
        //errMsg.textContent = "";
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
        //console.log('Seting tab '+index+ ' + ' + tg.tabId[index] + "="+JSON.stringify(tg.tabOpts));
        if(tg.tabOpts[tg.tabId[index]] && tg.tabOpts[tg.tabId[index]].setValue) {
            //console.log('tab INDEX',tg.tabId);
            return tg.tabOpts[tg.tabId[index]].setValue(val);
        }
    }
    tg.focus = function(index) {
        if (!insync) {
            if(tg.tabs[index]) {
                tg.tabs[index].checked = true;
                tg.tabs[index].dispatchEvent(new Event('change'));
            } else {
                console.log('no tab');
            }
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
                save1.className = "fbn sfe save";
            }
            //console.log('Inc '+ tg.tabId[index] + ' is ' + tg.changeIndex[index]);
        }
    }
    return tg;
};

var originalTitle = document.title;
var changes = true;

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
                    showAlert("Error " + response.statusText);
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

function scroll2Err(x) {
    var path = x.getAttribute('e_path');
    mainTabGroup.focus(0);
    if(path) {
        if(!path.startsWith('root.')) {
            path = 'root.' + path;
        }
        var ee = docEditor.getEditor(path);
        if(ee && ee.container) {
            var stkH = document.getElementById("vgHead").offsetHeight;
            ee.container.style["scroll-margin-top"] = (stkH + 40) + "px";
            ee.container.scrollIntoView({behavior:"smooth"});
            x.closest('details').removeAttribute('open');
        }
    }
}

function showJSONerrors(errors) {
    errList.textContent="";
    for (i = 0;i < errors.length; i++) {
        var e = errors[i];
        var showLabel = undefined;
        var ee = docEditor.getEditor('root.'+e.path);
        if (ee && ee.header && ee.header.innerText) {
            showLabel = ee.header.innerText;
        }
        var a = document.createElement('a');
        a.setAttribute('class', 'vgi-alert')
        a.setAttribute('e_path', e.path);
        a.setAttribute('onclick', 'scroll2Err(this)');
        a.textContent = (showLabel && showLabel.trim() ? showLabel : e.path) + ": " + e.message;
        errList.appendChild(a);
        errList.appendChild(document.createElement('br'))
    }
    errCount.className = 'indent bdg';
    errPop.className = 'popup';
    errCount.innerText = errors.length;
    editorLabel.className = "red lbl";
}

function hideJSONerrors() {
    errCount.innerText = "";
    errPop.className = 'hid';
    errList.textContent = "";
    editorLabel.className = "lbl";
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
            if (typeof(errorFilter) !== 'undefined'){
                errors = errorFilter(errors);
            }
            if (errors.length > 0) {
                docEditor.setOption('show_errors', 'always');
                showJSONerrors(errors);
                return 0;
            } else {
                hideJSONerrors();
                return 1;
            }
        }
    },
    sourceTab: {
        setValue: function (val) {
            if (sourceEditor == undefined) {
                ace.config.set('basePath', '/js/')
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
                    showAlert('Please fix error: ' + firsterror.text);
                    errMsg.textContent = 'Please fix error: ' + firsterror.text;
                    document.getElementById("sourceTab").checked = true;
                    return -1;
                }
            } catch (err) {
                showAlert(err.message);
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

function loadJSON(res, id, message, editorOptions) {
    // workaround for JSON Editor issue with clearing arrays
    // https://github.com/jdorn/json-editor/issues/617
    if (docEditor) {
        docEditor.destroy();
    }
    docEditor = new JSONEditor(document.getElementById('docEditor'), editorOptions ? editorOptions : docEditorOptions);
    docEditor.on('ready', async function () {
        await docEditor.root.setValue(res, true);
        infoMsg.textContent = message ? message : '';
        //errMsg.textContent = "";
        if(id) {
            document.title = id;
        } else {
            var nid =  getDocID();
            document.title = nid ? nid : 'Vulnogram';
        }
        if (document.getElementById("save1")) {
            save2.className = "btn sfe gap";
            save1.className = "fbn sfe";
        }
        if (message) {
            selected = "editorTab";
        }
        docEditor.watch('root', function(){
            mainTabGroup.change(0);
        });
        docEditor.on('change', async function(){
            var errors = [];
            if(docEditor.validation_results && docEditor.validation_results.length > 0) {
                if (typeof(errorFilter) !== 'undefined'){
                    errors = errorFilter(docEditor.validation_results);
                } else {
                    errors = docEditor.validation_results;
                }
            }
            if(errors.length > 0) {
                showJSONerrors(errors);
            } else {
                hideJSONerrors();
            }
        });
        editorLabel.className = "lbl";
        postUrl = getDocID() ? './' + getDocID() : "./new";

        document.getElementById(selected).checked = true;
        var event = new Event('change');
        //document.getElementById(selected).dispatchEvent(event);
        setTimeout(function (){
            document.getElementById(selected).dispatchEvent(event);
        }, 50);
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
                showAlert(res.msg);
                errMsg.textContent = res.msg;
                infoMsg.textContent = "";
            } else if (res.type == "saved") {
                infoMsg.textContent = "Saved";
                errMsg.textContent = "";
                document.title = originalTitle;
                // turn button to normal, indicate nothing to save,
                // but do not disable it.
                if (document.getElementById("save1")) {
                    save2.className = "btn sfe gap";
                    save1.className = "fbn sfe";
                }
                getChanges(getDocID());
            }
            changes = 0;
        })
        .catch(function (error) {
            showAlert(error + ' Try reloading the page.');
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
            showAlert("Error reading file");
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
function downloadHtml(title, element, link) {
    var file = new File([
            '<html><head><title>'
            + title
            + '</title><style>body{font-family:"Helvetica"; margin:3em}</style><body>'
            + element.innerHTML
            + '</body></html>'
        ], getDocID() + '.html', {
        type: "text/html",
        lastModified: new Date()
    });
    link.href = URL.createObjectURL(file);
    link.download = file.name;
}

function showAlert(msg, smallmsg, timer, showCancel) {
    errMsg.textContent="";
    infoMsg.textContent="";
    if (showCancel) {
        document.getElementById("alertCancel").style.display = "inline-block";
    } else {
        var temp1 = document.getElementById("alertOk");
        temp1.setAttribute("onclick", "document.getElementById('alertDialog').close();");
        document.getElementById("alertCancel").style.display = "none";
    }
    document.getElementById("alertMessage").innerText = msg;
    if (smallmsg)
        document.getElementById("smallAlert").innerText = smallmsg;
    else
        document.getElementById("smallAlert").innerText = " ";
    if (!document.getElementById("alertDialog").hasAttribute("open"))
        document.getElementById("alertDialog").showModal();
    if (timer)
        setTimeout(function () {
            document.getElementById("alertDialog").close();
        }, timer);
}