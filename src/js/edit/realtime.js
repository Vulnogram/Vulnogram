var realtimeStatus = document.getElementById('realtimeStatus');
var realtimeViewers = document.getElementById('realtimeViewers');
var realtimeApplying = false;
var realtimeState = {
    enabled: false,
    socket: null,
    connected: false,
    joined: false,
    currentDocId: null,
    shadowDoc: null,
    shadowVersion: null,
    pending: false,
    dirty: false,
    debounceTimer: null,
    inflightPatch: null,
    inflightBase: null
};
var realtimeClientId = (function () {
    var key = 'vulnogram-client-id';
    try {
        var existing = window.localStorage.getItem(key);
        if (existing) {
            return existing;
        }
        var fresh = 'client-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        window.localStorage.setItem(key, fresh);
        return fresh;
    } catch (e) {
        return 'client-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
})();

function realtimeCloneDoc(doc) {
    return doc ? JSON.parse(JSON.stringify(doc)) : {};
}

function realtimeSetStatus(connected, message) {
    if (!realtimeStatus) return;
    var label = connected ? '🟢 Online' : 'Offline';
    if (message) {
        label = label + ' (' + message + ')';
    }
    realtimeStatus.textContent = label;
}

function realtimeSetViewers(count) {
    if (!realtimeViewers) return;
    if (count && count > 1) {
        realtimeViewers.textContent = count + ' viewers';
    } else {
        realtimeViewers.textContent = '';
    }
}

function realtimeGetCurrentDoc() {
    var sourceTab = document.getElementById('sourceTab');
    if (sourceTab && sourceTab.checked && sourceEditor) {
        try {
            return JSON.parse(sourceEditor.getSession().getValue());
        } catch (e) {
            return null;
        }
    }
    if (docEditor && typeof docEditor.getValue === 'function') {
        return docEditor.getValue();
    }
    return null;
}

function realtimeJoinIfReady() {
    if (!window.realtimeEnabled) return;
    if (!realtimeState.socket || !realtimeState.socket.connected) return;
    if (!schemaName || typeof schemaName !== 'string') return;
    var docId = getDocID();
    if (!docId) return;
    if (realtimeState.currentDocId === docId && realtimeState.joined) return;
    realtimeState.joined = false;
    realtimeState.socket.emit('doc:join', { collection: schemaName, docId: docId }, function (res) {
        if (!res || !res.ok) {
            return;
        }
        realtimeState.currentDocId = docId;
        realtimeState.shadowDoc = realtimeCloneDoc(res.doc || {});
        realtimeState.shadowVersion = typeof res.version === 'number' ? res.version : 0;
        realtimeState.joined = true;
        if (typeof res.viewers === 'number') {
            realtimeSetViewers(res.viewers);
        }
        realtimeMaybeSyncLocal();
    });
}

function realtimeMaybeSyncLocal() {
    if (!realtimeState.joined || realtimeState.pending) return;
    var currentDoc = realtimeGetCurrentDoc();
    if (!currentDoc || !window.jsonpatch || typeof window.jsonpatch.compare !== 'function') {
        return;
    }
    var patch = window.jsonpatch.compare(realtimeState.shadowDoc || {}, currentDoc);
    if (patch && patch.length) {
        realtimeSendPatch(patch);
    }
}

function realtimeSendPatch(patch) {
    if (!realtimeState.socket || !realtimeState.socket.connected) return;
    if (!realtimeState.joined || !realtimeState.currentDocId) return;
    if (realtimeState.pending) {
        realtimeState.dirty = true;
        return;
    }
    if (!window.jsonpatch || typeof window.jsonpatch.apply !== 'function') return;
    infoMsg.textContent = "Saving...";
    realtimeState.pending = true;
    realtimeState.inflightPatch = patch;
    realtimeState.inflightBase = realtimeCloneDoc(realtimeState.shadowDoc || {});
    var payload = {
        collection: schemaName,
        docId: realtimeState.currentDocId,
        baseVersion: realtimeState.shadowVersion,
        patch: patch,
        clientId: realtimeClientId
    };
    realtimeState.socket.emit('doc:patch', payload, function (res) {
        realtimeState.pending = false;
        if (res && res.ok) {
            var nextShadow = realtimeCloneDoc(realtimeState.inflightBase || {});
            try {
                window.jsonpatch.apply(nextShadow, realtimeState.inflightPatch, true);
            } catch (e) {
                nextShadow = realtimeCloneDoc(realtimeGetCurrentDoc());
            }
            realtimeState.shadowDoc = nextShadow;
            realtimeState.shadowVersion = res.newVersion;
            realtimeState.inflightPatch = null;
            realtimeState.inflightBase = null;
            if (draftsCache && draftsCache.remove) {
                draftsCache.cancelSave();
                draftsCache.remove(realtimeState.currentDocId);
                infoMsg.textContent = "Auto saved";
            }
            if (realtimeState.dirty) {
                realtimeState.dirty = false;
                realtimeSchedulePatch();
            }
            return;
        }
        realtimeState.inflightPatch = null;
        realtimeState.inflightBase = null;
        if (res && res.reason === 'VERSION_MISMATCH' && res.doc) {
            realtimeApplying = true;
            try {
                if (docEditor) {
                    docEditor.setValue(res.doc);
                }
            } catch (e) {
            }
            realtimeApplying = false;
            realtimeState.shadowDoc = realtimeCloneDoc(res.doc || {});
            realtimeState.shadowVersion = typeof res.version === 'number' ? res.version : realtimeState.shadowVersion;
            return;
        }
        if (realtimeState.dirty) {
            realtimeState.dirty = false;
            realtimeSchedulePatch();
        }
    });
}

function realtimeSchedulePatch() {
    if (!window.realtimeEnabled) return;
    if (realtimeApplying || draftsSyncing) return;
    if (realtimeState.pending) {
        realtimeState.dirty = true;
        return;
    }
    if (realtimeState.debounceTimer) {
        clearTimeout(realtimeState.debounceTimer);
    }
    var debounceMs = (window.realtimeConfig && window.realtimeConfig.debounceMs) ? window.realtimeConfig.debounceMs : 350;
    realtimeState.debounceTimer = setTimeout(function () {
        if (!realtimeState.socket || !realtimeState.socket.connected) return;
        if (!window.jsonpatch || typeof window.jsonpatch.compare !== 'function') return;
        var currentDoc = realtimeGetCurrentDoc();
        if (!currentDoc) return;
        var patch = window.jsonpatch.compare(realtimeState.shadowDoc || {}, currentDoc);
        if (patch && patch.length) {
            realtimeSendPatch(patch);
        }
    }, debounceMs);
}

function realtimeApplyRemotePatch(data) {
    if (!data || !data.patch) return;
    if (data.clientId && data.clientId === realtimeClientId) return;
    if (!window.jsonpatch || typeof window.jsonpatch.apply !== 'function') return;
    var nextShadow = realtimeCloneDoc(realtimeState.shadowDoc || {});
    try {
        window.jsonpatch.apply(nextShadow, data.patch, true);
    } catch (e) {
        realtimeJoinIfReady();
        return;
    }
    realtimeState.shadowDoc = nextShadow;
    realtimeState.shadowVersion = typeof data.newVersion === 'number' ? data.newVersion : realtimeState.shadowVersion;
    realtimeApplying = true;
    try {
        if (docEditor) {
            docEditor.setValue(nextShadow);
        }
    } catch (e) {
    }
    realtimeApplying = false;
}

function initRealtime() {
    if (!window.realtimeEnabled || typeof io === 'undefined') {
        return;
    }
    realtimeState.enabled = true;
    realtimeState.socket = io();
    realtimeSetStatus(false, 'connecting');
    realtimeState.socket.on('connect', function () {
        realtimeState.connected = true;
        realtimeSetStatus(true);
        realtimeJoinIfReady();
    });
    realtimeState.socket.on('disconnect', function () {
        realtimeState.connected = false;
        realtimeState.joined = false;
        realtimeSetStatus(false);
        realtimeSetViewers(0);
    });
    realtimeState.socket.on('connect_error', function () {
        realtimeSetStatus(false, 'error');
    });
    realtimeState.socket.on('doc:patched', function (data) {
        realtimeApplyRemotePatch(data);
    });
    realtimeState.socket.on('doc:viewers', function (data) {
        if (data && typeof data.count === 'number') {
            realtimeSetViewers(data.count);
        }
    });
}


export {
    realtimeStatus,
    realtimeViewers,
    realtimeApplying,
    realtimeState,
    realtimeClientId,
    realtimeCloneDoc,
    realtimeSetStatus,
    realtimeSetViewers,
    realtimeGetCurrentDoc,
    realtimeJoinIfReady,
    realtimeMaybeSyncLocal,
    realtimeSendPatch,
    realtimeSchedulePatch,
    realtimeApplyRemotePatch,
    initRealtime
};
