function hashChange() {
    if(window.location.hash) {
        var hash = window.location.hash.substring(1);
        if((hash) && document.getElementById(hash+'Tab')) {
            selected = hash+'Tab';
            var t = document.getElementById(selected);
            t.checked = true;
            var event = new Event('change');
            t.dispatchEvent(event);
        }
    }
}

window.onhashchange = hashChange;

var selected = "editorTab";
if (typeof(defaultTab) !== 'undefined') {
    selected = defaultTab;
} else {
    if(window.location.hash) {
        var hash = window.location.hash.substring(1);
        if((hash) && document.getElementById(hash+'Tab')){
            selected = hash+'Tab';
        }
    }
}
var insync = false;

function Tabs(tabGroupId, tabOpts, primary) {
    var elem = document.getElementById(tabGroupId);
    var tg = {
        changeIndex: [],
        primary: primary,
        tabOpts: tabOpts,
        tabId: [],
        element: elem,
        tabs: elem.getElementsByClassName("tab"),
    }; 
    for (var i = 0; i < tg.tabs.length; i++) {
        
        var tab = tg.tabs[i];
        //console.log(tab.nextElementSibling);
        tab.nextElementSibling._tgIndex = tab._tgIndex = i;
        if(tab.id){
            tg.tabId[i] = tab.id;
        }
        tg.changeIndex[i]=0;
        tab.addEventListener('change', function(event){
            //console.log('CLicked ' + JSON.stringify( event) + ' ; ' + event.target);
            tg.select(event, event.target);
        });
    }
    tg.changeIndex[0] = 1;
    tg.select = function (event, elem) {
        //errMsg.textContent = "";
        var selected = elem._tgIndex;
        //Does the tab need an update?
        //console.log('===CLICK====' + selected + ' cI '  + tg.changeIndex);
        if (tg.changeIndex[selected] < Math.max(...tg.changeIndex)) {
            var val = tg.getValue();
            //console.log('VAL = ' + val);
            if (val) {
                if(selected != primary){
                    //console.log(' Then Setting ' + selected);
                    tg.setValue(selected, val);
                    tg.changeIndex[selected] = tg.changeIndex[primary];
                }
            } else {
                event.preventDefault();
                return;
            }
        }
        if (soloMode) {
            window.location.hash = tg.tabId[selected].replace(/Tab$/,'');
        }
    },
    tg.getValue = function (i) {
        if(i == undefined) {
            var maxi = 0;
            for (var m = 0; m < tg.tabs.length; m++) {
                if (tg.changeIndex[m] > tg.changeIndex[maxi]) {
                    maxi = m;
                }
            }
            var src = tg.tabId[maxi];
            //console.log('Most current = ' + maxi);
            if (src && tg.tabOpts[src].validate) {
                    //console.log('Validating ' + src );
                    var ret = tg.tabOpts[src].validate();
                    //console.log(' Got = ' + ret)
                    if(ret == -1) {
                        //event.preventDefault();
                        return undefined;
                    }
            }
            var val = tg.getValue(maxi);
            var primaryChanged = false;
            if(maxi != primary) {
                //console.log(' First Setting ' + primary);
                tg.setValue(primary, val);
                primaryChanged = true;
                tg.changeIndex[primary] = tg.changeIndex[maxi];
                var primaryOpts = tg.tabOpts[tg.tabId[primary]];
                if (primaryOpts && primaryOpts.validate) {
                    //console.log('validating Primary');
                    primaryOpts.validate();
                }
            }
            if (!primaryChanged) {
                return val;
            }
            i = primary;
        }
        //console.log('geting tab '+i);
        if(tg.tabOpts[tg.tabId[i]] && tg.tabOpts[tg.tabId[i]].getValue) {
            return tg.tabOpts[tg.tabId[i]].getValue();
        } else {
            return undefined;
        }
    }
    tg.setValue = function (index, val) {
        //console.log('Seting tab '+index+ ' + ' + tg.tabId[index] + "="+JSON.stringify(tg.tabOpts));
        if(tg.tabOpts[tg.tabId[index]] && tg.tabOpts[tg.tabId[index]].setValue) {
            //console.log('tab INDEX',tg.tabId);
            return tg.tabOpts[tg.tabId[index]].setValue(val);
        }
    }
    tg.focus = function(index) {
        if (!insync) {
            if(tg.tabs[index]) {
                tg.tabs[index].checked = true;
                tg.tabs[index].dispatchEvent(new Event('change'));
            } else {
                console.log('no tab');
            }
        }
    }
    tg.change = function(index) {
        if (!insync) {
            tg.changeIndex[index]++;
            if (!realtimeApplying) {
                errMsg.textContent = '';
                editorLabel.className = "lbl";
                infoMsg.textContent = 'Edited';
                var nid = getDocID();
                if (!draftsSyncing && draftsCache && draftsCache.scheduleSave) {
                    draftsCache.scheduleSave(getDocID, getDraftDocValue, getDraftValidationErrorCount);
                }
            }
            if (typeof tg.onChange === 'function') {
                tg.onChange(index, realtimeApplying);
            }
            //console.log('Inc '+ tg.tabId[index] + ' is ' + tg.changeIndex[index]);
        }
    }
    return tg;
};

var originalTitle = document.title;
var changes = true;

if (document.getElementById('remove')) {
    document.getElementById('remove').addEventListener('click', function () {
        //var e = docEditor.getValue();
        if (confirm('Delete this ' + originalTitle + '?')) {
            fetch("", {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'CSRF-Token': csrfToken
                },
            }).then(function (response) {
                if (response.status == 200) {
                    infoMsg.textContent = "Deleted ";
                    errMsg.textContent = "";
                    window.location = "./";
                } else {
                    showAlert("Error " + response.statusText);
                    errMsg.textContent = "Error " + response.statusText;
                    infoMsg.textContent = "";
                }
            });
        }
    });
}

if (document.getElementById('save1')) {
    document.getElementById('save1').addEventListener('click', save);
}

function scroll2Err(x) {
    var path = x.getAttribute('e_path');
    mainTabGroup.focus(0);
    if(path) {
        if(!path.startsWith('root.')) {
            path = 'root.' + path;
        }
        var ee = docEditor.getEditor(path);
        if(ee && ee.container) {
            var stkH = document.getElementById("vgHead").offsetHeight;
            ee.container.style["scroll-margin-top"] = (stkH + 40) + "px";
            ee.container.scrollIntoView({behavior:"smooth"});
            x.closest('details').removeAttribute('open');
        }
    }
}

function showJSONerrors(errors) {
    errList.textContent="";
    for (i = 0;i < errors.length; i++) {
        var e = errors[i];
        var showLabel = undefined;
        var ee = docEditor.getEditor(e.path);
        if (ee) {
            if(ee.header && ee.header.innerText) {
                showLabel = ee.header.innerText;
            }
            if(!showLabel && !(ee.original_schema === undefined) && !(ee.original_schema.title === undefined)) {
                showLabel = ee.original_schema.title
            } else {
                showLabel = ee.getHeaderText();
            }
        }
        var a = document.createElement('a');
        a.setAttribute('class', 'rqd')
        a.setAttribute('e_path', e.path);
        a.setAttribute('onclick', 'scroll2Err(this)');
        a.textContent = (showLabel && showLabel.trim() ? showLabel : e.path.replace('^root.','')) + ": " + e.message;
        errList.appendChild(a);
        errList.appendChild(document.createElement('br'))
    }
    errCount.className = 'indent bdg';
    errPop.className = 'popup';
    errCount.innerText = errors.length;
    //editorLabel.className = "lbl";
}

function hideJSONerrors() {
    errCount.innerText = "";
    errPop.className = 'hid';
    errList.textContent = "";
    editorLabel.className = "lbl";
}

var defaultTabs = {
    editorTab: {
        setValue: function (val) {
            insync = true;
            docEditor.setValue(val);
            insync = false;
        },
        getValue: function () {
            return docEditor.getValue();
        },
        validate: function (x) {
            var errors = [];
            if (x) {
                errors = docEditor.validate(x);
            } else {
                errors = docEditor.validate();
            }
            if (typeof(errorFilter) !== 'undefined'){
                errors = errorFilter(errors);
            }
            if (errors.length > 0) {
                docEditor.setOption('show_errors', 'always');
                showJSONerrors(errors);
                return 0;
            } else {
                hideJSONerrors();
                return 1;
            }
        }
    },
    sourceTab: {
        setValue: function (val) {
            if (sourceEditor == undefined) {
                ace.config.set('basePath', '/js/')
                sourceEditor = ace.edit("output");
                sourceEditor.getSession().setMode("ace/mode/json");
                sourceEditor.getSession().on('change', function () {
                    mainTabGroup.change(1);
                });
                sourceEditor.setOptions({
                    maxLines: 480,
                    wrap: true
                });
                sourceEditor.$blockScrolling = Infinity;
            }
            insync = true;
            sourceEditor.getSession().setValue(JSON.stringify(val, null, 2));
            sourceEditor.clearSelection();
            insync = false;
        },
        validate: function () {
            try {
                var hasError = false;
                var firsterror = null;
                var annotations = sourceEditor.getSession().getAnnotations();
                for (var l in annotations) {
                    var annotation = annotations[l];
                    if (annotation.type === "error") {
                        hasError = true;
                        firsterror = annotation;
                        //console.log('SOurce error'+annotation);
                        break;
                    }
                }
                if (!hasError) {
                    return 1;
                } else {
                    sourceEditor.moveCursorTo(firsterror.row, firsterror.column, false);
                    sourceEditor.clearSelection();
                    showAlert('Please fix error: ' + firsterror.text);
                    errMsg.textContent = 'Please fix error: ' + firsterror.text;
                    document.getElementById("sourceTab").checked = true;
                    return -1;
                }
            } catch (err) {
                showAlert(err.message);
                errMsg.textContent = err.message;
                document.getElementById("sourceTab").checked = true;
                return -1;
            } finally {}
        },
        getValue: function () {
            return JSON.parse(sourceEditor.getSession().getValue());
        }
    }
};
if(typeof additionalTabs !== 'undefined') {
    Object.assign(defaultTabs, additionalTabs);
}

var mainTabGroup = new Tabs('mainTabGroup', defaultTabs, 0);
mainTabGroup.onChange = function () {
    realtimeSchedulePatch();
};
initDraftsSidebar();
initRealtime();
window.addEventListener('popstate', handleHistoryNavigation);


export {
    hashChange,
    selected,
    insync,
    Tabs,
    originalTitle,
    changes,
    scroll2Err,
    showJSONerrors,
    hideJSONerrors,
    defaultTabs,
    mainTabGroup
};
