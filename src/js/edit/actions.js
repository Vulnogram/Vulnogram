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
    fetch(postUrl ? postUrl : '', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
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

function showAlert(msg, smallmsg, timer, showCancel) {
    errMsg.textContent="";
    infoMsg.textContent="";
    if (showCancel) {
        document.getElementById("alertCancel").style.display = "inline-block";
    } else {
        var temp1 = document.getElementById("alertOk");
        temp1.setAttribute("onclick", "document.getElementById('alertDialog').close();");
        document.getElementById("alertCancel").style.display = "none";
    }
    document.getElementById("alertMessage").innerText = msg;
    if (smallmsg)
        document.getElementById("smallAlert").innerText = smallmsg;
    else
        document.getElementById("smallAlert").innerText = " ";
    if (!document.getElementById("alertDialog").hasAttribute("open"))
        document.getElementById("alertDialog").showModal();
    if (timer)
        setTimeout(function () {
            document.getElementById("alertDialog").close();
        }, timer);
}

export {
    loadJSON,
    save,
    getDocID,
    copyText,
    importFile,
    loadFile,
    downloadFile,
    downloadText,
    downloadHtml,
    showAlert
};
