function loadJSON(res, id, message, editorOptions) {
    draftsSetBaseline(null);
    // workaround for JSON Editor issue with clearing arrays
    // https://github.com/jdorn/json-editor/issues/617
    if (docEditor) {
        docEditor.destroy();
    }
    docEditor = new JSONEditor(document.getElementById('docEditor'), editorOptions ? editorOptions : docEditorOptions);
    docEditor.on('ready', async function () {
        await docEditor.root.setValue(res, true);
        mainTabGroup.changeIndex[mainTabGroup.primary] = Math.max(...mainTabGroup.changeIndex) + 1;
        if (docEditor && typeof docEditor.getValue === 'function') {
            draftsSetBaseline(docEditor.getValue());
        }
        infoMsg.textContent = message ? message : '';
        //errMsg.textContent = "";
        if(id) {
            document.title = id;
        } else {
            var nid =  getDocID();
            document.title = nid ? nid : 'Vulnogram';
        }
        if (message) {
            selected = "editorTab";
        }
        docEditor.watch('root', function(){
            mainTabGroup.change(0);
        });
        if (idpath) {
            docEditor.watch('root.' + idpath, function () {
                realtimeJoinIfReady();
            });
        }
        docEditor.on('change', async function(){
            var errors = [];
            if(docEditor.validation_results && docEditor.validation_results.length > 0) {
                if (typeof(errorFilter) !== 'undefined'){
                    errors = errorFilter(docEditor.validation_results);
                } else {
                    errors = docEditor.validation_results;
                }
            }
            if(errors.length > 0) {
                showJSONerrors(errors);
            } else {
                hideJSONerrors();
            }
        });
        editorLabel.className = "lbl";
        if(!soloMode) {
            postUrl = getDocID() ? './' + getDocID() : "./new";
        }
        realtimeJoinIfReady();

        document.getElementById(selected).checked = true;
        var event = new Event('change');
        //document.getElementById(selected).dispatchEvent(event);
        setTimeout(function (){
            document.getElementById(selected).dispatchEvent(event);
            maybeInitHistoryNavigation();
        }, 50);
    });
}

function save(e, onSuccess) {
    var j = mainTabGroup.getValue();
    if (!j){
        return;
    }
    infoMsg.textContent = "Saving...";
    var saveHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
    };
    // Identify this browser's realtime session so the server-side broadcast of
    // this save skips our own socket (we resync our shadow directly below).
    if (window.realtimeEnabled && typeof realtimeClientId === 'string') {
        saveHeaders['X-Realtime-Client-Id'] = realtimeClientId;
    }
    fetch(postUrl ? postUrl : '', {
            method: 'POST',
            credentials: 'include',
            headers: saveHeaders,
            redirect: 'error',
            body: JSON.stringify(j),
        })
        .then(function (response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        })
        .then(function (res) {
            if (res.type == "go") {
                // The document just persisted under a (possibly new) ID; this
                // redirect must not trip the unsaved-changes prompt.
                editorUnloadWarningDisabled = true;
                window.location.href = res.to;
            } else if (res.type == "err") {
                showAlert(res.msg);
                errMsg.textContent = res.msg;
                infoMsg.textContent = "";
            } else if (res.type == "saved") {
                infoMsg.textContent = "Saved";
                errMsg.textContent = "";
                document.title = originalTitle;
                draftsSetBaseline(getDraftDocValue());
                if (draftsCache && draftsCache.remove) {
                    draftsCache.cancelSave();
                    draftsCache.remove(getDocID());
                }
                // This HTTP save bumped the persisted __v out from under our
                // realtime shadow. Rejoin to adopt the new version so the next
                // live edit doesn't trip a spurious VERSION_MISMATCH.
                if (window.realtimeEnabled && typeof realtimeJoinIfReady === 'function') {
                    realtimeState.joined = false;
                    realtimeJoinIfReady();
                }
                getChanges(getDocID());
                if (onSuccess)
                    onSuccess()
            }
            changes = 0;
        })
        .catch(function (error) {
            showAlert(error + ' Try reloading the page.');
            errMsg.textContent = error + ' Try reloading the page.';
        });
    // This is a trick for brower auto completion to work
        document.getElementById('docEditor').submit();
}

function getDocID() {
    if(docEditor) {
        var idEditor = docEditor.getEditor('root.' + idpath);
        if (idEditor) {
            var val = idEditor.getValue();
            if (val) {
                return val;
            } else {
                return null;
            }
        }
    }
}
function copyText(element) {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
        document.execCommand("copy");
        document.selection.empty();
        infoMsg.textContent = 'Copied JSON to clipboard';
    } else if (window.getSelection) {
        var mrange = document.createRange();
        mrange.selectNode(element);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(mrange);
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
        infoMsg.textContent = 'Copied JSON to clipboard';
    }
}
function importFile(event, elem) {
    var file = document.getElementById("importJSON");
    file.click();
}
function loadFile(event, elem) {
    var file = elem.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            loadJSON(JSON.parse(evt.target.result), null, "Imported file");
        };
        reader.onerror = function (evt) {
            showAlert("Error reading file");
            errMsg.textContent = "Error reading file";
        };
    }
}
function downloadFile(event, link) {
    var j = mainTabGroup.getValue();
    if (!j){
        event.preventDefault();
        alert('JSON Validation Failure: Fix the errors before downloading')
        return false;
    }
    var file = new File([textUtil.getMITREJSON(textUtil.reduceJSON(j))], getDocID() + '.json', {
        type: "text/plain",
        lastModified: new Date()
    });
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    // trick to get autocomplete work
    document.getElementById('docEditor').submit();
}

function downloadText(element, link) {
    var j = mainTabGroup.getValue();
    if (!j){
        event.preventDefault();
        alert('JSON Validation Failure: Fix the errors before downloading.')
        return false;
    }
    var file = new File([element.textContent], getDocID() + '.json', {
        type: "text/plain",
        lastModified: new Date()
    });
    link.href = URL.createObjectURL(file);
    link.download = file.name;
}
function downloadHtml(title, element, link) {
    var file = new File([
            '<html><head><title>'
            + title
            + '</title><style>body{font-family:"Helvetica"; margin:3em}table {border-spacing: 0; border: 1px solid #888; border-collapse: collapse;}'+
'table th { text-align:center;background-color:#88888822;}'+
'table td { padding:5px;border: 1px solid #888}</style><body>'
            + element.innerHTML
            + '</body></html>'
        ], getDocID() + '.html', {
        type: "text/html",
        lastModified: new Date()
    });
    link.href = URL.createObjectURL(file);
    link.download = file.name;
}

// showAlert is provided globally by public/js/vg-alert.js (loaded on every
// page from views/head.pug) so non-editor pages can use it too.

// True when the editor holds changes not persisted on the server. With
// realtime sync joined, the persisted state is the last server-acked shadow;
// otherwise it is the drafts baseline (set on load and after a successful
// HTTP save).
function editorHasUnsavedChanges() {
    var doc = null;
    try {
        doc = typeof realtimeGetCurrentDoc === 'function' ? realtimeGetCurrentDoc() : getDraftDocValue();
    } catch (e) {
        doc = null;
    }
    if (!doc) return false;
    if (window.realtimeEnabled && realtimeState && realtimeState.joined && realtimeState.shadowDoc) {
        if (realtimeState.pending || realtimeState.dirty) return true;
        try {
            return draftsStableStringify(doc) !== draftsStableStringify(realtimeState.shadowDoc);
        } catch (e) {
            return true;
        }
    }
    return draftsHasChanges(doc);
}

// Closing or navigating away from a tab with unsaved edits: browsers only
// allow their own generic leave/stay prompt here, so the choice offered is
// stay (and save) or leave. Either way, flush the debounced local draft
// first so a leave can still be recovered from the drafts sidebar.
window.addEventListener('beforeunload', function (e) {
    if (editorUnloadWarningDisabled) return;
    if (!editorHasUnsavedChanges()) return;
    if (draftsCache && draftsCache.save) {
        draftsCache.cancelSave();
        var id = getDocID();
        if (id) {
            try {
                draftsCache.save(id, getDraftDocValue(), getDraftValidationErrorCount());
            } catch (err) {}
        }
    }
    e.preventDefault();
    // Chrome still requires returnValue to be set for the prompt to appear.
    e.returnValue = '';
});

export {
    loadJSON,
    save,
    getDocID,
    editorHasUnsavedChanges,
    copyText,
    importFile,
    loadFile,
    downloadFile,
    downloadText,
    downloadHtml
};
