// IndexedDB cache for local document persistence
var draftsCache = draftsFeatureEnabled ? (function () {
    var DB_NAME = 'vulnogram_cache';
    var STORE_NAME = 'docs';
    var DB_VERSION = 1;
    var db = null;
    var saveTimeout = null;
    var channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('draftsCache') : null;
    var listeners = [];
    var currentSection = (typeof schemaName === 'string' && schemaName) ? schemaName : '';

    function toCacheKey(id) {
        if (!id) return null;
        return currentSection + '::' + id;
    }

    function fromStoredEntry(entry) {
        if (!entry) return null;
        if (entry.section !== currentSection || !entry.docId) return null;
        return {
            id: entry.docId,
            doc: entry.doc,
            errorCount: entry.errorCount,
            updatedAt: entry.updatedAt,
            section: entry.section
        };
    }

    // Listen for updates from other tabs
    if (channel != undefined) {
        channel.onmessage = function (e) {
            notify(e.data, true);
        };
    }

    function notify(data, isRemote) {
        listeners.forEach(function (cb) {
            try { cb(data, isRemote); } catch (e) { console.error(e); }
        });
    }

    function subscribe(cb) {
        listeners.push(cb);
    }

    function open() {
        return new Promise(function (resolve, reject) {
            if (db) { resolve(db); return; }
            var req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = function (e) {
                var d = e.target.result;
                if (!d.objectStoreNames.contains(STORE_NAME)) {
                    d.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
            req.onsuccess = function (e) { db = e.target.result; resolve(db); };
            req.onerror = function (e) { reject(e.target.error); };
        });
    }

    function save(id, doc, errorCount) {
        if (!id) return Promise.resolve();
        var count = typeof errorCount === 'number' ? errorCount : 0;
        var cacheKey = toCacheKey(id);
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readwrite');
                var store = tx.objectStore(STORE_NAME);
                store.put({
                    id: cacheKey,
                    docId: id,
                    section: currentSection,
                    doc: doc,
                    errorCount: count,
                    updatedAt: Date.now()
                });
                tx.oncomplete = function () {
                    var msg = { type: 'update', id: id, section: currentSection };
                    if (channel) channel.postMessage(msg);
                    notify(msg, false);
                    resolve();
                };
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function get(id) {
        if (!id) return Promise.resolve(null);
        var cacheKey = toCacheKey(id);
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readonly');
                var store = tx.objectStore(STORE_NAME);
                var req = store.get(cacheKey);
                req.onsuccess = function () { resolve(fromStoredEntry(req.result || null)); };
                req.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function getAll() {
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readonly');
                var store = tx.objectStore(STORE_NAME);
                var req = store.getAll();
                req.onsuccess = function () {
                    var items = (req.result || []).map(fromStoredEntry).filter(Boolean);
                    resolve(items);
                };
                req.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function remove(id) {
        if (!id) return Promise.resolve();
        var cacheKey = toCacheKey(id);
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readwrite');
                var store = tx.objectStore(STORE_NAME);
                store.delete(cacheKey);
                tx.oncomplete = function () {
                    var msg = { type: 'delete', id: id, section: currentSection };
                    if (channel) channel.postMessage(msg);
                    notify(msg, false);
                    resolve();
                };
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function scheduleSave(getIdFn, getDocFn, getErrorCountFn) {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(function () {
            var id = typeof getIdFn === 'function' ? getIdFn() : null;
            if (id) {
                var doc = typeof getDocFn === 'function' ? getDocFn() : null;
                if (doc === null || doc === undefined) return;
                if (!draftsHasChanges(doc)) return;
                var errorCount = typeof getErrorCountFn === 'function' ? getErrorCountFn() : 0;
                save(id, doc, errorCount).catch(function (e) { console.warn('draftsCache save error:', e); });
            }
        }, 2000);
    }

    function onTabChange(callback) {
        subscribe(function (data, isRemote) {
            if (isRemote) callback(data);
        });
    }

    function getLatest() {
        return getAll().then(function (docs) {
            if (!docs || docs.length === 0) return null;
            docs.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
            return docs[0];
        });
    }

    function cancelSave() {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
            saveTimeout = null;
        }
    }

    return { open: open, save: save, get: get, getAll: getAll, getLatest: getLatest, remove: remove, scheduleSave: scheduleSave, cancelSave: cancelSave, onTabChange: onTabChange, subscribe: subscribe };
})() : null;

var draftsSyncing = false;
var historySyncing = false;
var historyInitHandled = false;
var draftsUi = {
    toggle: document.getElementById('sidebarToggle'),
    list: document.getElementById('draftsList'),
    more: document.getElementById('draftsMore'),
    empty: document.getElementById('draftsEmpty'),
    count: document.getElementById('draftsCount')
};

function getDraftDocValue() {
    if (docEditor && typeof docEditor.getValue === 'function') {
        return docEditor.getValue();
    }
    return null;
}

function getDraftValidationErrorCount() {
    if (!docEditor) return 0;
    var errors = [];
    if (docEditor.validation_results && docEditor.validation_results.length > 0) {
        if (typeof(errorFilter) !== 'undefined') {
            errors = errorFilter(docEditor.validation_results) || [];
        } else {
            errors = docEditor.validation_results;
        }
    }
    return errors.length || 0;
}

function renderDraftButtons(target, entries) {
    if (!target) return;
    target.textContent = '';
    entries.forEach(function (entry) {
        var btn = document.createElement('a');
        btn.className = 'lbl';
        btn.title=entry.id;
        var time = '';
        if (entry.updatedAt) {
            var updatedAt = new Date(entry.updatedAt);
            if (typeof textUtil !== 'undefined' && textUtil.formatFriendlyDate) {
                time = ` ${textUtil.formatFriendlyDate(updatedAt)}`;
            }
        }
        var DraftId = document.createElement('span');
        DraftId.appendChild(document.createTextNode(entry.id));
        btn.appendChild(DraftId);

        var Meta = document.createElement('span');
        var errorCount = typeof entry.errorCount === 'number' ? entry.errorCount : 0;
        if (errorCount > 0) {
            var badge = document.createElement('b');
            badge.className = 'bdg';
            badge.textContent = errorCount;
            badge.title = String(errorCount) + ' errors!';
            Meta.appendChild(badge);
        }
        if (time) {
            Meta.appendChild(document.createTextNode(time));
        }
        var del = document.createElement('span');
            del.className = 'sbn fbn vgi-x';
            del.title = 'Delete draft '+entry.id;
        del.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!draftsCache || !draftsCache.remove) return;
            draftsCache.cancelSave();
            draftsCache.remove(entry.id);
        });
        Meta.appendChild(del);
        btn.appendChild(Meta);
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (draftsUi.toggle) {
                draftsUi.toggle.checked = true;
            }
            loadDraftFromCache(entry.id, false);
        });
        target.appendChild(btn);
    });
}

function refreshDraftsList() {
    if (!draftsUi.list || !draftsCache) return;
    draftsCache.getAll().then(function (entries) {
        entries = (entries || []).filter(function (entry) {
            return entry && entry.id && entry.doc;
        });
        entries.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
        renderDraftButtons(draftsUi.list, entries);
        if (draftsUi.empty) {
            if(entries.length > 0) {
                draftsUi.empty.classList.add('hid');
            } else {
                draftsUi.empty.classList.remove('hid');
            }
        }
        if (draftsUi.count) {
            draftsUi.count.textContent = entries.length ? entries.length : '';
        }
    }).catch(function (e) {
        console.warn('draftsCache list error:', e);
    });
}

var soloDocParam = 'doc';

function getDocIdFromSearch(search) {
    var query = typeof search === 'string' ? search : window.location.search;
    if (!query) return null;
    if (typeof URLSearchParams !== 'undefined') {
        var params = new URLSearchParams(query);
        var docId = params.get(soloDocParam);
        if (!docId || docId === 'new') return null;
        return docId;
    }
    var pairs = query.replace(/^\?/, '').split('&');
    for (var i = 0; i < pairs.length; i++) {
        var part = pairs[i];
        if (!part) continue;
        var segments = part.split('=');
        var key = '';
        try {
            key = decodeURIComponent(segments[0] || '');
        } catch (e) {
            key = segments[0] || '';
        }
        if (key === soloDocParam) {
            var raw = segments.slice(1).join('=');
            if (!raw) return null;
            try {
                raw = decodeURIComponent(raw.replace(/\+/g, ' '));
            } catch (e) {}
            if (!raw || raw === 'new') return null;
            return raw;
        }
    }
    return null;
}

function buildSoloDraftUrl(docId) {
    if (typeof URL !== 'undefined') {
        try {
            var url = new URL(window.location.href);
            if (docId) {
                url.searchParams.set(soloDocParam, docId);
            } else {
                url.searchParams.delete(soloDocParam);
            }
            return url.pathname + url.search + url.hash;
        } catch (e) {}
    }
    return window.location.pathname + window.location.search + window.location.hash;
}

function getDocIdFromLocation() {
    if (soloMode) {
        return getDocIdFromSearch();
    }
    return getDocIdFromPath();
}

function maybeInitHistoryNavigation() {
    if (historyInitHandled || !soloMode) return;
    historyInitHandled = true;
    var targetId = getDocIdFromLocation();
    if (!targetId) return;
    handleHistoryNavigation({ state: { docId: targetId } });
}

function updateDraftHistory(nextUrl, entry) {
    if (historySyncing) return;
    if (!window.history || typeof window.history.pushState !== 'function') return;
    if (!soloMode && !nextUrl) return;
    var docId = entry && entry.id ? entry.id : null;
    var currentUrl = window.location.pathname + window.location.search + window.location.hash;
    var targetUrl = null;
    if (soloMode) {
        targetUrl = buildSoloDraftUrl(docId);
    } else {
        targetUrl = nextUrl;
        if (typeof URL !== 'undefined') {
            try {
                var resolved = new URL(nextUrl, window.location.href);
                targetUrl = resolved.pathname + resolved.search + resolved.hash;
            } catch (e) {
                targetUrl = nextUrl;
            }
        }
    }
    if (!targetUrl) return;
    if (targetUrl === currentUrl) return;
    window.history.pushState({ docId: docId }, '', targetUrl);
}

function getDocIdFromPath(pathname) {
    var path = typeof pathname === 'string' ? pathname : window.location.pathname;
    var parts = path.split('/').filter(Boolean);
    if (!parts.length) return null;
    var last = parts[parts.length - 1];
    if (!last || last === 'new') return null;
    try {
        return decodeURIComponent(last);
    } catch (e) {
        return last;
    }
}

function getDocBasePath(pathname) {
    var path = typeof pathname === 'string' ? pathname : window.location.pathname;
    var base = path.replace(/\/[^\/]*$/, '');
    return base ? base : '/';
}

function loadDocFromServer(docId) {
    var base = getDocBasePath();
    var url = base.replace(/\/$/, '') + '/json/' + encodeURIComponent(docId);
    return fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json, text/plain, */*'
        }
    }).then(function (response) {
        if (!response.ok) {
            throw Error(response.statusText || 'Failed to load document');
        }
        return response.json();
    }).then(function (data) {
        var doc = Array.isArray(data) ? data[0] : data;
        if (!doc) {
            throw Error('Document not found');
        }
        var body = doc.body || doc;
        loadJSON(body, docId, 'Loaded ' + docId);
    });
}

function loadSoloDocFallback(docId, done, loadNewDoc) {
    if (!docId) {
        loadNewDoc();
        return;
    }
    if (typeof cveLoad !== 'function') {
        loadNewDoc();
        return;
    }
    try {
        var result = cveLoad(docId);
        if (result && typeof result.then === 'function') {
            result.then(function () {
                done();
            }).catch(function (e) {
                console.warn('cveLoad error:', e);
                loadNewDoc();
            });
            return;
        }
        done();
    } catch (e) {
        console.warn('cveLoad error:', e);
        loadNewDoc();
    }
}

function handleHistoryNavigation(event) {
    if (historySyncing) return;
    var state = event && event.state ? event.state : null;
    var targetId = state && state.docId ? state.docId : getDocIdFromLocation();
    var currentId = null;
    try {
        currentId = getDocID();
    } catch (e) {}
    if (targetId === currentId || (!targetId && !currentId)) {
        return;
    }
    historySyncing = true;
    var done = function () { historySyncing = false; };
    var loadNewDoc = function () {
        if (typeof initJSON !== 'undefined') {
            loadJSON(initJSON || {}, null, 'New');
            if (mainTabGroup) {
                mainTabGroup.change(0);
            }
            done();
            return true;
        }
        done();
        if (!soloMode) {
            window.location.reload();
        }
        return false;
    };
    if (!targetId) {
        loadNewDoc();
        return;
    }
    if (draftsCache && draftsCache.get) {
        draftsCache.get(targetId).then(function (entry) {
            if (entry && entry.doc) {
                applyDraftEntry(entry);
                done();
                return;
            }
            if (soloMode) {
                loadSoloDocFallback(targetId, done, loadNewDoc);
                return;
            }
            loadDocFromServer(targetId).then(done).catch(function (e) {
                console.warn('history load error:', e);
                done();
                window.location.reload();
            });
        }).catch(function (e) {
            console.warn('draftsCache load error:', e);
            if (soloMode) {
                loadSoloDocFallback(targetId, done, loadNewDoc);
                return;
            }
            loadDocFromServer(targetId).then(done).catch(function (err) {
                console.warn('history load error:', err);
                done();
                window.location.reload();
            });
        });
        return;
    }
    if (soloMode) {
        loadSoloDocFallback(targetId, done, loadNewDoc);
        return;
    }
    loadDocFromServer(targetId).then(done).catch(function (e) {
        console.warn('history load error:', e);
        done();
        window.location.reload();
    });
}

function applyDraftEntry(entry) {
    if (!entry || !entry.doc) return;
    var nextUrl = entry.id ? './' + entry.id : "./new";
    if (!docEditor || !mainTabGroup) {
        if (!soloMode) {
            postUrl = nextUrl;
        }
        updateDraftHistory(nextUrl, entry);
        loadJSON(entry.doc, entry.id, 'Loaded draft ' + entry.id);
        return;
    }
    draftsSyncing = true;
    insync = true;
    try {
        docEditor.setValue(entry.doc);
    } catch (e) {
        console.warn('Failed to apply draft', e);
    }
    insync = false;
    if (docEditor && typeof docEditor.getValue === 'function') {
        draftsSetBaseline(docEditor.getValue());
    }
    if (entry.id) {
        document.title = entry.id;
    }
    if (!soloMode) {
        postUrl = nextUrl;
    }
    updateDraftHistory(nextUrl, entry);
    if (document.getElementById("save1")) {
        save1.className = "fbn save";
    }
    mainTabGroup.change(0);
    draftsSyncing = false;
}

function loadDraftFromCache(id, isSync) {
    if (!draftsCache || !id) return;
    draftsCache.get(id).then(function (entry) {
        if (!entry || !entry.doc) return;
        var nextUrl = entry.id ? './' + entry.id : "./new";
        if (!soloMode) {
            postUrl = nextUrl;
        }
        updateDraftHistory(nextUrl, entry);
        if (isSync) {
            applyDraftEntry(entry);
            return;
        }
        loadJSON(entry.doc, entry.id, 'Loaded draft ' + entry.id);
    }).catch(function (e) {
        console.warn('draftsCache load error:', e);
    });
}

function initDraftsSidebar() {
    if (!draftsUi.list || !draftsCache) return;
    refreshDraftsList();
    draftsCache.subscribe(function () {
        refreshDraftsList();
    });
    draftsCache.onTabChange(function (data) {
        if (!data || data.type !== 'update' || !data.id) return;
        if (data.section && data.section !== schemaName) return;
        var currentId = getDocID();
        if (currentId && currentId === data.id) {
            loadDraftFromCache(data.id, true);
        }
    });
}


export {
    draftsCache,
    draftsSyncing,
    historySyncing,
    historyInitHandled,
    draftsUi,
    soloDocParam,
    getDraftDocValue,
    getDraftValidationErrorCount,
    renderDraftButtons,
    refreshDraftsList,
    getDocIdFromSearch,
    buildSoloDraftUrl,
    getDocIdFromLocation,
    maybeInitHistoryNavigation,
    updateDraftHistory,
    getDocIdFromPath,
    getDocBasePath,
    loadDocFromServer,
    loadSoloDocFallback,
    handleHistoryNavigation,
    applyDraftEntry,
    loadDraftFromCache,
    initDraftsSidebar
};
