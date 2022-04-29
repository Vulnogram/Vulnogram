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