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
            if(link.id) {
                h.setAttribute('id', link.id)
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
        r.setAttribute('class', 'rbtn vgi-x');
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
        if(this.options.hide_header && this.thead) {
            if(this.thead.parentNode) {
                this.thead.parentNode.removeChild(this.thead);
            }
            this.thead = null;
        } else {
            this._removeControlsHeader();
            this._toggleHeader();
        }
        console.log(this.schema.options);
        if(this.schema && this.schema.options && this.schema.options.table_class != undefined) {
            console.log('SETTING TABLE CLASS', this.schema.options.table_class);
            this.table.className = this.schema.options.table_class;
        }
        if (this.header) {
            if(this.options.class) {
                this.header.className = 'lbl ' + this.options.class;
            }
            if(this.showStar()){
                this.header.className = this.header.className + ' req'; 
            } 
        }
        if(this.hide_delete_last_row_buttons) { this.delete_last_row_button.style.display = 'none'; }
        if(this.hide_delete_all_rows_buttons) { this.remove_all_rows_button.style.display = 'none'; }        
    }
    refreshValue() {
        super.refreshValue();
        this._toggleHeader();
    }
    _removeControlsHeader() {
        if(!this.thead) return;
        var ths = this.thead.querySelectorAll('th');
        for (var i = ths.length - 1; i >= 0; i--) {
            var th = ths[i];
            var text = th.textContent ? th.textContent.trim().toLowerCase() : '';
            if (text === 'controls' && th.parentNode) {
                th.parentNode.removeChild(th);
            }
        }
    }
    _toggleHeader() {
        var len = (Array.isArray(this.value)) ? this.value.length : 0;
        if (this.table) {
            this.table.style.display = len ? '' : 'none';
        }
        if(!this.thead) return;
        if(this.options.hide_header) {
            this.thead.style.display = 'none';
            return;
        }
        this.thead.style.display = len ? '' : 'none';
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
        setControlFormat(this.control, this.schema);
        var parsedClasses = parseOptionClasses(this.options && this.options.class);
        if(this.label && this.options.class) {
            if(parsedClasses.otherClasses.length > 0) {
                this.label.className = this.label.className + ' ' + parsedClasses.otherClasses.join(' ');
            }
            if(this.showStar()){
                this.label.className = this.label.className + ' req'; 
            }
        }
        if(parsedClasses.iconClass) {
            addTextInputIcon(this.input, parsedClasses.iconClass);
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
        setControlFormat(this.control, this.schema);
        var parsedClasses = parseOptionClasses(this.options && this.options.class);
        if(this.label && this.options.class) {
            if(parsedClasses.otherClasses.length > 0) {
                this.label.className = this.label.className + ' ' + parsedClasses.otherClasses.join(' ');
            }
            if(this.showStar()){
                this.label.className = this.label.className + ' req'; 
            }
        }
        if(parsedClasses.iconClass) {
            addTextInputIcon(this.input, parsedClasses.iconClass);
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

        if (this.schema.options && this.schema.options.infoText) {
            this.label.setAttribute('title', this.schema.options.infoText);
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
            if(this.schema.options && this.schema.options.tooltips && this.schema.options.tooltips[options[i]]) {
                label.setAttribute('title', this.schema.options.tooltips[options[i]]);
            }
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
        var tagClasses = {};
        var iconSources = [
            this.schema && this.schema.items && this.schema.items.options && this.schema.items.options.icons,
            this.schema && this.schema.options && this.schema.options.icons,
            this.options && this.options.icons
        ];
        for (var srcIdx = 0; srcIdx < iconSources.length; srcIdx++) {
            var src = iconSources[srcIdx];
            if (src && typeof src === 'object') {
                Object.keys(src).forEach(function (key) {
                    tagClasses[key] = src[key];
                });
            }
        }
        if (!Object.keys(tagClasses).length) {
            tagClasses = null;
        }
        //console.log('list'+ this.schema.items.examples);
        this.tagify = new Tagify(this.input, {
            whitelist: this.schema.items.enum ? this.schema.items.enum : (this.schema.items.examples ? this.schema.items.examples : []),
            enforceWhitelist: this.schema.items.enum ? true : false,
            maxTags: this.schema.maxItems ? this.schema.maxItems : 512,
            transformTag: function(tagData) {
                if (!tagClasses || !tagData || tagData.value === null || tagData.value === undefined) return;

                var tagValue = String(tagData.value);
                var mappedClass = tagClasses[tagValue];
                if (typeof mappedClass !== 'string' || !mappedClass.trim()) return;

                var existingClasses = [];
                if (typeof tagData.class === 'string' && tagData.class.trim()) {
                    existingClasses = tagData.class.trim().split(/\s+/);
                }
                var mappedClasses = mappedClass.trim().split(/\s+/).map(function (cls) {
                    if (!cls) return cls;
                    // `options.icons` values are icon keys; normalize to CSS classes used in this app.
                    if (cls.indexOf(iconTheme) === 0) return cls;
                    return iconTheme + cls;
                });
                var mergedClasses = [];
                var seen = {};
                var i;

                for (i = 0; i < existingClasses.length; i++) {
                    if (!existingClasses[i] || seen[existingClasses[i]]) continue;
                    seen[existingClasses[i]] = true;
                    mergedClasses.push(existingClasses[i]);
                }
                for (i = 0; i < mappedClasses.length; i++) {
                    if (!mappedClasses[i] || seen[mappedClasses[i]]) continue;
                    seen[mappedClasses[i]] = true;
                    mergedClasses.push(mappedClasses[i]);
                }

                if (mergedClasses.length) {
                    tagData.class = mergedClasses.join(' ');
                }
            },
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
        if (this.simpleHtml) {
            ret = this.simpleHtml.getValue();
        }
        return ret;
    }

    setValue (value,initial,from_template) {
        super.setValue(value,initial,from_template);
        if (this.simpleHtml) {
            var nextValue = value == null ? '' : value;
            var priorVal = this.simpleHtml.getValue();
            this.simpleHtml.setValue(nextValue);
            var currentVal = this.simpleHtml.getValue();
            if (priorVal !== currentVal) {
                this.value = this.input.value = currentVal;
                this.onChange(true);
            }
        }
    }
    build() {
        this.schema.format = this.format = 'hidden';
        super.build();
        if(this.label && this.options.class) {
            this.label.className = this.label.className + ' ' + this.options.class;
            if(this.showStar()){
                this.label.className = this.label.className + ' req'; 
            }
        }
        this.control.className = 'simplehtml form-control';
        this.simpleHtmlHost = document.createElement('div');
        this.simpleHtmlHost.className = 'simplehtml-editor';
        this.input.parentNode.appendChild(this.simpleHtmlHost);
    }
    afterInputReady () {
        var self = this;
        var placeholder = (this.options && this.options.inputAttributes && this.options.inputAttributes.placeholder) ||
            (this.schema && this.schema.placeholder) || '';
        var options = {
            content: this.input.value || ''
        };
        if (placeholder) {
            options.placeholder = placeholder;
        }
        this.simpleHtml = new SimpleHtml(this.simpleHtmlHost, options);

        var syncValue = function () {
            var current = self.simpleHtml.getValue();
            if (current !== self.input.value) {
                self.value = self.input.value = current;
                self.is_dirty = true;
                self.onChange(true);
            }
        };

        this.simpleHtml.contentArea.addEventListener('input', syncValue);
        this.simpleHtml.sourceArea.addEventListener('input', syncValue);
        this.simpleHtml.contentArea.addEventListener('blur', syncValue);
        this.simpleHtml.sourceArea.addEventListener('blur', syncValue);

        var cleaned = this.simpleHtml.getValue();
        if (cleaned !== this.input.value) {
            this.value = this.input.value = cleaned;
        }
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
      delete: 'x',
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
        el.className = 'nobor';
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
            input.errmsg.setAttribute('class', 'lbl tred');
            input.errmsg.textContent = '';
            input.errmsg.appendChild(document.createTextNode(' ' + text));
        }
        if(input.errmsg) {
            input.errmsg.setAttribute('class', 'lbl tred');
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

export {
    uid,
    tzOffset,
    localTZ,
    iconMapping,
    docEditorOptions,
    docEditor
};
