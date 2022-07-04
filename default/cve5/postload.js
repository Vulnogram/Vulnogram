docEditor.on('ready', async ()=> {
    addAutoButton();
    defaultTabs.sourceTab.getValue = function () {
        var res = JSON.parse(sourceEditor.getSession().getValue());
        res = addRichTextCVE(res);
        res = cvssv3_0_to_cvss3_1(res);
        return res;
    };
    var org = await checkSession();
    //console.log('Org ' + org);
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
            ctemplate: 'cveLoginBox',
            prevPortal: window.localStorage.getItem('portalType'),
            prevOrg: window.localStorage.getItem('shortName')
        })
    }
});
