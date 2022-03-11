docEditor.on('ready', async ()=> {
    if(cveApi && cveApi.userInfo) {
        document.getElementById('cvePortal').innerHTML = cveRender({
                portalType: cveApi.apiType,
                portalURL: cveApi.URL, 
                ctemplate: 'portal',
                userInfo: cveApi.userInfo,
                org: cveApi.org
        });
        var t = new Date().getTime();
        if(cveApi.list && cveApi.listUpdated && ((t - cveApi.listUpdated) < 300000)) {
            cveRenderList(cveApi.list)
        } else {
            if(!cveClient) {
                await newCVESession(cveApi.URL, cveApi.apiType, cveApi.creds);
            }
            if(cveClient)
                cveGetList();
        }
    } else {
        document.getElementById('cvePortal').innerHTML = cveRender({
            ctemplate: 'cveLoginBox'
        })
    }
});
