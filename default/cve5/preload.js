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
    setValue(value, initial) {
        super.setValue(value, initial);
        console.log(JSON.stringify(value,2,2));
        if (this.container) {
            this.container.innerHTML = pugRender({
                renderTemplate: 'cpeApplicability',
                doc: value
            })
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
        console.log(JSON.stringify(this.value,2,2));
        if (this.value) {
            this.container.innerHTML = pugRender({
                renderTemplate: 'cpeApplicability',
                doc: this.value
            })
        }
    }
    enable() {
        super.enable();
    }
    disable() {
        super.disable();
    }
    destroy() {
        if (this.label) this.label.parentNode.removeChild(this.label);
        if (this.description) this.description.parentNode.removeChild(this.description);
        super.destroy();
    }
};

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.format === "CPEA") {
        return "CPEA";
    }
});