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
var cvePortalFilterChoice = {
    fstate: 'RESERVED',
    y: null
};

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
    setPortalSidebarState(true);
    var portalFeedback = new feedback(document.getElementById('port'), 'spinner');
    showPortalViewOrLogin()
        .finally(function () {
            portalFeedback.cancel();
        });
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
        var filterForm = document.getElementById("cvePortalFilter");
        if (filterForm) {
            if (filterForm.fstate) {
                cvePortalFilterChoice.fstate = filterForm.fstate.value + '';
            }
            if (filterForm.y && filterForm.y.value) {
                cvePortalFilterChoice.y = filterForm.y.value + '';
            }
        }
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
            filterState: cvePortalFilterChoice.fstate,
            filterYear: cvePortalFilterChoice.y ? cvePortalFilterChoice.y : (
                typeof currentYear !== 'undefined' ? (currentYear + '') : ((new Date()).getFullYear() + '')
            ),
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
        var loginErrNode = document.getElementById("loginErr");
        if (!loginErrNode && csClient && typeof csClient.logout === 'function') {
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
    const f = document.getElementById('userEditForm');
    const userEditDialog = document.getElementById('userEditDialog');
    if (!elem || !f || !userEditDialog) {
        cveShowError({ error: 'UI_ERROR', message: 'User edit form is unavailable on this page.' });
        return;
    }
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
    userEditDialog.showModal();
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
    var cveListFeedback = new feedback(document.getElementById('cveList'), 'spinner');
    var filter = {
        state: 'RESERVED',
        cve_id_year: currentYear
    }
    var cveForm = document.getElementById("cvePortalFilter");
    if (cveForm) {
        if (cveForm.fstate) {
            cvePortalFilterChoice.fstate = cveForm.fstate.value + '';
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
            cvePortalFilterChoice.y = filter.cve_id_year;
            if (filter.cve_id_year != currentYear) {
                currentReserved = false;
            }
        }
        if (cveForm.page) {
            filter.page = cveForm.page;
        }
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
    } finally {
        cveListFeedback.cancel();
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
    var loadFeedback = new feedback(document.getElementById('load1'), 'text', 'Loading...');
    try {
        await cveLoad(event.target.elements.id.value);
    } catch (e) {
        portalErrorHandler(e);
        cveShowError('Please login to CVE Portal. Your session may have expired!');
    } finally {
        loadFeedback.cancel();
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
    var loadFeedback = new feedback(document.getElementById('editorContent'), 'spinner');
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
    } finally {
        loadFeedback.cancel();
    }
    return null;
}


async function cveLoad(cveId) {
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

var cvePublishPreviewSections = [
    { id: 'identity', label: 'Publisher details', keys: ['providerMetadata', 'url', 'datePublic'], renderer: 'identity' },
    { id: 'summary', label: 'Summary', keys: ['title', 'descriptions', 'rejectedReasons', 'tags'], renderer: 'summary' },
    { id: 'metrics', label: 'Metrics', keys: ['metrics', 'KEV'], renderer: 'metrics' },
    { id: 'configurations', label: 'Required configuration', keys: ['configurations'], renderer: 'configurations' },
    { id: 'problemTypes', label: 'Problem types', keys: ['problemTypes'], renderer: 'problemTypes' },
    { id: 'impacts', label: 'Impacts', keys: ['impacts'], renderer: 'impacts' },
    { id: 'exploits', label: 'Exploits', keys: ['exploits'], renderer: 'exploits' },
    { id: 'affected', label: 'Affected products', keys: ['affected'], renderer: 'affected' },
    { id: 'cpeApplicability', label: 'CPE applicability', keys: ['cpeApplicability'], renderer: 'cpeApplicability' },
    { id: 'solutions', label: 'Solutions', keys: ['solutions'], renderer: 'solutions' },
    { id: 'workarounds', label: 'Workarounds', keys: ['workarounds'], renderer: 'workarounds' },
    { id: 'credits', label: 'Credits', keys: ['credits'], renderer: 'credits' },
    { id: 'timeline', label: 'Timeline', keys: ['timeline'], renderer: 'timeline' },
    { id: 'references', label: 'References', keys: ['references'], renderer: 'references' }
];

function cveDeepEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (a == null || b == null) {
        return a === b;
    }
    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i++) {
            if (!cveDeepEqual(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    if (typeof a === 'object' || typeof b === 'object') {
        if (typeof a !== 'object' || typeof b !== 'object') {
            return false;
        }
        var aKeys = Object.keys(a).sort();
        var bKeys = Object.keys(b).sort();
        if (aKeys.length !== bKeys.length) {
            return false;
        }
        for (var j = 0; j < aKeys.length; j++) {
            if (aKeys[j] !== bKeys[j]) {
                return false;
            }
            if (!cveDeepEqual(a[aKeys[j]], b[bKeys[j]])) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function cveSubsetContainer(container, keys) {
    var subset = {};
    if (!container || !Array.isArray(keys)) {
        return subset;
    }
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (Object.prototype.hasOwnProperty.call(container, key)) {
            subset[key] = cveCloneDoc(container[key]);
        }
    }
    return subset;
}

function cveBuildRenderableContainer(rawCon, cveMeta, sourceType) {
    var con = cveCloneDoc(rawCon || {}) || {};
    var meta = cveMeta || {};
    var providerMetadata = con && con.providerMetadata ? con.providerMetadata : {};
    con.containerType = sourceType;
    con.state = meta.state;
    con.cveId = meta.cveId;
    con.dateUpdated = providerMetadata.dateUpdated;
    con.shortName = providerMetadata.shortName || con.shortName;
    con.cvssList = [];
    if (typeof versionStatusTable5 === 'function' && con.affected) {
        con.pvstatus = versionStatusTable5(con.affected);
    } else {
        con.pvstatus = null;
    }
    if (con.metrics && con.metrics.length > 0) {
        for (var i = 0; i < con.metrics.length; i++) {
            var metric = con.metrics[i];
            var cvss = metric.cvssV4_0 ? metric.cvssV4_0 : metric.cvssV3_1 ? metric.cvssV3_1 : metric.cvssV3_0 ? metric.cvssV3_0 : metric.cvssV2_0 ? metric.cvssV2_0 : null;
            if (cvss) {
                var cvssCopy = {};
                Object.assign(cvssCopy, cvss);
                cvssCopy.scenarios = metric.scenarios;
                con.cvssList.push(cvssCopy);
            }
        }
    }
    return con;
}

function cveSelectPublishContainer(doc, targetType, orgId) {
    if (!doc || !doc.containers) {
        return null;
    }
    if (targetType == 'adp') {
        var adp = Array.isArray(doc.containers.adp) ? doc.containers.adp : [];
        for (var i = 0; i < adp.length; i++) {
            if (adp[i] && adp[i].providerMetadata && adp[i].providerMetadata.orgId == orgId) {
                return adp[i];
            }
        }
        return null;
    }
    return doc.containers.cna ? doc.containers.cna : null;
}

async function cveFetchCurrentPortalDoc(cveId) {
    try {
        var currentDoc = await csClient.getCve(cveId);
        if (currentDoc && currentDoc.containers) {
            currentDoc = cveFixForVulnogram(currentDoc);
        }
        return cvePreparePublishDoc(currentDoc);
    } catch (e) {
        if (e == '404' || (e && e.error == 'CVE_RECORD_DNE')) {
            return null;
        }
        throw e;
    }
}

function cvePublishPreviewRowState(currentSubset, nextSubset) {
    var hasCurrent = Object.keys(currentSubset).length > 0;
    var hasNext = Object.keys(nextSubset).length > 0;
    if (!hasCurrent && hasNext) {
        return 'added';
    }
    if (hasCurrent && !hasNext) {
        return 'removed';
    }
    return 'changed';
}

function cvePublishPreviewStateLabel(state) {
    if (state == 'added') {
        return 'Added';
    }
    if (state == 'removed') {
        return 'Removed';
    }
    return 'Changed';
}

function cvePublishPreviewLabel(fieldName) {
    if (!fieldName) {
        return 'Field';
    }
    var pretty = String(fieldName).replace(/^x_/, 'x ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
    return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

function cveBuildPublishPreviewPatch(currentSubset, nextSubset) {
    var compare = typeof window !== 'undefined' && window.jsonpatch && typeof window.jsonpatch.compare === 'function'
        ? window.jsonpatch.compare
        : (typeof jsonpatch !== 'undefined' && jsonpatch && typeof jsonpatch.compare === 'function' ? jsonpatch.compare : null);
    return compare ? compare(currentSubset || {}, nextSubset || {}) : [];
}

function cveBuildPublishPreviewRows(currentContainer, nextContainer, currentMeta, nextMeta, targetType) {
    var rows = [];
    var usedKeys = {};
    var current = currentContainer || {};
    var next = nextContainer || {};
    for (var i = 0; i < cvePublishPreviewSections.length; i++) {
        var section = cvePublishPreviewSections[i];
        var currentSubset = cveSubsetContainer(current, section.keys);
        var nextSubset = cveSubsetContainer(next, section.keys);
        if (cveDeepEqual(currentSubset, nextSubset)) {
            continue;
        }
        section.keys.forEach(function (key) {
            usedKeys[key] = true;
        });
        var currentHasData = Object.keys(currentSubset).length > 0;
        var nextHasData = Object.keys(nextSubset).length > 0;
        var state = cvePublishPreviewRowState(currentSubset, nextSubset);
        rows.push({
            id: section.id,
            fieldName: section.keys[0],
            label: section.label,
            renderer: section.renderer,
            state: state,
            stateLabel: cvePublishPreviewStateLabel(state),
            currentHasData: currentHasData,
            nextHasData: nextHasData,
            patch: state == 'changed' ? cveBuildPublishPreviewPatch(currentSubset, nextSubset) : [],
            currentContainer: currentHasData ? cveBuildRenderableContainer(currentSubset, currentMeta, targetType) : {},
            nextContainer: nextHasData ? cveBuildRenderableContainer(nextSubset, nextMeta, targetType) : {}
        });
    }

    var keySet = {};
    Object.keys(current).forEach(function (key) {
        keySet[key] = true;
    });
    Object.keys(next).forEach(function (key) {
        keySet[key] = true;
    });
    var extraKeys = Object.keys(keySet).filter(function (key) {
        return !usedKeys[key];
    }).sort();
    for (var j = 0; j < extraKeys.length; j++) {
        var fieldName = extraKeys[j];
        var currentSubset = cveSubsetContainer(current, [fieldName]);
        var nextSubset = cveSubsetContainer(next, [fieldName]);
        if (cveDeepEqual(currentSubset, nextSubset)) {
            continue;
        }
        var currentHasData = Object.keys(currentSubset).length > 0;
        var nextHasData = Object.keys(nextSubset).length > 0;
        var state = cvePublishPreviewRowState(currentSubset, nextSubset);
        rows.push({
            id: fieldName,
            fieldName: fieldName,
            label: cvePublishPreviewLabel(fieldName),
            renderer: 'json',
            state: state,
            stateLabel: cvePublishPreviewStateLabel(state),
            currentHasData: currentHasData,
            nextHasData: nextHasData,
            patch: state == 'changed' ? cveBuildPublishPreviewPatch(currentSubset, nextSubset) : [],
            currentContainer: currentHasData ? cveBuildRenderableContainer(currentSubset, currentMeta, targetType) : {},
            nextContainer: nextHasData ? cveBuildRenderableContainer(nextSubset, nextMeta, targetType) : {}
        });
    }
    return rows;
}

function cvePublishPreviewActionLabel(targetType, currentContainer, nextMeta, latestId) {
    if (targetType == 'adp') {
        return currentContainer ? 'Update ADP container' : 'Add ADP container';
    }
    var cveState = nextMeta && nextMeta.state == 'REJECTED' ? 'REJECTED' : 'PUBLISHED';
    var isReserved = latestId && latestId.state == 'RESERVED';
    if (isReserved) {
        return cveState == 'REJECTED' ? 'Create rejected CNA record' : 'Create CNA record';
    }
    return cveState == 'REJECTED' ? 'Update rejected CNA record' : 'Update CNA record';
}

async function cveBuildPublishPreview(doc, options) {
    var opts = options || {};
    var targetType = opts.targetType == 'adp' ? 'adp' : 'cna';
    var preparedDoc = cvePreparePublishDoc(doc);
    if (!preparedDoc || !preparedDoc.cveMetadata || !preparedDoc.cveMetadata.cveId) {
        throw new Error('Missing cveMetadata.cveId');
    }
    var cveId = preparedDoc.cveMetadata.cveId;
    var latestId = opts.latestId ? opts.latestId : await csClient.getCveId(cveId);
    var currentDoc = Object.prototype.hasOwnProperty.call(opts, 'currentDoc') ? opts.currentDoc : await cveFetchCurrentPortalDoc(cveId);
    var currentContainer = cveSelectPublishContainer(currentDoc, targetType, opts.orgId);
    var nextContainer = cveSelectPublishContainer(preparedDoc, targetType, opts.orgId);
    if (!nextContainer) {
        throw new Error(targetType == 'adp' ? 'Missing ADP container to publish.' : 'Missing CNA container to publish.');
    }
    var currentMeta = currentDoc && currentDoc.cveMetadata ? cveCloneDoc(currentDoc.cveMetadata) : {
        cveId: cveId,
        state: latestId ? latestId.state : undefined
    };
    var nextMeta = preparedDoc.cveMetadata ? cveCloneDoc(preparedDoc.cveMetadata) : { cveId: cveId };
    var rows = cveBuildPublishPreviewRows(currentContainer, nextContainer, currentMeta, nextMeta, targetType);
    var targetLabel = targetType == 'adp' ? 'ADP' : 'CNA';
    var actionLabel = cvePublishPreviewActionLabel(targetType, currentContainer, nextMeta, latestId);
    var changedLabel = rows.length == 1 ? '1 changed section' : rows.length + ' changed sections';
    return {
        preparedDoc: preparedDoc,
        currentDoc: {
            cveMetadata: currentMeta
        },
        nextDoc: {
            cveMetadata: nextMeta
        },
        cveId: cveId,
        rows: rows,
        currentLabel: 'Current CVE Services',
        nextLabel: 'Pending publish',
        title: 'Preview ' + targetLabel + ' Publish',
        confirmLabel: targetType == 'adp' ? 'Publish ADP' : 'Publish CVE',
        description: actionLabel + ' for ' + cveId + '. ' + changedLabel + ' will be sent to CVE Services.'
    };
}

async function cveBuildPublishPreviewList(doc) {
    var preparedDoc = cvePreparePublishDoc(doc);
    if (!preparedDoc || !preparedDoc.cveMetadata || !preparedDoc.cveMetadata.cveId) {
        return [];
    }
    var cveId = preparedDoc.cveMetadata.cveId;
    var latestId = await csClient.getCveId(cveId);
    var currentDoc = await cveFetchCurrentPortalDoc(cveId);
    var previews = [];
    if (preparedDoc.containers && preparedDoc.containers.cna) {
        previews.push(await cveBuildPublishPreview(preparedDoc, {
            targetType: 'cna',
            latestId: latestId,
            currentDoc: currentDoc
        }));
    }
    var adp = preparedDoc.containers && Array.isArray(preparedDoc.containers.adp) ? preparedDoc.containers.adp : [];
    var seenAdp = {};
    for (var i = 0; i < adp.length; i++) {
        var orgId = adp[i] && adp[i].providerMetadata ? adp[i].providerMetadata.orgId : null;
        if (!orgId || seenAdp[orgId]) {
            continue;
        }
        seenAdp[orgId] = true;
        previews.push(await cveBuildPublishPreview(preparedDoc, {
            targetType: 'adp',
            orgId: orgId,
            latestId: latestId,
            currentDoc: currentDoc
        }));
    }
    return previews;
}

function cveSetPublishChangesMessage(container, message, isError) {
    if (!container) {
        return;
    }
    container.innerHTML = '';
    var note = document.createElement('p');
    note.className = 'lbl bor rnd pad2 sec';
    if (isError) {
        note.className += ' tred';
    }
    note.innerText = message;
    container.appendChild(note);
}

function cvePreviewNormalizeText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
}

function cvePreviewMeaningfulChildren(node) {
    if (!node || !node.childNodes) {
        return [];
    }
    return Array.prototype.filter.call(node.childNodes, function (child) {
        return !(child && child.nodeType == 3 && cvePreviewNormalizeText(child.textContent) === '');
    });
}

function cvePreviewComparableAttrs(node) {
    if (!node || node.nodeType != 1 || !node.attributes) {
        return '';
    }
    var attrs = [];
    for (var i = 0; i < node.attributes.length; i++) {
        var attr = node.attributes[i];
        if (!attr || !attr.name) {
            continue;
        }
        if (attr.name == 'class' || attr.name == 'id' || attr.name.indexOf('data-publish-preview') == 0) {
            continue;
        }
        attrs.push(attr.name + '=' + attr.value);
    }
    return attrs.sort().join('|');
}

function cvePreviewNodeKey(node) {
    if (!node) {
        return '';
    }
    if (node.nodeType == 3) {
        return '#text';
    }
    if (node.nodeType != 1) {
        return String(node.nodeType);
    }
    return node.tagName + '|' + cvePreviewComparableAttrs(node);
}

function cvePreviewNodeSignature(node, cache) {
    if (!node) {
        return '';
    }
    if (cache && cache.has(node)) {
        return cache.get(node);
    }
    var sig = '';
    if (node.nodeType == 3) {
        sig = '#text|' + cvePreviewNormalizeText(node.textContent);
    } else if (node.nodeType == 1) {
        var children = cvePreviewMeaningfulChildren(node);
        sig = cvePreviewNodeKey(node) + '[' + (children.length > 0
            ? children.map(function (child) {
                return cvePreviewNodeSignature(child, cache);
            }).join('\u0001')
            : cvePreviewNormalizeText(node.textContent)) + ']';
    } else {
        sig = cvePreviewNodeKey(node);
    }
    if (cache) {
        cache.set(node, sig);
    }
    return sig;
}

function cvePreviewMarkNode(node, className) {
    var el = node && node.nodeType == 1 ? node : node && node.parentElement ? node.parentElement : null;
    if (el && el.classList) {
        el.classList.add(className);
    }
}

function cvePreviewReplaceTextNode(node, segments, className) {
    if (!node || node.nodeType != 3 || !node.parentNode || typeof document === 'undefined') {
        return false;
    }
    var frag = document.createDocumentFragment();
    for (var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        if (!segment || !segment.str) {
            continue;
        }
        if (segment.t == 1) {
            var span = document.createElement('span');
            span.className = className;
            span.textContent = segment.str;
            frag.appendChild(span);
        } else {
            frag.appendChild(document.createTextNode(segment.str));
        }
    }
    node.parentNode.insertBefore(frag, node);
    node.parentNode.removeChild(node);
    return true;
}

function cvePreviewApplyTextDiff(currentNode, nextNode) {
    if (!currentNode || !nextNode || currentNode.nodeType != 3 || nextNode.nodeType != 3) {
        return false;
    }
    if (typeof textUtil === 'undefined' || !textUtil || typeof textUtil.diffline !== 'function') {
        return false;
    }
    var diffs = textUtil.diffline(currentNode.textContent || '', nextNode.textContent || '');
    return cvePreviewReplaceTextNode(currentNode, diffs.lhs, 'yel') && cvePreviewReplaceTextNode(nextNode, diffs.rhs, 'grn');
}

function cvePreviewMarkSubtree(node, className) {
    if (!node) {
        return;
    }
    if (node.nodeType != 1) {
        cvePreviewMarkNode(node, className);
        return;
    }
    var marked = false;
    var all = node.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
        var el = all[i];
        if (!el || !el.classList) {
            continue;
        }
        if (el.children && el.children.length > 0) {
            continue;
        }
        if (cvePreviewNormalizeText(el.textContent) === '' && cvePreviewComparableAttrs(el) === '') {
            continue;
        }
        el.classList.add(className);
        marked = true;
    }
    if (!marked) {
        node.classList.add(className);
    }
}

function cvePreviewLcsPairs(currentNodes, nextNodes, tokenFn, cache) {
    var m = currentNodes.length;
    var n = nextNodes.length;
    if (m == 0 || n == 0) {
        return [];
    }
    var currentTokens = new Array(m);
    var nextTokens = new Array(n);
    for (var i = 0; i < m; i++) {
        currentTokens[i] = tokenFn(currentNodes[i], cache);
    }
    for (var j = 0; j < n; j++) {
        nextTokens[j] = tokenFn(nextNodes[j], cache);
    }
    var dp = new Array(m + 1);
    for (i = 0; i <= m; i++) {
        dp[i] = new Array(n + 1).fill(0);
    }
    for (i = m - 1; i >= 0; i--) {
        for (j = n - 1; j >= 0; j--) {
            dp[i][j] = currentTokens[i] == nextTokens[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }
    var pairs = [];
    i = 0;
    j = 0;
    while (i < m && j < n) {
        if (currentTokens[i] == nextTokens[j]) {
            pairs.push([i, j]);
            i++;
            j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            i++;
        } else {
            j++;
        }
    }
    return pairs;
}

function cvePreviewCompareNodeList(currentNodes, nextNodes, cache, tokenFn) {
    if (currentNodes.length == 0 && nextNodes.length == 0) {
        return true;
    }
    if (currentNodes.length == 0) {
        nextNodes.forEach(function (node) {
            cvePreviewMarkSubtree(node, 'grn');
        });
        return false;
    }
    if (nextNodes.length == 0) {
        currentNodes.forEach(function (node) {
            cvePreviewMarkSubtree(node, 'yel');
        });
        return false;
    }
    var pairs = cvePreviewLcsPairs(currentNodes, nextNodes, tokenFn, cache);
    if (!pairs.length) {
        var same = currentNodes.length == nextNodes.length;
        var shared = Math.min(currentNodes.length, nextNodes.length);
        for (var i = 0; i < shared; i++) {
            if (!cvePreviewCompareNodes(currentNodes[i], nextNodes[i], cache)) {
                same = false;
            }
        }
        for (i = shared; i < currentNodes.length; i++) {
            cvePreviewMarkSubtree(currentNodes[i], 'yel');
            same = false;
        }
        for (i = shared; i < nextNodes.length; i++) {
            cvePreviewMarkSubtree(nextNodes[i], 'grn');
            same = false;
        }
        return same;
    }
    var sameList = true;
    var currentIndex = 0;
    var nextIndex = 0;
    for (var p = 0; p < pairs.length; p++) {
        var pair = pairs[p];
        if (!cvePreviewCompareNodeList(currentNodes.slice(currentIndex, pair[0]), nextNodes.slice(nextIndex, pair[1]), cache, cvePreviewNodeKey)) {
            sameList = false;
        }
        if (!cvePreviewCompareNodes(currentNodes[pair[0]], nextNodes[pair[1]], cache)) {
            sameList = false;
        }
        currentIndex = pair[0] + 1;
        nextIndex = pair[1] + 1;
    }
    if (!cvePreviewCompareNodeList(currentNodes.slice(currentIndex), nextNodes.slice(nextIndex), cache, cvePreviewNodeKey)) {
        sameList = false;
    }
    return sameList;
}

function cvePreviewCompareNodes(currentNode, nextNode, cache) {
    if (!currentNode && !nextNode) {
        return true;
    }
    if (!currentNode || !nextNode) {
        if (currentNode) {
            cvePreviewMarkSubtree(currentNode, 'yel');
        }
        if (nextNode) {
            cvePreviewMarkSubtree(nextNode, 'grn');
        }
        return false;
    }
    if (cvePreviewNodeSignature(currentNode, cache) == cvePreviewNodeSignature(nextNode, cache)) {
        return true;
    }
    if (currentNode.nodeType != nextNode.nodeType) {
        cvePreviewMarkSubtree(currentNode, 'yel');
        cvePreviewMarkSubtree(nextNode, 'grn');
        return false;
    }
    if (currentNode.nodeType == 3) {
        if (!cvePreviewApplyTextDiff(currentNode, nextNode)) {
            cvePreviewMarkNode(currentNode, 'yel');
            cvePreviewMarkNode(nextNode, 'grn');
        }
        return false;
    }
    if (currentNode.tagName != nextNode.tagName) {
        cvePreviewMarkSubtree(currentNode, 'yel');
        cvePreviewMarkSubtree(nextNode, 'grn');
        return false;
    }
    var sameAttrs = cvePreviewComparableAttrs(currentNode) == cvePreviewComparableAttrs(nextNode);
    var currentChildren = cvePreviewMeaningfulChildren(currentNode);
    var nextChildren = cvePreviewMeaningfulChildren(nextNode);
    if (currentChildren.length == 0 && nextChildren.length == 0) {
        cvePreviewMarkNode(currentNode, 'yel');
        cvePreviewMarkNode(nextNode, 'grn');
        return false;
    }
    var sameChildren = cvePreviewCompareNodeList(currentChildren, nextChildren, cache, cvePreviewNodeSignature);
    if (!sameAttrs) {
        cvePreviewMarkNode(currentNode, 'yel');
        cvePreviewMarkNode(nextNode, 'grn');
    }
    return sameAttrs && sameChildren;
}

function cveHighlightPublishPreview(container) {
    if (!container || !container.querySelectorAll) {
        return;
    }
    var cache = new WeakMap();
    var rows = container.querySelectorAll('[data-publish-preview-row]');
    var patchRows = container.querySelectorAll('[data-publish-preview-patch-row]');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.getAttribute('data-publish-preview-state') != 'changed') {
            continue;
        }
        var current = row.querySelector('[data-publish-preview-content="current"]');
        var next = row.querySelector('[data-publish-preview-content="next"]');
        if (current && next) {
            var patchId = row.getAttribute('data-publish-preview-row');
            var patchRow = null;
            for (var j = 0; j < patchRows.length; j++) {
                if (patchRows[j].getAttribute('data-publish-preview-patch-row') == patchId) {
                    patchRow = patchRows[j];
                    break;
                }
            }
            if ((typeof current.isEqualNode === 'function' && current.isEqualNode(next)) || current.innerHTML == next.innerHTML) {
                if (patchRow) {
                    row.hidden = true;
                    patchRow.hidden = false;
                }
                continue;
            }
            var hasVisibleDiff = !cvePreviewCompareNodes(current, next, cache);
            if (!hasVisibleDiff && patchRow) {
                row.hidden = true;
                patchRow.hidden = false;
            }
        }
    }
}

async function cveRenderPublishChanges(doc) {
    var container = document.getElementById('unSavedChanges');
    if (!container) {
        return;
    }
    if (!doc || !doc.cveMetadata || !doc.cveMetadata.cveId) {
        cveSetPublishChangesMessage(container, 'Load a CVE record to compare publish changes.', false);
        return;
    }
    if (typeof pugRender !== 'function') {
        cveSetPublishChangesMessage(container, 'Preview renderer is not available.', true);
        return;
    }
    cveSetPublishChangesMessage(container, 'Loading publish changes...', false);
    try {
        await ensurePortalBootstrap();
    } catch (e) {
        cveSetPublishChangesMessage(container, cvePublishErrorMessage(e), true);
        return;
    }
    var hasSession = false;
    try {
        hasSession = await hasActivePortalSession(csCache.url);
    } catch (e) {
        cveSetPublishChangesMessage(container, cvePublishErrorMessage(e), true);
        return;
    }
    if (!hasSession) {
        cveSetPublishChangesMessage(container, 'Login to CVE Services to compare against the current record.', false);
        return;
    }
    try {
        var previews = await cveBuildPublishPreviewList(doc);
        container.innerHTML = '';
        if (!previews.length) {
            cveSetPublishChangesMessage(container, 'No publishable CNA or ADP containers found in this record.', false);
            return;
        }
        container.innerHTML = previews.map(function (preview) {
            return pugRender({
                renderTemplate: 'publishPreviewPanel',
                doc: preview
            });
        }).join('');
        cveHighlightPublishPreview(container);
    } catch (e) {
        cveSetPublishChangesMessage(container, cvePublishErrorMessage(e), true);
    }
}

async function cveShowPublishPreviewDialog(preview) {
    if (typeof window === 'undefined') {
        return true;
    }
    var fallbackMessage = preview && preview.description ? preview.description : 'Publish changes to CVE Services?';
    if (typeof pugRender !== 'function') {
        return window.confirm(fallbackMessage);
    }
    var dialog = document.getElementById('publishPreviewDialog');
    var body = document.getElementById('publishPreviewBody');
    var title = document.getElementById('publishPreviewTitle');
    var summary = document.getElementById('publishPreviewSummary');
    var confirmButton = document.getElementById('publishPreviewConfirm');
    var cancelButton = document.getElementById('publishPreviewCancel');
    if (!dialog || !body || !title || !summary || !confirmButton || !cancelButton) {
        return window.confirm(fallbackMessage);
    }
    if (dialog.open) {
        dialog.close();
    }
    title.innerText = preview && preview.title ? preview.title : 'Publish Preview';
    summary.innerText = preview && preview.description ? preview.description : '';
    body.innerHTML = pugRender({
        renderTemplate: 'publishPreview',
        doc: preview || {}
    });
    cveHighlightPublishPreview(body);
    body.scrollTop = 0;
    confirmButton.innerText = preview && preview.confirmLabel ? preview.confirmLabel : 'Publish';
    return new Promise(function (resolve) {
        var state = { confirmed: false };
        function finish() {
            dialog.removeEventListener('close', finish);
            resolve(!!state.confirmed);
        }
        confirmButton.onclick = function () {
            state.confirmed = true;
            dialog.close();
        };
        cancelButton.onclick = function () {
            state.confirmed = false;
            dialog.close();
        };
        dialog.addEventListener('close', finish);
        dialog.showModal();
        confirmButton.focus();
    });
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
    try {
        var vr = filterADP(docEditor.validation_results);
        if (!(vr && vr.length == 0)) {
            cveAlert('Please fill the required fields');
            return;
        }
        if (!(await cveEnsurePublishSession())) {
            return;
        }
        var previewFeedback = new feedback(document.getElementById('post1'), 'text', 'Preparing preview...');
        var j = null;
        var preview = null;
        try {
            j = await mainTabGroup.getValue();
            preview = await cveBuildPublishPreview(j, { targetType: 'cna' });
            if (preview && preview.preparedDoc) {
                j = preview.preparedDoc;
            }
        } finally {
            previewFeedback.cancel();
        }
        if (!(await cveShowPublishPreviewDialog(preview))) {
            return;
        }

        var postFeedback = new feedback(document.getElementById('post1'), 'text', 'Posting...');
        try {
            var ret = null;
            var publishErrorShown = false;
            try {
                var publishResult = await cveSubmitDocToPortal(j);
                j = publishResult.doc;
                ret = publishResult.response;
            } catch (e) {
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
            if (ret != null) {
                var publishMessage = ret.message ? ret.message : "Successfully submitted " + j.cveMetadata.cveId;
                cveAlert("CVE Record is Published", publishMessage, 10000);
                var a = document.createElement('a');
                a.setAttribute('href', (csCache.portalType == 'test' ? 'https://test.cve.org/cverecord?id=' : 'https://www.cve.org/cverecord?id=') + j.cveMetadata.cveId);
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
        } finally {
            postFeedback.cancel();
        }
    } catch (e) {
        portalErrorHandler(e);
    }
}

function postADPSetButtonMessage(button, message, isError) {
    if (!button || !button.parentNode || !message) {
        return;
    }
    var msgNode = button._postAdpMsgNode;
    if (!msgNode || !msgNode.parentNode) {
        msgNode = document.createElement('small');
        msgNode.className = 'lbl sml bor vgi-info rnd shd wht';
        msgNode.style.marginLeft = '0.5em';
        button.insertAdjacentElement('afterend', msgNode);
        button._postAdpMsgNode = msgNode;
    }
    msgNode.innerText = message;
    if (isError) {
        msgNode.classList.add('tred');
    } else {
        msgNode.classList.remove('tred');
    }
    if (button._postAdpMsgTimer) {
        clearTimeout(button._postAdpMsgTimer);
    }
    button._postAdpMsgTimer = setTimeout(function () {
        if (msgNode && msgNode.parentNode) {
            msgNode.parentNode.removeChild(msgNode);
        }
        button._postAdpMsgNode = null;
        button._postAdpMsgTimer = null;
    }, 15000);
}

async function postADP(orgID, button) {
    try {
        if (!(await cveEnsurePublishSession())) {
            return;
        }
        var currentOrgId = csCache && csCache.orgInfo ? csCache.orgInfo.UUID : null;
        if (!currentOrgId) {
            csCache.orgInfo = await csClient.getOrgInfo();
            currentOrgId = csCache.orgInfo ? csCache.orgInfo.UUID : null;
        }
        if (currentOrgId != orgID && orgID != '00000000-0000-4000-9000-000000000000') {
            cveAlert('This ADP information is not from Current CNA');
            return;
        }
        var j = await mainTabGroup.getValue();
        var cveId = j && j.cveMetadata ? j.cveMetadata.cveId : null;
        var adp = j && j.containers && Array.isArray(j.containers.adp) ? j.containers.adp : [];
        var matches = adp.filter(function (a) {
            return a && a.providerMetadata && a.providerMetadata.orgId == orgID;
        });
        if (matches.length > 1) {
            cveAlert('Error posting ADP', 'Multiple ADP information found for this CNA. Delete extras and try again.');
            return;
        }
        if (matches.length == 1) {
            var previewFeedback = button ? new feedback(button, 'text', 'Preparing preview...') : null;
            var preview = null;
            var adpContainerToPublish = matches[0];
            try {
                preview = await cveBuildPublishPreview(j, { targetType: 'adp', orgId: orgID });
                if (preview && preview.preparedDoc) {
                    adpContainerToPublish = cveSelectPublishContainer(preview.preparedDoc, 'adp', orgID) || adpContainerToPublish;
                }
            } finally {
                if (previewFeedback) {
                    previewFeedback.cancel();
                }
            }
            if (!(await cveShowPublishPreviewDialog(preview))) {
                return;
            }
            var postFeedback = button ? new feedback(button, 'text', 'Posting ...') : null;
            try {
                var ret = await csClient.updateAdp(cveId, { adpContainer: adpContainerToPublish });
                postADPSetButtonMessage(button, (ret && ret.message) ? ret.message : 'ADP information posted.', false);
            } finally {
                if (postFeedback) {
                    postFeedback.cancel();
                }
            }
        }
    } catch (e) {
        var errorMessage = cvePublishErrorMessage(e);
        cveAlert('Error posting ADP', errorMessage);
        postADPSetButtonMessage(button, errorMessage, true);
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
    var titleCell = row.querySelector('td.title, td.Title, td.TITLE');
    if (!titleCell) {
        var cells = row.querySelectorAll('td');
        if (cells.length > 0) {
            var logicalTitleIndex = row.querySelector('td.rowCheckLabel') ? 2 : 1;
            if (cells.length > logicalTitleIndex) {
                titleCell = cells[logicalTitleIndex];
            }
        }
    }
    if (!titleCell) {
        return null;
    }
    var statusNode = titleCell.querySelector('.teamPublishState');
    if (!statusNode && createIfMissing) {
        statusNode = document.createElement('small');
        statusNode.className = 'teamPublishState block sml';
        titleCell.appendChild(statusNode);
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
var cveDraftPublishRetainedRowsMap = {};
var cveDraftPublishTableSorter = null;

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
    var metricKeys = ['cvssV4_0', 'cvssV3_1', 'cvssV3_0', 'cvssV2_0'];
    for (var i = 0; i < doc.containers.cna.metrics.length; i++) {
        var metric = doc.containers.cna.metrics[i];
        if (!metric || typeof metric !== 'object') {
            continue;
        }
        for (var j = 0; j < metricKeys.length; j++) {
            var key = metricKeys[j];
            var cvss = metric[key];
            if (!cvss || cvss.baseScore === undefined || cvss.baseScore === null || cvss.baseScore === '') {
                continue;
            }
            var score = Number(cvss.baseScore);
            if (isNaN(score)) {
                continue;
            }
            var severity = cvssjs.severityLevel(score);
            var scoreText = String(cvss.baseScore);
            return '<b class="tag CVSS ' + severity + '">' + scoreText + '</b>';
        }
    }
    return '';
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
    if (!text) {
        delete cveDraftPublishStatusMap[entryId];
    } else {
        cveDraftPublishStatusMap[entryId] = {
            text: text,
            isError: !!isError
        };
    }
    var titleCell = document.getElementById('draftPublishTitle-' + entryId);
    if (!titleCell) {
        return;
    }
    var statusNode = titleCell.querySelector('.draftPublishState');
    if (!statusNode && text) {
        statusNode = document.createElement('small');
        statusNode.className = 'draftPublishState block sml';
        titleCell.appendChild(statusNode);
    }
    if (!statusNode) {
        return;
    }
    if (!text) {
        statusNode.remove();
        return;
    }
    var safeText = String(text).replace(/[&<>"']/g, function (ch) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch];
    });
    safeText = safeText.replace(/CVE-\d{4}-\d{4,12}/gi, function (idText) {
        var cveId = idText.toUpperCase();
        return '<a href="https://vulnogram.org/seaview/?' + encodeURIComponent(cveId) + '" target="_blank" rel="noopener noreferrer">' + cveId + '</a>';
    });
    statusNode.innerHTML = safeText;
    if (isError) {
        statusNode.classList.add('tred');
    } else {
        statusNode.classList.remove('tred');
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
        var entryById = {};
        entries.forEach(function (entry) {
            entryById[entry.id] = true;
        });
        var retainedEntries = Object.keys(cveDraftPublishRetainedRowsMap).map(function (id) {
            return cveDraftPublishRetainedRowsMap[id];
        }).filter(function (entry) {
            return entry && entry.id && !entryById[entry.id];
        });
        retainedEntries.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
        var allEntries = entries.concat(retainedEntries);
        var nextStatusMap = {};
        allEntries.forEach(function (entry) {
            if (entry && entry.id && cveDraftPublishStatusMap[entry.id]) {
                nextStatusMap[entry.id] = cveDraftPublishStatusMap[entry.id];
            }
        });
        cveDraftPublishStatusMap = nextStatusMap;
        tbody.textContent = '';
        if (allEntries.length == 0) {
            var emptyRow = document.createElement('tr');
            var emptyCell = document.createElement('td');
            emptyCell.colSpan = 7;
            emptyCell.innerText = 'No drafts found in local cache.';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
            var emptyTable = document.getElementById('draftPublishTable');
            if (!cveDraftPublishTableSorter) {
                cveDraftPublishTableSorter = new Tablesort(emptyTable);
            } else {
                cveDraftPublishTableSorter.refresh();
            }
            cveDraftPublishSetSummary('No drafts found.');
            return;
        }
        var readyCount = 0;
        allEntries.forEach(function (entry) {
            var isRetainedPublished = entry.retainedPublished === true;
            var warningCount = isRetainedPublished ? 0 : (typeof entry.errorCount === 'number' ? entry.errorCount : 0);
            var canPublish = !isRetainedPublished && cveDraftCanPublish(entry);
            if (canPublish) {
                readyCount++;
            }
            var tr = document.createElement('tr');
            if (warningCount > 0) {
                tr.classList.add('dis');
            }

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
            var idLink = document.createElement('a');
            idLink.className = 'lbl';
            idLink.innerText = entry.id;
            if (isRetainedPublished) {
                idLink.href = 'https://vulnogram.org/seaview/?' + encodeURIComponent(entry.id);
                idLink.target = '_blank';
                idLink.rel = 'noopener noreferrer';
                idLink.title = 'Open published CVE ' + entry.id + ' in seaview';
            } else {
                idLink.href = '#';
                idLink.title = 'Open draft ' + entry.id;
                idLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    idLink.closest('dialog').close();
                    draftsUi.toggle.checked = true;
                    loadDraftFromCache(entry.id, false);
                });
            }
            tdId.appendChild(idLink);
            var warningBadge = document.createElement('span');
            warningBadge.className = 'bdg';
            warningBadge.title = String(warningCount);
            warningBadge.innerText = String(warningCount);
            tdId.appendChild(document.createTextNode(' '));
            tdId.appendChild(warningBadge);
            tr.appendChild(tdId);

            var tdTitle = document.createElement('td');
            tdTitle.id = 'draftPublishTitle-' + entry.id;
            var title = cveDraftExtractTitle(entry.doc);
            tdTitle.innerText = title || '';
            if (title) {
                tdTitle.title = title;
            }
            var status = cveDraftPublishStatusMap[entry.id];
            if (status && status.text) {
                var titleStatus = document.createElement('small');
                titleStatus.className = 'draftPublishState block sml';
                var titleSafeText = String(status.text).replace(/[&<>"']/g, function (ch) {
                    return {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#39;'
                    }[ch];
                });
                titleSafeText = titleSafeText.replace(/CVE-\d{4}-\d{4,12}/gi, function (idText) {
                    var cveId = idText.toUpperCase();
                    return '<a href="https://vulnogram.org/seaview/?' + encodeURIComponent(cveId) + '" target="_blank" rel="noopener noreferrer">' + cveId + '</a>';
                });
                titleStatus.innerHTML = titleSafeText;
                if (status.isError) {
                    titleStatus.classList.add('tred');
                }
                tdTitle.appendChild(titleStatus);
            }
            tr.appendChild(tdTitle);

            var tdCvss = document.createElement('td');
            tdCvss.innerHTML = cveDraftExtractCvss(entry.doc);
            tr.appendChild(tdCvss);

            var tdPublicOn = document.createElement('td');
            var publicOn = entry && entry.doc && entry.doc.containers && entry.doc.containers.cna ? entry.doc.containers.cna.datePublic : null;
            if (publicOn) {
                var publicOnDate = new Date(publicOn);
                if (!isNaN(publicOnDate.getTime())) {
                    tdPublicOn.setAttribute('data-sort', String(publicOnDate.getTime()));
                    if (typeof textUtil !== 'undefined' && textUtil && typeof textUtil.formatFriendlyDate === 'function') {
                        tdPublicOn.innerText = textUtil.formatFriendlyDate(publicOnDate);
                    } else {
                        tdPublicOn.innerText = publicOnDate.toISOString();
                    }
                }
            }
            tr.appendChild(tdPublicOn);

            var tdTime = document.createElement('td');
            if (entry.updatedAt) {
                var updatedAt = new Date(entry.updatedAt);
                tdTime.setAttribute('data-sort', String(updatedAt.getTime()));
                if (typeof textUtil !== 'undefined' && textUtil && typeof textUtil.formatFriendlyDate === 'function') {
                    tdTime.innerText = textUtil.formatFriendlyDate(updatedAt);
                } else {
                    tdTime.innerText = updatedAt.toISOString();
                }
            }
            tr.appendChild(tdTime);

            var tdActions = document.createElement('td');
            tdActions.style.textAlign = 'right';
            if (!isRetainedPublished) {
                var deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'sbn fbn vgi-del';
                deleteBtn.title = 'Delete draft ' + entry.id;
                deleteBtn.setAttribute('aria-label', 'Delete draft ' + entry.id);
                deleteBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    cveDraftPublishSetStatus(entry.id, '');
                    cveDraftPublishSetSummary('Deleting draft ' + entry.id + '...');
                    draftsCache.cancelSave();
                    Promise.resolve(draftsCache.remove(entry.id)).then(function () {
                        return cveRefreshDraftPublishDialog();
                    }).then(function () {
                        cveDraftPublishSetSummary('Deleted draft ' + entry.id + '.');
                    }).catch(function (err) {
                        cveDraftPublishSetSummary(cvePublishErrorMessage(err), true);
                    });
                });
                tdActions.appendChild(deleteBtn);
            }
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
        var draftTable = document.getElementById('draftPublishTable');
        if (!cveDraftPublishTableSorter) {
            cveDraftPublishTableSorter = new Tablesort(draftTable);
        } else {
            cveDraftPublishTableSorter.refresh();
        }
        var summaryMessage = '';
        if (entries.length > 0) {
            summaryMessage = 'Found ' + entries.length + ' drafts. Ready to publish: ' + readyCount + '.' + (readyCount < entries.length ? ' Fix errors to publish the remaining.' : '');
        }
        if (retainedEntries.length > 0) {
            summaryMessage += (summaryMessage ? ' ' : '') + 'Published references: ' + retainedEntries.length + '.';
        }
        cveDraftPublishSetSummary(summaryMessage);
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
        cveDraftPublishSetSummary('Select one or more drafts with 0 errors.', true);
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
            cveDraftPublishRetainedRowsMap[entry.id] = {
                id: entry.id,
                doc: entry.doc,
                errorCount: 0,
                updatedAt: Date.now(),
                retainedPublished: true
            };
            var publishStatusMessage = message || ('Successfully submitted ' + entry.id);
            if (!/CVE-\d{4}-\d{4,12}/i.test(publishStatusMessage)) {
                publishStatusMessage += ' ' + entry.id;
            }
            cveDraftPublishSetStatus(entry.id, publishStatusMessage);
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
        var cveForm = document.getElementById("cvePortalFilter");
        if (cveForm) {
            if (cveForm.fstate) {
                cveForm.fstate.value = 'RESERVED';
            }
            var reservedState = document.getElementById("chkres");
            if (reservedState) {
                reservedState.checked = true;
            }
            if (cveForm.y) {
                cveForm.y.value = String(currentYear + (yearOffset ? yearOffset : 0));
            }
            cveForm.page = 0;
        }
        await cveGetList();
        return r;
    } catch (e) {
        portalErrorHandler(e);
    }
}
