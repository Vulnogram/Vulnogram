//CVE Services Client and Portal GUI 

var csClient = undefined;
var defaultPortalUrl = 'https://cveawg.mitre.org/api';

var csCache = {
    portalType: 'production',
    url: defaultPortalUrl,
    org: null,
    user: null,
    orgInfo: null
}
var portalBootstrapPromise = null;
var portalNavStatePromise = null;

function setPortalNavConnectionState(connected) {
    var nav = document.getElementById('cvePortalNav');
    if (!nav) {
        return;
    }
    var status = connected ? 'connected' : 'disconnected';
    nav.setAttribute('data-portal-status', status);
    nav.setAttribute('title', connected ? 'CVE Services connected' : 'CVE Services disconnected (login required)');
}

async function refreshPortalNavConnectionState() {
    if (!('serviceWorker' in navigator)) {
        setPortalNavConnectionState(false);
        return false;
    }
    if (portalNavStatePromise) {
        return portalNavStatePromise;
    }
    portalNavStatePromise = (async function () {
        try {
            await ensurePortalBootstrap();
        } catch (e) {
            setPortalNavConnectionState(false);
            return false;
        }
        try {
            var hasSession = await hasActivePortalSession(csCache.url);
            setPortalNavConnectionState(hasSession);
            return hasSession;
        } catch (e) {
            setPortalNavConnectionState(false);
            return false;
        }
    })();
    try {
        return await portalNavStatePromise;
    } finally {
        portalNavStatePromise = null;
    }
}

function initPortalNavConnectionState() {
    setPortalNavConnectionState(false);
    refreshPortalNavConnectionState();
    window.addEventListener('focus', refreshPortalNavConnectionState);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortalNavConnectionState);
} else {
    initPortalNavConnectionState();
}

function isPortalAuthError(e) {
    const err = e && e.error ? e.error : null;
    return err == 'NO_SESSION' || err == 'UNAUTHORIZED';
}

function normalizePortalUrl(url) {
    if (!url) {
        return defaultPortalUrl;
    }
    return String(url).trim().replace(/\/+$/, '');
}

function getClientPortalUrl() {
    if (!csClient || !csClient._middleware) {
        return null;
    }
    return normalizePortalUrl(csClient._middleware.serviceUri);
}

function ensureCsClient(url) {
    const targetUrl = normalizePortalUrl(url);
    const currentUrl = getClientPortalUrl();
    if (!csClient || currentUrl !== targetUrl) {
        csClient = new CveServices(targetUrl, "./static/cve5sw.js");
    }
    return csClient;
}

function clearPortalSessionCache() {
    const settings = getStoredPortalSettings();
    csCache = {
        portalType: settings.portalType,
        url: settings.portalUrl,
        org: null,
        user: null,
        orgInfo: null
    };
    window.localStorage.removeItem('cveApi');
    setPortalNavConnectionState(false);
}

async function hasActivePortalSession(url) {
    if (!('serviceWorker' in navigator)) {
        setPortalNavConnectionState(false);
        return false;
    }
    const targetUrl = normalizePortalUrl(url || csCache.url || getStoredPortalSettings().portalUrl);
    csCache.url = targetUrl;
    csClient = ensureCsClient(targetUrl);
    const restored = await restorePortalCacheFromSession();
    if (!(restored && csCache.user && csCache.org)) {
        setPortalNavConnectionState(false);
        return false;
    }
    // Verify session against CVE Services, not just cached SW credentials.
    try {
        await csClient.getOrgInfo();
        setPortalNavConnectionState(true);
        return true;
    } catch (e) {
        if (isPortalAuthError(e)) {
            if (csClient && typeof csClient.logout === 'function') {
                try {
                    await csClient.logout();
                } catch (e2) {
                    // ignore cleanup errors
                }
            }
            clearPortalSessionCache();
            return false;
        }
        throw e;
    }
}

function setPortalSidebarState(show) {
    var portalDialog = document.getElementById('cvePortalDialog');
    var portalNav = document.getElementById('cvePortalNav');
    if (!portalDialog) {
        return false;
    }
    if (!portalDialog._portalEventsBound) {
        portalDialog.addEventListener('close', function () {
            var nav = document.getElementById('cvePortalNav');
            if (nav) {
                nav.classList.remove('active');
            }
        });
        portalDialog._portalEventsBound = true;
    }
    if (show) {
        if (!portalDialog.open) {
            portalDialog.showModal();
        }
        if (portalNav) {
            portalNav.classList.add('active');
        }
    } else {
        if (portalDialog.open) {
            portalDialog.close();
        }
        if (portalNav) {
            portalNav.classList.remove('active');
        }
    }
    return show;
}

function closeCvePortal(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    setPortalSidebarState(false);
    return false;
}

function showCvePortal(event, forceShow) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    var portalDialog = document.getElementById('cvePortalDialog');
    if (!portalDialog) {
        return false;
    }
    var show = forceShow === true ? true : !portalDialog.open;
    if (!show) {
        setPortalSidebarState(false);
        return false;
    }
    showPortalViewOrLogin();
    return false;
}

async function showPortalViewOrLogin() {
    if (!('serviceWorker' in navigator)) {
        document.getElementById('port').innerHTML = '<h2 class="pad2 tred">Browser does not support Service Workers feature required for this tab.</h2><i class="indent pad2">Are you using Firefox in Private mode? Try normal mode.</i>';
        setPortalSidebarState(true);
        return false;
    }
    try {
        await ensurePortalBootstrap();
    } catch (e) {
        portalErrorHandler(e);
        return false;
    }
    loadPortalCache();
    if (!csCache.url) {
        csCache.url = getStoredPortalSettings().portalUrl;
    }
    let hasSession = false;
    try {
        hasSession = await hasActivePortalSession(csCache.url);
    } catch (e) {
        portalErrorHandler(e);
        return false;
    }
    if (!hasSession) {
        showPortalLogin();
        setPortalSidebarState(true);
        return false;
    }
    await showPortalView();
    setPortalSidebarState(true);
    return true;
}

function portalFocusEditor() {
    setPortalSidebarState(false);
    if (typeof (mainTabGroup) !== 'undefined') {
        mainTabGroup.change(0);
    }
}

function getStoredPortalSettings() {
    let portalType = window.localStorage.getItem('portalType');
    let portalUrl = window.localStorage.getItem('portalUrl');
    if (!portalType || !portalUrl) {
        portalType = 'production';
        portalUrl = defaultPortalUrl;
    }
    return {
        portalType: portalType,
        portalUrl: portalUrl
    };
}

function loadPortalCache() {
    if (!window.localStorage.getItem('cveApi')) {
        return;
    }
    try {
        const cache = JSON.parse(window.localStorage.getItem('cveApi'));
        if (cache && typeof cache === 'object') {
            csCache = cache;
        } else {
            window.localStorage.removeItem('cveApi');
        }
    } catch (e) {
        window.localStorage.removeItem('cveApi');
    }
}

async function restorePortalCacheFromSession() {
    if (!csClient || typeof csClient.getSession !== 'function') {
        return false;
    }
    try {
        const session = await csClient.getSession();
        if (!session || !session.user || !session.org) {
            return false;
        }
        const settings = getStoredPortalSettings();
        csCache.user = session.user;
        csCache.org = session.org;
        csCache.url = csCache.url ? csCache.url : settings.portalUrl;
        csCache.portalType = csCache.portalType ? csCache.portalType : settings.portalType;
        csCache.orgInfo = csCache.orgInfo ? csCache.orgInfo : null;
        window.localStorage.setItem('cveApi', JSON.stringify(csCache));
        window.localStorage.setItem('shortName', session.org);
        return true;
    } catch (e) {
        return false;
    }
}

async function bootstrapCsClient() {
    if (!('serviceWorker' in navigator)) {
        return false;
    }
    loadPortalCache();
    if (!csCache.url) {
        csCache.url = getStoredPortalSettings().portalUrl;
    }
    csClient = ensureCsClient(csCache.url);
    listenforLogins();
    listenforLogouts();
    return true;
}

function ensurePortalBootstrap() {
    if (!portalBootstrapPromise) {
        portalBootstrapPromise = bootstrapCsClient().catch(function (e) {
            portalBootstrapPromise = null;
            throw e;
        });
    }
    return portalBootstrapPromise;
}

async function initCsClient() {
    if ('serviceWorker' in navigator) {
        try {
            await ensurePortalBootstrap();
            const hasSession = await hasActivePortalSession(csCache.url);
            if (hasSession) {
                await showPortalView();
            } else {
                clearPortalSessionCache();
            }
        } catch (e) {
            portalErrorHandler(e);
        }
    }
}

function showPortalLogin(message) {
    clearPortalSessionCache();

    document.getElementById('port').innerHTML = cveRender({
        ctemplate: 'cveLoginBox',
        message: message,
        prevPortal: csCache.portalType,
        prevOrg: window.localStorage.getItem('shortName')
    })
}

async function portalLogout(message) {
    if (csClient != null) {
        await csClient.logout();
    }
    clearPortalSessionCache();
    setPortalSidebarState(false);
    if (document.getElementById('loginErr')) {
        document.getElementById("loginErr").innerText = message ? message : '';
    } else if (document.getElementById('port')) {
        document.getElementById('port').innerHTML = '';
    }
}

async function showPortalView(orgInfo, userInfo) {
    try {
        if (!orgInfo) {
            orgInfo = await csClient.getOrgInfo();
        }
        if (!userInfo) {
            userInfo = await csClient.getOrgUser(csCache.user);
        }
        document.getElementById('port').innerHTML = cveRender({
            portalType: csCache.portalType,
            portalURL: csCache.url,
            ctemplate: 'portal',
            userInfo: userInfo,
            org: orgInfo
        });
        setPortalNavConnectionState(true);
        var button1 = document.getElementById('post1');
        if(button1) {
            if(csCache.portalType == 'test') {
                button1.innerText = 'Post to Test Portal'
            } else {
                button1.innerText = 'Publish CVE'
            }
        }
        var button2 = document.getElementById("post2")
        if(button2) {
            if(csCache.portalType == 'test') {
                button2.innerText = 'Post to Test Portal'
            } else {
                button2.innerText = 'Publish CVE';
            }
        }
        return await cveGetList();
    } catch (e) {
        portalErrorHandler(e);
    }
}

var loginChannel = new BroadcastChannel("login");
var logoutChannel = new BroadcastChannel("logout");

function listenforLogins() {
    loginChannel.onmessage = function (a) {
        initCsClient();
        refreshPortalNavConnectionState();
    }
}
function listenforLogouts() {
    logoutChannel.onmessage = function (a) {
        clearPortalSessionCache();
        setPortalSidebarState(false);
        if (document.getElementById('loginErr')) {
            document.getElementById("loginErr").innerText = a.message ? a.message : '';
        } else if (document.getElementById('port')) {
            document.getElementById('port').innerHTML = '';
        }
    }
}
function normalizeShortName(shortName) {
    if (!shortName) return null;
    return String(shortName).trim().toLowerCase().replace(/\s+/g, '_');
}

async function refreshRecentCveEntries(shortName) {
    if (typeof loadRecentAbbreviatedIds !== 'function') {
        return;
    }
    var orgName = normalizeShortName(shortName);
    if (!orgName) {
        return;
    }
    try {
        var recent = await loadRecentAbbreviatedIds(orgName);
        if (typeof window !== 'undefined' && typeof window.setRecentCveEntries === 'function') {
            window.setRecentCveEntries(recent, orgName);
        }
    } catch (e) {
        console.error('Failed to refresh recent CVE entries for ' + orgName, e);
    }
}

async function portalLogin(elem, credForm) {
    try {
        if (!('serviceWorker' in navigator)) {
            cveShowError('Browser is missing required features. Try a different browser that supports Service Workers.')
            return (false);
        }
        if (!credForm.checkValidity()) {
            return (false);
        }
        elem.preventDefault();
        var url = normalizePortalUrl(credForm.portal.value);
        var portalType = credForm.portal.options[credForm.portal.selectedIndex].text;
        csClient = ensureCsClient(url);
        var ret = await csClient.login(
            credForm.user.value,
            credForm.org.value,
            credForm.key.value);


        var orgInfo = await csClient.getOrgInfo();
        var userInfo = await csClient.getOrgUser(credForm.user.value);

        csCache.user = credForm.user.value;
        csCache.org = credForm.org.value;
        csCache.url = url;
        csCache.portalType = portalType;
        csCache.orgInfo = orgInfo;

        window.localStorage.setItem('cveApi', JSON.stringify(csCache));
        window.localStorage.setItem('portalType', portalType);
        window.localStorage.setItem('portalUrl', url);
        window.localStorage.setItem('shortName', credForm.org.value);

        if (ret == 'ok' || ret.data == "ok") {
            csCache.keyUrl = ret.keyUrl;
            await refreshRecentCveEntries(credForm.org.value);
            await showPortalView(orgInfo, userInfo);
            /* Add one hour session timeout in addition to timeout in serviceWorker */
            setTimeout(portalLogout, defaultTimeout);
            //announce to others that a login happened.
            loginChannel.postMessage({ message: 'The user has logged in' });

        } else {
            document.getElementById("loginErr").innerText = 'Failed to login: Possibly invalid credentials!';
        }
    } catch (e) {
        portalErrorHandler(e);
    }
}

function resetPortalLoginErr() {
    //console.log('changed form');
    document.getElementById("loginErr").innerText = '';
}


function portalErrorHandler(e) {
    const err = e && e.error ? e.error : null;
    const isNoSession = err == 'NO_SESSION';
    const isUnauthorized = err == 'UNAUTHORIZED';
    const isFetchError = !!(err && typeof err === 'object' && err.message == 'Failed to fetch');

    if (isFetchError) {
        const message = 'Error connecting to service';
        if (document.getElementById("loginErr")) {
            document.getElementById("loginErr").innerText = message;
        } else {
            cveShowError({ error: 'NETWORK_ERROR', message: message });
        }
        return;
    }

    if (isNoSession || isUnauthorized) {
        if (csClient && typeof csClient.logout === 'function') {
            csClient.logout().catch(function () { });
        }
        clearPortalSessionCache();
        const message = isUnauthorized ? 'Valid credentials required' : ((e && e.message) ? e.message : 'Please login.');
        if (document.getElementById("loginErr")) {
            // Login screen exists
            document.getElementById("loginErr").innerText = message;
        } else if (document.getElementById('port')) {
            showPortalLogin(message);
        } else {
            cveShowError({ error: err, message: message });
        }
    } else {
        cveShowError(e);
    }
}

async function userlistUpdate(elem, event) {
    if (elem.open) {
        document.getElementById("userStatsPopup").open = false;
        try {
            var ret = await csClient.getOrgUsers();
            var userlist = document.getElementById('userlist');
            if (userlist) {
                userlist.innerHTML = cveRender({
                    ctemplate: 'listUsers',
                    users: ret.users
                })
            }
        } catch (e) {
            portalErrorHandler(e);
        }
    }
}

async function cveUserKeyReset(elem, confirm) {
    var u = elem.form.u.value;
    var temp1 = document.getElementById("alertOk");
    if (confirm) {
        temp1.setAttribute("onclick", "document.getElementById('alertDialog').close();");
        elem.removeAttribute('id');
        document.getElementById('alertDialog').close();
    } else {
        showAlert("Are you sure?", "A new API key will be generated for user " + u + "! The old API key will no longer work!", undefined, true);
        let randid = Math.random().toString(32).substring(2);
        elem.setAttribute('id', randid);
        temp1.setAttribute('u', u);
        temp1.setAttribute('onclick', 'cveUserKeyReset(document.getElementById("' + randid + '"),true)');
        return;
    }
    try {
        var ret = await csClient.resetOrgUserApiKey(u);
        if (ret["API-secret"]) {
            var msg = "API Key was reset for " + u + "!";
            if (csCache.user == u) {
                msg += " You will need to login again with the new key!";
                portalLogout();
            }
            document.getElementById("userMessage").innerText = msg;
            document.getElementById("secretDialogForm").pass.value = ret["API-secret"];
            document.getElementById("secretDialogForm").pass.type = "password";
            document.getElementById("secretDialog").showModal();
        }
    } catch (e) {
        portalErrorHandler(e);
    }
}

async function cveUpdateUser(f) {
    try {
        params = {
            "name.first": f.first.value,
            "name.last": f.last.value
        };
        if (f.u.value != f.new_username.value) {
            params.new_username = f.new_username.value
        }
        if (csCache.user != f.u.value) {
            params.active = f.active.checked;
            if (f.admin.checked) {
                params["active_roles.add"] = 'ADMIN'
            } else {
                params["active_roles.remove"] = 'ADMIN'
            }
        }

        var ret = await csClient.updateOrgUser(f.u.value, params);
        if (ret.updated) {
            document.getElementById("userEditDialog").close();
            if (document.getElementById("userListPopup")) {
                userlistUpdate(document.getElementById("userListPopup"));
            }
            //the current user is updating self
            if ((csCache.user == f.u.value) && document.getElementById("cveUser")) {
                if (csCache.user != ret.updated.username) {
                    cveShowError({ error: 'Username changed!', message: 'Username successfully changed to ' + ret.updated.username + '! You will need to login again!' });
                    portalLogout();
                    return;
                }
                document.getElementById("cveUser").innerHTML =
                    cveRender({
                        ctemplate: 'userstats',
                        userInfo: ret.updated,
                        org: await csClient.getOrgInfo()
                    })
            }
        }
    } catch (e) {
        cveShowError(e);
    }
}

function removeErrors() {
    Array.from(document.getElementsByClassName('formError')).forEach(x => x.remove());
}

function addError(el) {
    var div = document.createElement('div');
    div.classList.add('formError');
    div.innerHTML = "Please provide a valid data";
    div.setAttribute('onclick', 'this.remove(); return false;');
    el.setAttribute('onfocus', 'removeErrors()');
    el.after(div);
}

function validateForm(f) {
    let isvalid = true;
    const controls = f.elements;
    for (let i = 0; i < controls.length; i++) {
        const x = controls[i];
        if (!isvalid)
            return;
        /* Needed is an alias for required to avoid showing
           red boxes unless a submit event is initiated. */
        if (x.getAttribute("needed"))
            x.setAttribute("required", "required");
        if ('validity' in x) {
            if ('valid' in x.validity) {
                isvalid = x.validity.valid;
                if (!isvalid)
                    addError(x);
            }
        }
    };
    return isvalid;
}

async function cveUserEdit(elem) {
    f = document.getElementById('userEditForm');
    f.u.value = elem.getAttribute('u');
    f.new_username.value = elem.getAttribute('u');
    f.first.value = elem.getAttribute('f');
    f.last.value = elem.getAttribute('l');
    f.admin.checked = elem.getAttribute('ad') ? true : false;
    f.active.checked = elem.getAttribute('ac') ? true : false;
    if (csCache.user == f.u.value) {
        if (!elem.getAttribute('ad')) {
            f.new_username.disabled = true;
        }
        f.admin.parentElement.setAttribute('class', 'hid');
        f.admin.setAttribute('disabled', true);
        f.active.setAttribute('disabled', true);
    } else {
        f.admin.parentElement.removeAttribute('class');
        f.admin.removeAttribute('disabled');
        f.active.removeAttribute('disabled');
    }
    document.getElementById('userEditDialog').showModal();
}

async function cveAddUser(f) {
    if (validateForm(f)) {
        try {
            const userFields = {
                "username": f.new_username.value,
                "name": {
                    "first": f.first.value,
                    "last": f.last.value
                },
                "authority": {
                    "active_roles": []
                }
            }
            if (f.admin.checked) {
              userFields.authority.active_roles.push("ADMIN")
            }
            var ret = await csClient.createOrgUser(userFields);
            if (ret.created && ret.created.secret) {
                document.getElementById('userAddDialog').close();
                document.getElementById("secretDialogForm").pass.value = ret.created.secret;
                document.getElementById("secretDialogForm").pass.type = "password";
                document.getElementById("secretDialog").showModal();
                document.getElementById("userMessage").innerText = ret.message;
                f.reset()
                userlistUpdate({ open: true });
            }
        } catch (e) {
            portalErrorHandler(e);
        }

    } else {
        cveShowError('Please provide valid information!');
    }
}

async function cveOrgUpdate() {
    cveShowError('To be done');
}

async function cveRenderList(l, refreshEditor) {
    if (l && document.getElementById('cveList')) {
        var canInlineLoad = !!(document.getElementById('docEditor') && typeof loadJSON === 'function' && typeof mainTabGroup !== 'undefined');
        var docPathBase = '/' + ((typeof schemaName === 'string' && schemaName) ? schemaName : 'cve5') + '/';
        document.getElementById('cveList').innerHTML = cveRender({
            ctemplate: 'listIds',
            cveIds: l,
            editable: true,//(csCache.portalType == 'test')
            inlineLoad: canInlineLoad,
            docPathBase: docPathBase
        })
        if (l.length > 0) {
            new Tablesort(document.getElementById('cveListTable'));
        }
        if (refreshEditor && typeof docSchema !== 'undefined' && docSchema && typeof editorSetCveDatalist === 'function' && document.getElementById('root.cveMetadata.cveId-datalist')) {
            docSchema.definitions.cveId.examples = l.map(i => i.cve_id);
            editorSetCveDatalist(l);
        }
        var editableList = document.getElementById('editablelist');
        if (editableList) {
            editableList.innerHTML = cveRender({
                ctemplate: 'editables',
                cveIds: l
            })
        }
    }
}

async function editorSetCveDatalist(l) {
    document.getElementById('root.cveMetadata.cveId-datalist').innerHTML = cveRender({
        ctemplate: 'reserveds',
        cveIds: l
    })
}

function paginate(a) {
    let el = document.getElementById('cvePage');
    if (!el) {
        //console.log("Error cannot find template ");
        //console.log(a);
        return false;
    }
    let cp = parseInt(el.getAttribute('data-page'));
    if (isNaN(cp)) {
        //console.log("The data-page element is not pareable ");
        //console.log(cp);
        return galse;
    }
    let np = cp + parseInt(a);
    var cveForm = document.getElementById("cvePortalFilter");
    cveForm.page = np;
    cveGetList();
    return false;
}

//var collator = new Intl.Collator(undefined, {numeric: true});
async function pageShow(ret) {
    let el = document.getElementById('cvePage');
    if (!el) {
        //console.log("Error cannot find template ");
        //console.log(ret);
        return;
    }
    el.style.display = 'block';
    el.setAttribute('data-page', ret.currentPage);
    let start = (ret.currentPage - 1) * ret.itemsPerPage + 1;
    let end = start + ret.itemsPerPage - 1;
    let total = ret.totalCount;
    if (end > total)
        end = total;
    document.getElementById('cvePageInfo').innerHTML = "Showing " +
        String(start) + " to " + String(end) + " of " +
        String(total) + " records "
    document.getElementById('currentPage').innerHTML = ret.currentPage
    if (ret.prevPage)
        document.getElementById('prevPage').style.display = 'block';
    else
        document.getElementById('prevPage').style.display = 'none';
    if (ret.nextPage)
        document.getElementById('nextPage').style.display = 'block';
    else
        document.getElementById('nextPage').style.display = 'none';
}

async function cveShowError(err) {
    if (!err) {
        err = { error: 'Error', message: 'Unknown error' };
    }
    var cveErrorContainer = document.getElementById('cveErrors');
    var cveErrorModal = document.getElementById('cveErrorsModal');
    if (cveErrorContainer && cveErrorModal && typeof cveRender === 'function') {
        cveErrorContainer.innerHTML = cveRender({
            ctemplate: 'cveErrors',
            err: err
        });
        cveErrorModal.showModal();
        return;
    }
    var fallbackMessage = (err && err.message) ? err.message : cvePublishErrorMessage(err);
    if (typeof showAlert === 'function') {
        showAlert('Error', fallbackMessage);
    } else if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert('Error: ' + fallbackMessage);
    }
}

async function cveGetList() {
    var currentReserved = true;
    var filter = {
        state: 'RESERVED',
        cve_id_year: currentYear
    }
    var cveForm = document.getElementById("cvePortalFilter");
    if (cveForm) {
        if (cveForm.fstate) {
            if (cveForm.fstate.value) {
                filter.state = cveForm.fstate.value + '';
                if (filter.state != 'RESERVED') {
                    currentReserved = false;
                }
            } else {
                delete filter.state;
            }
        }
        if (cveForm.y) {
            filter.cve_id_year = cveForm.y.value + '';
            if (filter.cve_id_year != currentYear) {
                currentReserved = false;
            }
        }
        if (cveForm.page) {
            filter.page = cveForm.page;
        }
    }
    if (document.getElementById('cveList')) {
        document.getElementById('cveList').innerHTML = '<center><div class="spinner"></div></center>';
    }
    try {
        var ret = await csClient.getCveIds(filter);
        if (ret.error) {
            cveShowError(ret);
        } else {
            var idList = [];
            var idState = {};
            if (ret && ret.cve_ids) {
                idList = ret.cve_ids;
                idList = idList.sort((b, a) => (a.reserved > b.reserved) ? 1 : ((b.reserved > a.reserved) ? -1 : 0));
                for (var i = 0; i < idList.length; i++) {
                    idState[idList[i].cve_id] = idList[i].state;
                }
            }
            cveRenderList(idList, currentReserved);
            if (ret && (ret.nextPage || ret.prevPage)) {
                pageShow(ret);
            } else {
                let el = document.getElementById('cvePage');
                if (el) {
                    el.removeAttribute('data-page');
                    el.style.display = 'none';
                }
                if (cveForm)
                    cveForm.page = 0;
            }
            return idList;
        }
    } catch (e) {
        cveShowError(e);
        cveRenderList([]);
        return ([]);
    }
}

async function cveReserve(yearOffset, number) {
    var year = currentYear + (yearOffset ? yearOffset : 0);
    try {
        var args = {
            amount: number > 0 && number <= 50 ? number : 1,
            // Request only one at this time to get four digits! Requesting more at time gives the 5 digit ids.
            // batch_type: 'nonsequential',
            cve_year: year,
            short_name: csCache.org
        };
        if (number > 1) {
            args.batch_type = 'sequential';
        }
        var json = await csClient.reserveCveIds(args);
        return json.cve_ids;
    } catch (e) {
        cveShowError(e.message);
    }
}

async function cveSelectLoad(event) {
    event.preventDefault();
    try {
        cveLoad(event.target.elements.id.value)
    } catch (e) {
        portalErrorHandler(e);
        cveShowError('Please login to CVE Portal. Your session may have expired!');
    }
    return false;
}

function cveSyncLoadedUrl(cveId) {
    if (!cveId || typeof updateDraftHistory !== 'function') {
        return;
    }
    updateDraftHistory('./' + cveId, { id: cveId });
}

function cveLoadIntoEditor(res, cveId, message, edOpts) {
    loadJSON(res, cveId, message, edOpts);
    cveSyncLoadedUrl(cveId);
    portalFocusEditor();
}

async function cveLoadFromCveOrg(cveId, suppressErrors) {
    try {
        const response = await fetch('https://cveawg.mitre.org/api/cve/' + cveId, {
            method: 'GET',
            credentials: 'omit',
            headers: {
                'Accept': 'application/json, text/plain, */*'
            }
        });
        if (response.ok) {
            const data = await response.json();
            if (data && data.cveMetadata) {
                cveLoadIntoEditor(cveFixForVulnogram(data), cveId, "Loaded " + cveId + " from CVE.org");
                return data;
            }
        } else if (!suppressErrors) {
            errMsg.textContent = "CVE not found in CVE.org!";
            infoMsg.textContent = "";
            return null;
        }
    } catch (e) {
        if (!suppressErrors) {
            errMsg.textContent = "Failed to load valid CVE Record";
            infoMsg.textContent = "";
        }
        console.error('Failed to fetch from CVE.org:', e);
        return null;
    }
    return null;
}


async function cveLoad(cveId) {
   // console.log('trying to load '+cveId);
    var cveOrgRes = await cveLoadFromCveOrg(cveId, true);
    if (cveOrgRes) {
        return cveOrgRes;
    }

    if (!csClient || typeof csClient.getCve !== 'function') {
        errMsg.textContent = "CVE not found in CVE.org!";
        infoMsg.textContent = "";
        return null;
    }

    try {
        var res = await csClient.getCve(cveId);
        if (res.cveMetadata) {
            if (res.containers) {
                res = cveFixForVulnogram(res);
            } else {
                //console.log('no containers');
            }
            var edOpts = (res.cveMetadata.state == 'REJECTED') ? rejectEditorOption : publicEditorOption;
            var portalType = (csCache && csCache.portalType) ? csCache.portalType : 'production';
            cveLoadIntoEditor(res, cveId, "Loaded " + cveId + " from CVE Services (" + portalType + ")", edOpts);
            return res;
        }
    } catch (e) {
        if (e != '404' && e.error != 'CVE_RECORD_DNE') {
            errMsg.textContent = "Failed to load valid CVE Record";
            infoMsg.textContent = "";
            return null;
        }
    }

    var skeleton = {
        "cveMetadata": {
            "cveId": cveId,
            "assigner": csCache.orgInfo ? csCache.orgInfo.UUID : "",
        }
    };
    try {
        var res = await csClient.getCveId(cveId);
        var edOpts = publicEditorOption;
        if (res.state == 'RESERVED') {
            skeleton.cveMetadata.state = "PUBLISHED";
        } else if (res.state == 'REJECTED') {
            skeleton.cveMetadata.state = "REJECTED";
            edOpts = rejectEditorOption;
        } else {
            return {};
        }

        cveLoadIntoEditor(skeleton, cveId, "Loaded " + cveId, edOpts);
        return skeleton;
    } catch (e2) {
        if (e2 == '404') {
            showAlert('CVE Not found!');
        } else {
            errMsg.textContent = "Failed to load valid CVE Record";
            infoMsg.textContent = "";
        }
    }
    return null;
}

async function cveReject(elem, event) {
    var id = elem.getAttribute('data');
    if (window.confirm('Do you want to reject ' + id + '? It cannot be undone!')) {
        try {
            var ret = await csClient.updateCveId(id, 'REJECTED', csCache.org);
            if (ret.updated && ret.updated.state == 'REJECTED') {
                var m = document.getElementById("cveStatusMessage");
                m.innerText = "Rejected " + id;
                await cveGetList();
            }
        } catch (e) {
            portalErrorHandler(e);
        }
    }
}
function transatePath(p) {
    if(p) {
        p = p.replace("/cnaContainer", "root.containers.cna");
        p = p.replaceAll('/', '.');
    }
    return p;
}

function filterADP(vr) {
    if (vr && vr.length > 0) {
        var filtered = vr.filter(a => a.path && a.path.startsWith('root.containers.adp') == 0);
        return filtered;
    }
    else { 
        return vr
    }
}

function cvePublishErrorMessage(e) {
    if (e == undefined || e == null) {
        return "Unknown error";
    }
    if (typeof e == 'string') {
        return e;
    }
    if (e.message) {
        return e.message;
    }
    if (e.error) {
        if (typeof e.error == 'string') {
            return e.error;
        }
        if (e.error.message) {
            return e.error.message;
        }
    }
    try {
        return JSON.stringify(e);
    } catch (e2) {
        return String(e);
    }
}

function cveAlert(title, message, timer) {
    if (typeof showAlert === 'function') {
        showAlert(title, message, timer);
        return;
    }
    var text = message ? (title + ': ' + message) : title;
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert(text);
    } else {
        console.warn(text);
    }
}

function cveCloneDoc(doc) {
    if (!doc) {
        return doc;
    }
    if (typeof cloneJSON === 'function') {
        return cloneJSON(doc);
    }
    return JSON.parse(JSON.stringify(doc));
}

function cvePreparePublishDoc(doc) {
    var prepared = cveCloneDoc(doc);
    if (typeof textUtil !== 'undefined' && textUtil && typeof textUtil.reduceJSON === 'function') {
        prepared = textUtil.reduceJSON(prepared);
    }
    return prepared;
}

async function cveEnsurePublishSession() {
    try {
        await ensurePortalBootstrap();
    } catch (e) {
        portalErrorHandler(e);
        return false;
    }
    var hasSession = false;
    try {
        hasSession = await hasActivePortalSession(csCache.url);
    } catch (e) {
        portalErrorHandler(e);
        return false;
    }
    if (!hasSession) {
        if (document.getElementById('port') && typeof showPortalLogin === 'function') {
            showPortalLogin('Please login to publish CVE records.');
            setPortalSidebarState(true);
        } else {
            cveAlert('CVE Services login required', 'Please login to publish CVE records.');
        }
        return false;
    }
    return true;
}

async function cveSubmitDocToPortal(doc) {
    var j = cvePreparePublishDoc(doc);
    if (!j || !j.cveMetadata || !j.cveMetadata.cveId) {
        throw new Error('Missing cveMetadata.cveId');
    }
    var cveId = j.cveMetadata.cveId;
    var cveState = j.cveMetadata.state == 'REJECTED' ? 'REJECTED' : 'PUBLISHED';
    var cnaContainer = (j.containers && j.containers.cna) ? j.containers.cna : {};
    var latestId = await csClient.getCveId(cveId);
    var isReserved = latestId && latestId.state == 'RESERVED';
    var ret = null;
    if (isReserved) {
        if (cveState == 'REJECTED') {
            ret = await csClient.createRejectedCve(cveId, { cnaContainer: cnaContainer });
        } else {
            ret = await csClient.createCve(cveId, { cnaContainer: cnaContainer });
        }
    } else {
        if (cveState == 'REJECTED') {
            ret = await csClient.updateRejectedCve(cveId, { cnaContainer: cnaContainer });
        } else {
            ret = await csClient.updateCve(cveId, { cnaContainer: cnaContainer });
        }
    }
    j.cveMetadata.state = cveState;
    return {
        response: ret,
        doc: j
    };
}

async function cvePublishItems(items, onStatus, options) {
    var docs = Array.isArray(items) ? items : [];
    var notify = typeof onStatus === 'function' ? onStatus : function () { };
    var opts = options || {};
    var summary = {
        total: docs.length,
        published: 0,
        failed: 0,
        skipped: 0
    };
    if (docs.length == 0) {
        return summary;
    }
    var hasSession = await cveEnsurePublishSession();
    if (!hasSession) {
        summary.skipped = docs.length;
        docs.forEach(function (entry) {
            notify(entry, 'skipped', 'No active CVE Services session');
        });
        return summary;
    }
    for (var i = 0; i < docs.length; i++) {
        var entry = docs[i];
        var doc = entry ? entry.doc : null;
        var id = entry && entry.id ? entry.id : (doc && doc.cveMetadata ? doc.cveMetadata.cveId : null);
        if (!doc || !id) {
            summary.skipped++;
            notify(entry, 'skipped', 'Missing draft document');
            continue;
        }
        notify(entry, 'publishing', 'Publishing');
        try {
            var publishResult = await cveSubmitDocToPortal(doc);
            var ret = publishResult ? publishResult.response : null;
            if (ret == null) {
                throw new Error('No response from CVE Services. Please try again.');
            }
            summary.published++;
            var publishMessage = ret && ret.message ? ret.message : ('Successfully submitted ' + id);
            notify(entry, 'published', publishMessage, ret);
            if (opts.removeDrafts && typeof draftsCache !== 'undefined' && draftsCache && draftsCache.remove) {
                draftsCache.cancelSave();
                await draftsCache.remove(id);
            }
        } catch (e) {
            summary.failed++;
            notify(entry, 'failed', cvePublishErrorMessage(e), e);
        }
    }
    return summary;
}

async function cvePost() {
    var vr = filterADP(docEditor.validation_results);
    if (vr && vr.length == 0) {
        if (!(await cveEnsurePublishSession())) {
            return;
        }
        /*if (save != undefined) {
            await save();
        }*/
        try {
            //if (csCache.portalType === 'test') {
                //console.log('uploading...');
                var j = await mainTabGroup.getValue();
                /*var pts = j.containers.cna.problemTypes;
                if(pts && pts.length == 1 && pts[0].descriptions && pts[0].descriptions[0].description == undefined) {
                    delete j.containers.cna.problemTypes;
                } 
                var ims = j.containers.cna.impacts;
                if(ims && ims.length == 1 && ims[0].descriptions && ims[0].descriptions[0].value == undefined) {
                    delete j.containers.cna.impacts;
                }*/
                var ret = null;
                var publishErrorShown = false;
                try {
                    var publishResult = await cveSubmitDocToPortal(j);
                    j = publishResult.doc;
                    ret = publishResult.response;
                } catch (e) {
                    //console.log('Got error');
                    //console.log(e);
                    console.error('Error publishing CVE record:', e);
                    if (e && e.error) {
                        if (typeof infoMsg !== 'undefined' && infoMsg) {
                            infoMsg.innerText = "";
                        }
                        if (e.details && e.details.errors && e.details.errors.length > 0) {
                            if (typeof showJSONerrors === 'function') {
                                showJSONerrors(e.details.errors.map(
                                    a => {
                                        return ({
                                            path: transatePath(a.instancePath),
                                            message: a.message
                                        });
                                    }
                                ));
                            } else {
                                await cveShowError(e);
                            }
                        } else {
                            await cveShowError(e);
                        }
                    } else {
                        cveAlert("Error publishing CVE", cvePublishErrorMessage(e));
                    }
                    publishErrorShown = true;
                }
                //console.log(ret);
                if (ret != null) {
                    var publishMessage = ret.message ? ret.message : "Successfully submitted " + j.cveMetadata.cveId;
                    cveAlert("CVE Record is Published", publishMessage, 10000);
                    var a = document.createElement('a');
                    a.setAttribute('href', (csCache.portalType == 'test'? 'https://test.cve.org/cverecord?id=' :  'https://www.cve.org/cverecord?id=')+j.cveMetadata.cveId);
                    a.setAttribute('target', '_blank');
                    a.innerText = j.cveMetadata.cveId;
                    if (typeof infoMsg !== 'undefined' && infoMsg) {
                        infoMsg.innerText = '';
                        infoMsg.appendChild(a);
                    }
                    if (typeof hideJSONerrors === 'function') {
                        hideJSONerrors();
                    }
                    if (typeof draftsCache !== 'undefined' && draftsCache && draftsCache.remove) {
                        draftsCache.cancelSave();
                        await draftsCache.remove(j.cveMetadata.cveId);
                    }
                } else if (!publishErrorShown) {
                    cveAlert("Error publishing CVE", "No response from CVE Services. Please try again.");
                }
            //} else {
            //    showAlert('CVE posting is not currently supported by production CVE services! Try Logging to Test Portal instance');
            //}
        } catch (e) {
            portalErrorHandler(e);
        }
    } else {
        cveAlert('Please fill the required fields');
    }
}

function cveTeamGetRowById(cveId) {
    if (!cveId) {
        return null;
    }
    var rowById = document.getElementById('vgListItem' + cveId);
    if (rowById) {
        return rowById;
    }
    var checks = document.querySelectorAll('#vgListTable .rowCheck');
    for (var i = 0; i < checks.length; i++) {
        if (checks[i].value == cveId) {
            return checks[i].closest('tr');
        }
    }
    return null;
}

function cveTeamGetStatusNode(cveId, createIfMissing) {
    var row = cveTeamGetRowById(cveId);
    if (!row) {
        return null;
    }
    var idCell = row.querySelector('td.ID');
    if (!idCell) {
        var cells = row.querySelectorAll('td');
        if (cells.length > 1) {
            idCell = cells[1];
        }
    }
    if (!idCell) {
        return null;
    }
    var statusNode = idCell.querySelector('.teamPublishState');
    if (!statusNode && createIfMissing) {
        statusNode = document.createElement('small');
        statusNode.className = 'teamPublishState block sml';
        idCell.appendChild(statusNode);
    }
    return statusNode;
}

function cveTeamSetRowStatus(cveId, text, isError) {
    var statusNode = cveTeamGetStatusNode(cveId, !!text);
    if (!statusNode) {
        return;
    }
    if (!text) {
        statusNode.remove();
        return;
    }
    statusNode.innerText = text;
    if (isError) {
        statusNode.classList.add('tred');
    } else {
        statusNode.classList.remove('tred');
    }
}

var cveDraftPublishEntries = [];
var cveDraftPublishStatusMap = {};

function cveDraftExtractTitle(doc) {
    if (!doc || !doc.containers || !doc.containers.cna) {
        return '';
    }
    var cna = doc.containers.cna;
    if (cna.title) {
        return String(cna.title);
    }
    if (typeof getBestTitle === 'function') {
        try {
            return String(getBestTitle(cna) || '');
        } catch (e) {
            // ignore and continue with fallback
        }
    }
    if (Array.isArray(cna.descriptions)) {
        var desc = cna.descriptions.find(function (d) {
            return d && d.value && (!d.lang || d.lang == 'en');
        });
        if (desc && desc.value) {
            return String(desc.value);
        }
    }
    return '';
}

function cveDraftExtractCvss(doc) {
    if (!doc || !doc.containers || !doc.containers.cna || !Array.isArray(doc.containers.cna.metrics)) {
        return '';
    }
    var seen = {};
    var scores = [];
    var metricKeys = ['cvssV4_0', 'cvssV3_1', 'cvssV3_0', 'cvssV2_0'];
    doc.containers.cna.metrics.forEach(function (metric) {
        if (!metric || typeof metric !== 'object') {
            return;
        }
        metricKeys.forEach(function (key) {
            var cvss = metric[key];
            if (!cvss || cvss.baseScore === undefined || cvss.baseScore === null || cvss.baseScore === '') {
                return;
            }
            var version = cvss.version ? String(cvss.version) : key.replace('cvssV', '').replace('_', '.');
            var score = String(cvss.baseScore);
            var value = 'v' + version + ':' + score;
            if (cvss.baseSeverity) {
                value += ' ' + String(cvss.baseSeverity);
            }
            if (seen[value]) {
                return;
            }
            seen[value] = true;
            scores.push(value);
        });
    });
    return scores.join(', ');
}

function cveDraftCanPublish(entry) {
    if (!entry || !entry.doc || !entry.id) {
        return false;
    }
    if ((typeof entry.errorCount === 'number' ? entry.errorCount : 0) !== 0) {
        return false;
    }
    return !!(entry.doc.cveMetadata && entry.doc.cveMetadata.cveId);
}

function cveDraftPublishSetStatus(entryId, text, isError) {
    cveDraftPublishStatusMap[entryId] = {
        text: text || '',
        isError: !!isError
    };
    var statusCell = document.getElementById('draftPublishState-' + entryId);
    if (!statusCell) {
        return;
    }
    statusCell.innerText = text || '';
    if (isError) {
        statusCell.classList.add('tred');
    } else {
        statusCell.classList.remove('tred');
    }
}

function cveDraftPublishSetSummary(text, isError) {
    var msg = document.getElementById('draftPublishStatus');
    if (!msg) {
        return;
    }
    msg.innerText = text || '';
    if (isError) {
        msg.classList.add('tred');
    } else {
        msg.classList.remove('tred');
    }
}

function cveDraftPublishToggleAll(checkAll) {
    var rows = document.querySelectorAll('#draftPublishRows input[name="draftPublishSelection"]');
    rows.forEach(function (el) {
        if (!el.disabled) {
            el.checked = !!checkAll;
        }
    });
}

async function cveRefreshDraftPublishDialog() {
    if (!soloMode) {
        return;
    }
    if (typeof draftsCache === 'undefined' || !draftsCache || !draftsCache.getAll) {
        cveDraftPublishSetSummary('Draft cache is unavailable.', true);
        return;
    }
    var tbody = document.getElementById('draftPublishRows');
    if (!tbody) {
        return;
    }
    cveDraftPublishSetSummary('Loading drafts...');
    try {
        var entries = await draftsCache.getAll();
        entries = (entries || []).filter(function (entry) {
            return entry && entry.id && entry.doc;
        });
        entries.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
        cveDraftPublishEntries = entries;
        var nextStatusMap = {};
        entries.forEach(function (entry) {
            if (entry && entry.id && cveDraftPublishStatusMap[entry.id]) {
                nextStatusMap[entry.id] = cveDraftPublishStatusMap[entry.id];
            }
        });
        cveDraftPublishStatusMap = nextStatusMap;
        tbody.textContent = '';
        if (entries.length == 0) {
            var emptyRow = document.createElement('tr');
            var emptyCell = document.createElement('td');
            emptyCell.colSpan = 7;
            emptyCell.innerText = 'No drafts found in local cache.';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
            cveDraftPublishSetSummary('No drafts found.');
            return;
        }
        var readyCount = 0;
        entries.forEach(function (entry) {
            var canPublish = cveDraftCanPublish(entry);
            if (canPublish) {
                readyCount++;
            }
            var tr = document.createElement('tr');

            var tdSelect = document.createElement('td');
            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.name = 'draftPublishSelection';
            cb.value = entry.id;
            cb.disabled = !canPublish;
            cb.checked = canPublish;
            tdSelect.appendChild(cb);
            tr.appendChild(tdSelect);

            var tdId = document.createElement('td');
            tdId.innerText = entry.id;
            tr.appendChild(tdId);

            var tdTitle = document.createElement('td');
            var title = cveDraftExtractTitle(entry.doc);
            tdTitle.innerText = title || '';
            if (title) {
                tdTitle.title = title;
            }
            tr.appendChild(tdTitle);

            var tdCvss = document.createElement('td');
            tdCvss.innerText = cveDraftExtractCvss(entry.doc);
            tr.appendChild(tdCvss);

            var tdWarn = document.createElement('td');
            var warningCount = typeof entry.errorCount === 'number' ? entry.errorCount : 0;
            tdWarn.innerText = warningCount;
            tr.appendChild(tdWarn);

            var tdTime = document.createElement('td');
            if (entry.updatedAt) {
                var updatedAt = new Date(entry.updatedAt);
                if (typeof textUtil !== 'undefined' && textUtil && typeof textUtil.formatFriendlyDate === 'function') {
                    tdTime.innerText = textUtil.formatFriendlyDate(updatedAt);
                } else {
                    tdTime.innerText = updatedAt.toISOString();
                }
            }
            tr.appendChild(tdTime);

            var tdStatus = document.createElement('td');
            tdStatus.id = 'draftPublishState-' + entry.id;
            var status = cveDraftPublishStatusMap[entry.id];
            if (status && status.text) {
                tdStatus.innerText = status.text;
                if (status.isError) {
                    tdStatus.classList.add('tred');
                }
            } else {
                tdStatus.innerText = canPublish ? 'Ready' : 'Needs 0 warnings';
            }
            tr.appendChild(tdStatus);
            tbody.appendChild(tr);
        });
        cveDraftPublishSetSummary('Found ' + entries.length + ' drafts. Ready to publish: ' + readyCount + '.');
    } catch (e) {
        cveDraftPublishSetSummary(cvePublishErrorMessage(e), true);
    }
}

async function cveOpenDraftPublishDialog(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    if (!soloMode) {
        return false;
    }
    var dialog = document.getElementById('draftPublishDialog');
    if (!dialog) {
        return false;
    }
    await cveRefreshDraftPublishDialog();
    if (!dialog.open) {
        dialog.showModal();
    }
    return false;
}

async function cvePublishSelectedDrafts(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    if (!soloMode) {
        return false;
    }
    var selected = Array.from(document.querySelectorAll('#draftPublishRows input[name="draftPublishSelection"]:checked'))
        .map(function (el) { return el.value; });
    if (selected.length == 0) {
        cveDraftPublishSetSummary('Select one or more drafts with 0 warnings.', true);
        return false;
    }
    var selectedSet = new Set(selected);
    var items = cveDraftPublishEntries.filter(function (entry) {
        return selectedSet.has(entry.id) && cveDraftCanPublish(entry);
    }).map(function (entry) {
        return { id: entry.id, doc: entry.doc };
    });
    if (items.length == 0) {
        cveDraftPublishSetSummary('No publishable drafts selected.', true);
        return false;
    }
    cveDraftPublishSetSummary('Publishing ' + items.length + ' draft(s)...');
    var summary = await cvePublishItems(items, function (entry, state, message) {
        if (!entry || !entry.id) {
            return;
        }
        if (state == 'publishing') {
            cveDraftPublishSetStatus(entry.id, 'Publishing...');
        } else if (state == 'published') {
            cveDraftPublishSetStatus(entry.id, 'Published');
        } else if (state == 'failed') {
            cveDraftPublishSetStatus(entry.id, message, true);
        } else if (state == 'skipped') {
            cveDraftPublishSetStatus(entry.id, message, true);
        }
    }, { removeDrafts: true });
    await cveRefreshDraftPublishDialog();
    if (summary.skipped == summary.total && summary.total > 0 && summary.failed == 0 && summary.published == 0) {
        cveDraftPublishSetSummary('Login required to publish selected drafts.', true);
    } else if (summary.failed > 0) {
        cveDraftPublishSetSummary('Published ' + summary.published + ' of ' + summary.total + '. Failed: ' + summary.failed + '.', true);
    } else {
        cveDraftPublishSetSummary('Successfully published ' + summary.published + ' draft(s).');
    }
    return false;
}

async function cveReserveAndRender(yearOffset, number) {
    try {
        var r = await cveReserve(yearOffset, number);
        var m = document.getElementById("cveStatusMessage");
        if (m && r && r.length > 0) {
            m.innerText = "Got " + r.map(x => x.cve_id).join(', ');
        } else {
            m.innerText = "Failed to get a CVE ID";
        }
        cvePortalFilter.reset();
        await cveGetList();
        return r;
    } catch (e) {
        portalErrorHandler(e);
    }
}
