docEditor.on('ready', async ()=> {
    var org = await checkSession();
    if(org) {
        document.getElementById('cvePortal').innerHTML = cveRender({
                portalType: cveApi.apiType,
                portalURL: cveApi.url, 
                ctemplate: 'portal',
                userInfo: await cveClient.getOrgUser(cveApi.user),
                org: org
        });
        var t = new Date().getTime();
        cveGetList();
    } else {
        document.getElementById('cvePortal').innerHTML = cveRender({
            ctemplate: 'cveLoginBox'
        })
    }
});
