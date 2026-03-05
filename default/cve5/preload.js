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
        if (typeof cveFixForVulnogram === 'function') {
            res = cveFixForVulnogram(res);
            arguments[0] = res;
        }
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

var languagePickerOptions = [
    { code: 'en', label: 'English', flag: '🌐' },
    { code: 'fr', label: 'French', flag: '🇫🇷' },
    { code: 'de', label: 'German', flag: '🇩🇪' },
    { code: 'es', label: 'Spanish', flag: '🇪🇸' },
    { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
    { code: 'it', label: 'Italian', flag: '🇮🇹' },
    { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
    { code: 'sv', label: 'Swedish', flag: '🇸🇪' },
    { code: 'no', label: 'Norwegian', flag: '🇳🇴' },
    { code: 'da', label: 'Danish', flag: '🇩🇰' },
    { code: 'fi', label: 'Finnish', flag: '🇫🇮' },
    { code: 'pl', label: 'Polish', flag: '🇵🇱' },
    { code: 'cs', label: 'Czech', flag: '🇨🇿' },
    { code: 'tr', label: 'Turkish', flag: '🇹🇷' },
    { code: 'ru', label: 'Russian', flag: '🇷🇺' },
    { code: 'uk', label: 'Ukrainian', flag: '🇺🇦' },
    { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', label: 'Korean', flag: '🇰🇷' },
    { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
    { code: 'he', label: 'Hebrew', flag: '🇮🇱' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
    { code: 'id', label: 'Indonesian', flag: '🇮🇩' },
    { code: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
    { code: 'th', label: 'Thai', flag: '🇹🇭' }
];

var englishLanguageCodes = {
    en: true
};

function normalizeLanguageCode(value) {
    return String(value || '').trim().replace(/_/g, '-').toLowerCase();
}

JSONEditor.defaults.editors.languagePicker = class languagePicker extends JSONEditor.defaults.editors.string {
    build() {
        super.build();

        this.languagePickerSelect = document.createElement('select');
        this.languagePickerSelect.className = 'txt language-picker-select';
        this.languagePickerSelect.setAttribute('aria-label', 'Select language');

        this.languagePickerSelect.appendChild(this.createPickerOption('', 'Language'));

        this.pickerOptions = this.getPickerOptions();
        for (var i = 0; i < this.pickerOptions.length; i++) {
            var item = this.pickerOptions[i];
            this.languagePickerSelect.appendChild(
                this.createPickerOption(
                    item.code,
                    item.flag + ' ' + item.label
                )
            );
        }
        this.languagePickerSelect.appendChild(
            this.createPickerOption('__custom__', 'Custom code')
        );

        this.input.classList.add('language-picker-code');
        if (!this.input.getAttribute('placeholder')) {
            this.input.setAttribute('placeholder', 'BCP 47 code (e.g., en-US)');
        }

        this.languagePickerWrap = document.createElement('div');
        this.languagePickerWrap.className = 'language-picker-wrap';
        this.languagePickerWrap.appendChild(this.languagePickerSelect);
        if (this.input.parentNode) {
            this.input.parentNode.insertBefore(this.languagePickerWrap, this.input);
        } else if (this.control) {
            this.control.appendChild(this.languagePickerWrap);
        }
        this.languagePickerWrap.appendChild(this.input);

        this.languagePickerSelect.addEventListener('change', this.onPickerChange.bind(this));
        this.input.addEventListener('input', this.onCodeInput.bind(this));

        this.syncPickerToValue(this.getValue());
        this.languagePickerSelect.disabled = !!this.input.disabled;
    }

    createPickerOption(value, text) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        return option;
    }

    getPickerOptions() {
        if (
            typeof this.schema.pattern === 'string' &&
            this.schema.pattern.indexOf('^en') === 0
        ) {
            return languagePickerOptions.filter(function (item) {
                return englishLanguageCodes[item.code];
            });
        }
        return languagePickerOptions.slice();
    }

    findCanonicalLanguageCode(value) {
        var normalized = normalizeLanguageCode(value);
        if (!normalized) {
            return '';
        }
        for (var i = 0; i < this.pickerOptions.length; i++) {
            if (normalizeLanguageCode(this.pickerOptions[i].code) === normalized) {
                return this.pickerOptions[i].code;
            }
        }
        return '';
    }

    setCustomInputVisible(show) {
        if (!this.input) {
            return;
        }
        if (show) {
            this.input.classList.remove('language-picker-code-hidden');
        } else {
            this.input.classList.add('language-picker-code-hidden');
        }
    }

    syncPickerToValue(value) {
        if (!this.languagePickerSelect) {
            return;
        }
        var current = String(value || '').trim();
        var canonical = this.findCanonicalLanguageCode(current);

        if (canonical) {
            this.languagePickerSelect.value = canonical;
            this.input.value = canonical;
            this.value = canonical;
            this.setCustomInputVisible(false);
            return;
        }

        if (!current) {
            this.languagePickerSelect.value = '';
            this.input.value = '';
            this.value = '';
            this.setCustomInputVisible(true);
            return;
        }

        this.languagePickerSelect.value = '__custom__';
        this.input.value = current;
        this.value = current;
        this.setCustomInputVisible(true);
    }

    onPickerChange() {
        var selectedCode = this.languagePickerSelect.value;
        if (selectedCode === '__custom__') {
            this.setCustomInputVisible(true);
            this.input.focus();
            return;
        }

        if (!selectedCode) {
            this.input.value = '';
            this.value = '';
            this.setCustomInputVisible(true);
            this.onChange(true);
            return;
        }

        this.setValue(selectedCode);
        this.setCustomInputVisible(false);
        this.onChange(true);
    }

    onCodeInput() {
        if (!this.languagePickerSelect) {
            return;
        }
        var typed = String(this.input.value || '').trim();
        var canonical = this.findCanonicalLanguageCode(typed);

        if (!typed) {
            this.languagePickerSelect.value = '';
        } else if (canonical) {
            this.languagePickerSelect.value = canonical;
        } else {
            this.languagePickerSelect.value = '__custom__';
        }
        this.value = typed;
    }

    setValue(value, initial, fromTemplate) {
        super.setValue(value, initial, fromTemplate);
        this.syncPickerToValue(this.getValue());
    }

    refreshValue() {
        super.refreshValue();
        this.syncPickerToValue(this.value);
    }

    enable() {
        super.enable();
        if (!this.always_disabled && this.languagePickerSelect) {
            this.languagePickerSelect.disabled = false;
        }
    }

    disable() {
        super.disable();
        if (this.languagePickerSelect) {
            this.languagePickerSelect.disabled = true;
        }
    }
};

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.format === 'languagePicker') {
        return 'languagePicker';
    }
});
