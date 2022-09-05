async function preloadCve() {
    var cveOrg = await checkSession();
    if(cveOrg) {
        var l = await cveGetList();
        docSchema.definitions.orgId.default = cveOrg.UUID;
        docSchema.definitions.cveId.examples = l.map(i=>i.cve_id);
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

if(initJSON && initJSON.cveMetadata && initJSON.cveMetadata.state == 'REJECTED') {
    docEditorOptions = rejectEditorOption;
} else {
    docEditorOptions = publicEditorOption;
}

