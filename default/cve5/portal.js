//CVE Services Client and Portal GUI 

var csClient = undefined;

var csCache = {
    portalType: 'production',
    url: 'https://cveawg.mitre.org/api',
    org: null,
    user: null,
    orgInfo: null
}

async function initCsClient() {
    if ('serviceWorker' in navigator) {
        try {
            if (window.localStorage.getItem('cveApi')) {
                csCache = JSON.parse(window.localStorage.getItem('cveApi'));
            }
            if (!csCache.url) {
                csCache.url = 'https://cveawg.mitre.org/api';
            }
            csClient = new CveServices(csCache.url, "./static/cve5sw.js");
            listenforLogins();
            listenforLogouts();
            if (!csCache.user) {
                showPortalLogin();
                return;
            }
            await showPortalView();
        } catch (e) {
            portalErrorHandler(e);
        }
    } else {
        document.getElementById('port').innerHTML = '<h2 class="pad2 tred">Browser does not support Service Workers feature required for this tab.</h2><i class="indent pad2">Are you using Firefox in Private mode? Try normal mode.</i>';
//        console.log("Browser does not support Service Workers. Are you using Firefox in Private mode?")
        //cveShowError('Browser not supported!');
    }
}

function showPortalLogin(message) {
    csCache = {
        portalType: 'production',
        url: 'https://cveawg.mitre.org/api',
        org: null,
        user: null,
        orgInfo: null
    }
    window.localStorage.removeItem('cveApi');

    document.getElementById('port').innerHTML = cveRender({
        ctemplate: 'cveLoginBox',
        message: message,
        prevPortal: window.localStorage.getItem('portalType'),
        prevOrg: window.localStorage.getItem('shortName')
    })
}

async function portalLogout(message) {
    if (csClient != null) {
        await csClient.logout();
    }
    showPortalLogin(message);
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
        var button1 = document.getElementById('post1');
        if(button1) {
            if(csCache.portalType == 'test') {
                button1.innerText = 'Post to Test Portal'
            } else {
                button1.innerText = 'Post to CVE.org'
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
    }
}
function listenforLogouts() {
    logoutChannel.onmessage = function (a) {
        showPortalLogin(a.message);
    }
}

async function portalLogin(elem, credForm) {
    try {
        if (!'serviceWorker' in navigator) {
            cveShowError('Browser is missing required features. Try a different browser or the normal mode.')
            return (false);
        }
        if (!credForm.checkValidity()) {
            return (false);
        }
        elem.preventDefault();
        var url = credForm.portal.value;
        var portalType = credForm.portal.options[credForm.portal.selectedIndex].text;
        if (csClient && csCache.url != url) {
            csClient = new CveServices(url, "./static/cve5sw.js");
        }
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
        window.localStorage.setItem('shortName', credForm.org.value);

        if (ret == 'ok' || ret.data == "ok") {
            csCache.keyUrl = ret.keyUrl;
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
    if (e.error && (e.error == 'NO_SESSION' || e.error == 'UNAUTHORIZED' || e.error.message == 'Failed to fetch')) {
        if (e.error == 'UNAUTHORIZED') {
            e.message = "Valid credentials required"
        }
        if (e.error.message == 'Failed to fetch') {
            e.message = "Error connecting to service";
        }
        if (document.getElementById("loginErr")) {
            // Login screen exists
            document.getElementById("loginErr").innerText = e && e.message ? e.message : 'Valid credentials required!';
        } else {
            showPortalLogin(e.message);
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
    f.elements.forEach(x => {
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
    });
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
            var ret = await csClient.createOrgUser({
                "username": f.new_username.value,
                "name": {
                    "first": f.first.value,
                    "last": f.last.value
                },
                "authority": {
                    "active_roles": [
                        "ADMIN"
                    ]
                }
            });
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
        document.getElementById('cveList').innerHTML = cveRender({
            ctemplate: 'listIds',
            cveIds: l,
            editable: true//(csCache.portalType == 'test')
        })
        if (l.length > 0) {
            new Tablesort(document.getElementById('cveListTable'));
        }
        if (refreshEditor) {
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
    if ((err.error == 'NO_SESSION' || csClient == null || await csClient._middleware.worker == null)) {
        showPortalLogin();
        mainTabGroup.focus(4);
    }
    document.getElementById('cveErrors').innerHTML = cveRender({
        ctemplate: 'cveErrors',
        err: err
    })
    document.getElementById('cveErrorsModal').showModal();
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


async function cveLoad(cveId) {
    try {
        var res = await csClient.getCve(cveId);
        if (res.cveMetadata) {
            if (res.containers) {
                res = cveFixForVulnogram(res);
            } else {
                console.log('no containers');
            }
            var edOpts = (res.cveMetadata.state == 'REJECTED') ? rejectEditorOption : publicEditorOption;
            loadJSON(res, cveId, "Loaded " + cveId + " from CVE.org!", edOpts);

            mainTabGroup.change(0);
            return res;
        } else {
            errMsg.textContent = "Failed to load valid CVE Record";
            infoMsg.textContent = "";
        }
    } catch (e) {
        if (e == '404' || e.error == 'CVE_RECORD_DNE') {
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

                loadJSON(skeleton, cveId, "Loaded " + cveId, edOpts);
                mainTabGroup.change(0);
                return skeleton;
            } catch (e2) {
                if (e2 == '404') {
                    showAlert('CVE Not found!');
                }
            }
        } else {
            //console.log(e);
            portalErrorHandler(e);
        }
    }
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

async function cvePost() {
    if (docEditor.validation_results && docEditor.validation_results.length == 0) {
        /*if (save != undefined) {
            await save();
        }*/
        try {
            //if (csCache.portalType === 'test') {
                //console.log('uploading...');
                var j = await mainTabGroup.getValue();
                var j = textUtil.reduceJSON(j);
                /*var pts = j.containers.cna.problemTypes;
                if(pts && pts.length == 1 && pts[0].descriptions && pts[0].descriptions[0].description == undefined) {
                    delete j.containers.cna.problemTypes;
                } 
                var ims = j.containers.cna.impacts;
                if(ims && ims.length == 1 && ims[0].descriptions && ims[0].descriptions[0].value == undefined) {
                    delete j.containers.cna.impacts;
                }*/
                var ret = null;
                try {
                    var latestId = await csClient.getCveId(j.cveMetadata.cveId);
                    if (latestId.state == 'RESERVED') {
                        //console.log('Creating');
                        if (j.cveMetadata.state == 'PUBLISHED') {
                            ret = await csClient.createCve(j.cveMetadata.cveId, { cnaContainer: j.containers.cna });
                        } else if (j.cveMetadata.state == 'REJECTED') {
                            ret = await csClient.createRejectedCve(j.cveMetadata.cveId, { cnaContainer: j.containers.cna });
                        }
                    } else {
                        //console.log('uploading');
                        if (j.cveMetadata.state == 'PUBLISHED') {
                            ret = await csClient.updateCve(j.cveMetadata.cveId, { cnaContainer: j.containers.cna });
                        } else if (j.cveMetadata.state == 'REJECTED') {
                            ret = await csClient.updateRejectedCve(j.cveMetadata.cveId, { cnaContainer: j.containers.cna });
                        }
                    }
                } catch (e) {
                    //console.log('Got error');
                    //console.log(e);
                    if (e.error) {
                        infoMsg.innerText = "";
                        errMsg.innerText = "Error publishing CVE";
                        if (e.details && e.details.errors) {
                            showJSONerrors(e.details.errors.map(
                                a => {
                                    return ({
                                        path: a.instancePath,
                                        message: a.message
                                    });
                                }
                            ));
                        } else {
                            //console.log(e);
                            cveShowError(e);
                        }
                        //cveShowError(e);
                    } else {
                        showAlert('Error publishing! Got error ' + e)
                    }
                }
                //console.log(ret);
                if (ret != null && ret.message) {
                    var a = document.createElement('a');
                    a.setAttribute('href', 'https://www.cve.org/cverecord?id='+j.cveMetadata.cveId);
                    a.setAttribute('target', '_blank');
                    a.innerText = ret.message;
                    infoMsg.innerText = '';
                    infoMsg.appendChild(a);
                    hideJSONerrors();
                }
            //} else {
            //    showAlert('CVE posting is not currently supported by production CVE services! Try Logging to Test Portal instance');
            //}
        } catch (e) {
            portalErrorHandler(e);
        }
    } else {
        showAlert('Please fix errors before posting');
    }
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