loadCpeNameOverrides();

document.getElementById('post1').addEventListener('click', cvePost);

var publicEditorOption = cloneJSON(docEditorOptions);
Object.assign(publicEditorOption.schema, docSchema.oneOf[0]);
delete publicEditorOption.schema.oneOf;

var rejectEditorOption = cloneJSON(docEditorOptions);
Object.assign(rejectEditorOption.schema, docSchema.oneOf[1]);
delete rejectEditorOption.schema.oneOf;

if (initJSON && initJSON.cveMetadata && initJSON.cveMetadata.state == 'REJECTED') {
    docEditorOptions = rejectEditorOption;
} else {
    docEditorOptions = publicEditorOption;
}

function setProductExamples(schema, field, examples) {
    if (!schema || !schema.definitions || !schema.definitions.product || !schema.definitions.product.properties || !schema.definitions.product.properties[field]) {
        return;
    }
    schema.definitions.product.properties[field].examples = examples;
}

var recentCveUi = {
    toggle: document.getElementById('sidebarToggle'),
    list: document.getElementById('recentList'),
    empty: document.getElementById('recentEmpty'),
    org: document.getElementById('recentOrg')
};
var recentCveEntries = [];
var recentCveOrgName = '';

function normalizeRecentCveToken(value) {
    if (!value) {
        return null;
    }
    var token = String(value).trim().toUpperCase();
    if (!token) {
        return null;
    }
    token = token.replace(/^CVE-/, '');
    if (!/^\d{4}-[A-Z\d\._-]{4,}$/.test(token)) {
        return null;
    }
    return 'CVE-' + token;
}

function renderRecentCveList() {
    if (!recentCveUi.list) {
        return;
    }
    recentCveUi.list.textContent = '';
    recentCveEntries.forEach(function (cveId) {
        var btn = document.createElement('a');
        btn.className = 'lbl';
        btn.title = cveId;
        var label = document.createElement('span');
        label.appendChild(document.createTextNode(cveId));
        btn.appendChild(label);
        btn.appendChild(document.createElement('span'));
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (recentCveUi.toggle) {
                recentCveUi.toggle.checked = true;
            }
            var recentLoader = (typeof cveLoadFromCveOrg === 'function') ? cveLoadFromCveOrg : cveLoad;
            if (typeof recentLoader === 'function') {
                Promise.resolve(recentLoader(cveId)).catch(function (err) {
                    console.warn('recent cveLoad error:', err);
                });
            }
        });
        recentCveUi.list.appendChild(btn);
    });
    if (recentCveUi.empty) {
        if (recentCveEntries.length > 0) {
            recentCveUi.empty.classList.add('hid');
        } else {
            recentCveUi.empty.classList.remove('hid');
        }
    }
    if (recentCveUi.org) {
        recentCveUi.org.innerText = recentCveOrgName || '';
    }
}

function setRecentCveEntries(entries, orgName) {
    var seen = {};
    recentCveEntries = [];
    (entries || []).forEach(function (entry) {
        var cveId = normalizeRecentCveToken(entry);
        if (!cveId || seen[cveId]) {
            return;
        }
        seen[cveId] = true;
        recentCveEntries.push(cveId);
    });
    recentCveOrgName = orgName || '';
    renderRecentCveList();
}
window.setRecentCveEntries = setRecentCveEntries;
renderRecentCveList();

var assignerRecentCache = {};
function extractRecentAbbreviatedIds(rawText) {
    if (!rawText) {
        return [];
    }
    var snippet = String(rawText).split(/\r?\n/).slice(0, 20).join('\n');
    if (snippet.length > 500) {
        snippet = snippet.slice(0, 500);
    }
    var seen = {};
    var ids = [];
    var match = null;
    var fullIdMatcher = /CVE-\d{4}-[a-zA-Z\d\._-]{4,}/gim;
    while ((match = fullIdMatcher.exec(snippet)) !== null) {
        var cveId = String(match[0]).toUpperCase();
        if (seen[cveId]) {
            continue;
        }
        seen[cveId] = true;
        ids.push(cveId.replace(/^CVE-/, ''));
    }
    if (ids.length === 0) {
        var shortIdMatcher = /["'](\d{4}-[a-zA-Z\d\._-]{4,})["']/gim;
        while ((match = shortIdMatcher.exec(snippet)) !== null) {
            var shortId = String(match[1]).toUpperCase();
            if (seen[shortId]) {
                continue;
            }
            seen[shortId] = true;
            ids.push(shortId);
        }
    }
    return ids;
}

async function loadRecentAbbreviatedIds(orgName) {
    if (!orgName) {
        return [];
    }
    if (assignerRecentCache[orgName]) {
        return assignerRecentCache[orgName];
    }
    // Source path in cve-index remains /data/latest/.
    var recentUrl = 'https://raw.githubusercontent.com/Vulnogram/cve-index/refs/heads/main/data/latest/' + orgName + '.json';
    var recent = [];
    try {
        var response = await fetch(recentUrl, {
            method: 'GET',
            credentials: 'omit',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Range': 'bytes=0-499'
            }
        });
        if (response.ok) {
            recent = extractRecentAbbreviatedIds(await response.text());
        }
    } catch (e) {
        console.error('Failed to load recent CVE list for ' + orgName, e);
    }
    assignerRecentCache[orgName] = recent;
    return recent;
}

var ensureAssignerExamplesFromCache = null;
async function ensureAssignerExamples(assignerShortName) {
    if (!assignerShortName || typeof normalizeShortName !== 'function' || typeof loadExamples !== 'function') {
        return;
    }
    var orgName = normalizeShortName(assignerShortName);
    if (!orgName) {
        return;
    }
    window.vgExamples = window.vgExamples || {};
    var fields = ['vendor', 'product', 'collectionURL', 'packageName'];
    var schemas = [docSchema, publicEditorOption.schema];
    var jobs = fields.map(async function (field) {
        try {
            var examples = null;
            if (typeof vgExamples !== 'undefined' && vgExamples[field] && vgExamples[field][orgName]) {
                examples = vgExamples[field][orgName];
            }
            if (!examples) {
                examples = await loadExamples(field, orgName);
            }
            if (examples) {
                schemas.forEach(function (schema) {
                    setProductExamples(schema, field, examples);
                });
            } else { //clear 
                schemas.forEach(function (schema) {
                    setProductExamples(schema, field, []);
                });

            }
        } catch (e) {
            console.error('Failed to load examples for ' + field + '/' + orgName, e);
            schemas.forEach(function (schema) {
                setProductExamples(schema, field, []);
            });            
        }
    });
    jobs.push((async function () {
        var recent = await loadRecentAbbreviatedIds(orgName);
        if (typeof window !== 'undefined' && typeof window.setRecentCveEntries === 'function') {
            window.setRecentCveEntries(recent, orgName);
        }
    })());
    await Promise.all(jobs);
}

if (!initJSON && csCache && csCache.org) {
    try {
        ensureAssignerExamplesFromCache = ensureAssignerExamples(csCache.org);
    } catch (e) {
        console.error('Failed to start loading examples for ' + csCache.org, e);
    }
}

if (typeof loadJSON === 'function') {
    var originalLoadJSON = loadJSON;
    loadJSON = async function (res) {
        if (ensureAssignerExamplesFromCache) {
            try {
                await ensureAssignerExamplesFromCache;
            } catch (e) {
                console.error('Continuing without cached assigner examples', e);
            }
        }
        if (res && res.cveMetadata && res.cveMetadata.assignerShortName) {
            try {
                await ensureAssignerExamples(res.cveMetadata.assignerShortName);
            } catch (e) {
                console.error('Continuing without assigner examples', e);
            }
        }
        return originalLoadJSON.apply(this, arguments);
    }
}

// make sure all starting and ending spaces in strings are trimmed 
JSONEditor.defaults.editors.string.prototype.sanitize = function(value) {
    if(value)
        return value.trim();
    return value;
  }; 

  JSONEditor.defaults.editors.CPEA = class CPEA extends JSONEditor.AbstractEditor {
    setValue(value, initial, notify) {
        var changed = (this.getValue() !== value);
        if (changed) {
            super.setValue(value, initial);
            if (this.container) {
                this.container.innerHTML = pugRender({
                    renderTemplate: 'cpeApplicability',
                    doc: value
                })
            }
            if(notify)
                this.onChange(true);
        }
    }
    register() {
        super.register();
    }
    unregister(){
        super.unregister();
    }
    getValue() {
        return this.value;
    }
    build() {
        var self = this,
            i;
        if (!this.options.compact) {
            this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
        }
        if(this.label && this.options.class) {
            this.label.className = this.label.className + ' ' + this.options.class;
            if(this.showStar()){
                this.label.className = this.label.className + ' req'; 
            }
        }

        if (this.schema.options && this.schema.options.infoText) {
            this.label.setAttribute('title', this.schema.options.infoText);
        }
        if (this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);
        if (this.value) {
            this.container.innerHTML = pugRender({
                renderTemplate: 'cpeApplicability',
                doc: this.value
            })
        }
        if (this.schema.template) {
            const callback = this.expandCallbacks('template', { template: this.schema.template })
            if (typeof callback.template === 'function') this.template = callback.template
            else this.template = this.jsoneditor.compileTemplate(this.schema.template, this.template_engine)
            this.refreshValue()
        } else {
            this.refreshValue()
        }
    }
    enable() {
        super.enable();
    }
    disable() {
        super.disable();
    }
    destroy() {
        /*if (this.label) this.label.parentNode.removeChild(this.label);
        if (this.description) this.description.parentNode.removeChild(this.description);*/
        super.destroy();
    }
    onWatchedFieldChange () {
        let vars
        // If this editor needs to be rendered by a macro template 
        if (this.template && ((localStorage.getItem('autoCPEChk') === 'true'))) {
          vars = this.getWatchedFieldValues()
          var val = this.template(vars);
          this.setValue(val, false, false)
        }
        super.onWatchedFieldChange()
    }
};

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.format === "CPEA") {
        return "CPEA";
    }
});

class ssvcOpts extends JSONEditor.defaults.editors.array {
    setValue(value) {
        this.value = value;
        if (value && value.length > 0) {
            value.forEach(sm => {
                var m = Object.keys(sm)[0];
                if (m && this.editorMap[m]) {
                    this.editorMap[m].setValue(sm[m]);
                }
            });
        }
    }

    getValue() {
        var ret = [];
        if (this.editorMap) {
            for (const key in this.editorMap) {
                if (this.editorMap.hasOwnProperty(key)) {
                    const value = this.editorMap[key].getValue();
                    ret.push({ [key]: value });
                }
            }
        }
        return ret;
    }

    build() {
        super.build();
        // Clear any existing editor containers to rebuild subeditors
        if (this.editors && this.editors.length) {
            this.editors.forEach(editor => editor.destroy());
            this.editorMap = {};
            this.editors = [];
            if (this.container) {
                this.container.innerHTML = '';
            }
        } else {
            this.editors = [];
            this.editorMap = {};
        }

        // Create subeditors for each object in this.value (ordered array)
        Object.keys(this.schema.items.properties).forEach(metric => {
            var row = document.createElement('div');
            row.className = 'row';
            var itemName = metric;//Object.keys(metric.properties)[0];
            var itemSchema = this.schema.items.properties[itemName];
            var itemLabel = document.createElement('label');
            itemLabel.className = 'lbl';
            itemLabel.innerText = itemName;
            row.appendChild(itemLabel);
            var editor = this.jsoneditor.createEditor(JSONEditor.defaults.editors.radio, {
                jsoneditor: this.jsoneditor,
                schema: itemSchema,
                path: `${this.path}.${itemName}`,
                parent: this,
                compact: true,
                required: true
            });
            editor.container = row;
            editor.preBuild();
            editor.build();
            editor.postBuild();
            // Append editor container to this container
            if (this.container) {
                this.container.appendChild(row);
            }

            this.editors.push(editor);
            this.editorMap[itemName] = editor;
        });
    }
}

JSONEditor.defaults.editors.ssvcOpts = ssvcOpts;

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.format === 'ssvcOpts') {
        return 'ssvcOpts';
    }
});
