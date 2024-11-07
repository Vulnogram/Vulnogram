async function preloadCve() {
    try {
        await initCsClient();
    } catch (e) {
        //portalErrorHandler(e);
    }
}
preloadCve();

// KSF
if (document.getElementById('post1'))
    document.getElementById('post1').addEventListener('click', cvePost);

//var publicEditorOption = cloneJSON(docEditorOptions);
//Object.assign(publicEditorOption.schema, docSchema.oneOf[0]);
//delete publicEditorOption.schema.oneOf;

//var rejectEditorOption = cloneJSON(docEditorOptions);
//Object.assign(rejectEditorOption.schema, docSchema.oneOf[1]);
//delete rejectEditorOption.schema.oneOf;

docSchema.oneOf.pop()
docSchema.oneOf[0].title="Editor"

//if (initJSON && initJSON.cveMetadata && initJSON.cveMetadata.state == 'REJECTED') {
//    docEditorOptions = rejectEditorOption;
//} else {
//    docEditorOptions = publicEditorOption;
//}

// END KSF

// make sure all starting and ending spaces in strings are trimmed 
JSONEditor.defaults.editors.string.prototype.sanitize = function(value) {
    if(value)
        return value.trim();
    return value;
  }; 
