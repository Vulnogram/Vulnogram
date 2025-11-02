async function preloadCve() {
    try {
        await initCsClient();
    } catch (e) {
        //portalErrorHandler(e);
    }
}
preloadCve();

document.getElementById('post1').addEventListener('click', cvePost);
var publicEditorOption = cloneJSON(docEditorOptions);
Object.assign(publicEditorOption.schema, docSchema.oneOf[0]);
delete publicEditorOption.schema.oneOf;

var rejectEditorOption = cloneJSON(docEditorOptions);
Object.assign(rejectEditorOption.schema, docSchema.oneOf[1]);
delete rejectEditorOption.schema.oneOf;

if (initJSON && initJSON.cveMetadata && initJSON.cveMetadata.state == 'REJECTED') {
    docEditorOptions = rejectEditorOption;
} else {
    docEditorOptions = publicEditorOption;
}

// make sure all starting and ending spaces in strings are trimmed 
JSONEditor.defaults.editors.string.prototype.sanitize = function(value) {
    if(value)
        return value.trim();
    return value;
  }; 

  JSONEditor.defaults.editors.CPEA = class CPEA extends JSONEditor.AbstractEditor {
    setValue(value, initial, notify) {
        var changed = (this.getValue() !== value);
        if (changed) {
            super.setValue(value, initial);
            if (this.container) {
                this.container.innerHTML = pugRender({
                    renderTemplate: 'cpeApplicability',
                    doc: value
                })
            }
            if(notify)
                this.onChange(true);
        }
    }
    register() {
        super.register();
    }
    unregister(){
        super.unregister();
    }
    getValue() {
        return this.value;
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
        if (this.value) {
            this.container.innerHTML = pugRender({
                renderTemplate: 'cpeApplicability',
                doc: this.value
            })
        }
        if (this.schema.template && (localStorage.getItem('autoCPEChk') === 'true')) {
            const callback = this.expandCallbacks('template', { template: this.schema.template })
            if (typeof callback.template === 'function') this.template = callback.template
            else this.template = this.jsoneditor.compileTemplate(this.schema.template, this.template_engine)
            this.refreshValue()
        } else {
            this.refreshValue()
        }
    }
    enable() {
        super.enable();
    }
    disable() {
        super.disable();
    }
    destroy() {
        /*if (this.label) this.label.parentNode.removeChild(this.label);
        if (this.description) this.description.parentNode.removeChild(this.description);*/
        super.destroy();
    }
    onWatchedFieldChange () {
        let vars
        // If this editor needs to be rendered by a macro template 
        if (this.template && ((localStorage.getItem('autoCPEChk') === 'true'))) {
          vars = this.getWatchedFieldValues()
          var val = this.template(vars);
          this.setValue(val, false, false)
        }
        super.onWatchedFieldChange()
    }
};

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.format === "CPEA") {
        return "CPEA";
    }
});

class ssvcOpts extends JSONEditor.defaults.editors.array {
    setValue(value) {
        this.value = value;
        if (value && value.length > 0) {
            value.forEach(sm => {
                var m = Object.keys(sm)[0];
                if (m && this.editorMap[m]) {
                    this.editorMap[m].setValue(sm[m]);
                }
            });
        }
        console.log(value);
    }

    getValue() {
        console.log('called getValue');
        var ret = [];
        if (this.editorMap) {
            for (const key in this.editorMap) {
                if (this.editorMap.hasOwnProperty(key)) {
                    const value = this.editorMap[key].getValue();
                    ret.push({ [key]: value });
                }
            }
        }
        return ret;
    }

    build() {
        super.build();
        console.log(this.schema);
        // Clear any existing editor containers to rebuild subeditors
        if (this.editors && this.editors.length) {
            this.editors.forEach(editor => editor.destroy());
            this.editorMap = {};
            this.editors = [];
            if (this.container) {
                this.container.innerHTML = '';
            }
        } else {
            this.editors = [];
            this.editorMap = {};
        }

        // Create subeditors for each object in this.value (ordered array)
        Object.keys(this.schema.items.properties).forEach(metric => {
            var row = document.createElement('div');
            row.className = 'row';
            var itemName = metric;//Object.keys(metric.properties)[0];
            var itemSchema = this.schema.items.properties[itemName];
            var itemLabel = document.createElement('label');
            itemLabel.className = 'lbl';
            itemLabel.innerText = itemName;
            row.appendChild(itemLabel);
            var editor = this.jsoneditor.createEditor(JSONEditor.defaults.editors.radio, {
                jsoneditor: this.jsoneditor,
                schema: itemSchema,
                path: `${this.path}.${itemName}`,
                parent: this,
                compact: true,
                required: true
            });
            editor.container = row;
            editor.preBuild();
            editor.build();
            editor.postBuild();
            console.log(editor);
            // Append editor container to this container
            if (this.container) {
                this.container.appendChild(row);
            }

            this.editors.push(editor);
            this.editorMap[itemName] = editor;
        });
    }
}

JSONEditor.defaults.editors.ssvcOpts = ssvcOpts;

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.format === 'ssvcOpts') {
        return 'ssvcOpts';
    }
});
