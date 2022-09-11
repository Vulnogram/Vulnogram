docEditor.on('ready', async () => {
    defaultTabs.sourceTab.getValue = function () {
        var res = JSON.parse(sourceEditor.getSession().getValue());
        res = cveFixForVulnogram(res);
        return res;
    };
});
