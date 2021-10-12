if(window.sessionStorage.cveApi) {
    cveApi = JSON.parse(window.sessionStorage.cveApi);
    if(!cveApi.state) {
        cveApi.state = {}
    }
    if(cveApi.list) {
        if(docSchema) {
            docSchema.definitions.orgId.default = cveApi.org.UUID;
            docSchema.definitions.cveId.examples = cveApi.list.map(i=>i.cve_id);   
        }
    }
}

document.getElementById('post1').addEventListener('click', cvePost);