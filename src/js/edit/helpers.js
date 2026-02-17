function parseOptionClasses(className) {
    var ret = {
        iconClass: null,
        otherClasses: []
    };
    if (!className || typeof className !== 'string') {
        return ret;
    }
    var parts = className.split(/\s+/);
    for (var i = 0; i < parts.length; i++) {
        var cls = parts[i];
        if (!cls) continue;
        if (!ret.iconClass && cls.indexOf(iconTheme) === 0) {
            ret.iconClass = cls;
            continue;
        }
        ret.otherClasses.push(cls);
    }
    return ret;
}

function addTextInputIcon(input, iconClass) {
    if (!input || !iconClass || !input.parentNode) return;
    if ((input.tagName || '').toLowerCase() !== 'input') return;
    if (!input.classList || !input.classList.contains('txt')) return;

    var wrapper = input.parentNode;
    if (!wrapper.classList || !wrapper.classList.contains('txt-icon-wrap')) {
        wrapper = document.createElement('span');
        wrapper.className = 'txt-icon-wrap';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
    }

    var marker = null;
    for (var i = 0; i < wrapper.children.length; i++) {
        var child = wrapper.children[i];
        if (child.classList && child.classList.contains('txt-input-icon')) {
            marker = child;
            break;
        }
    }
    if (!marker) {
        marker = document.createElement('span');
        marker.className = 'txt-input-icon';
        wrapper.insertBefore(marker, input);
    }

    marker.className = 'txt-input-icon ' + iconClass;
    input.classList.add('txt-has-icon');
}

function setControlFormat(control, schema) {
    if (!control || !schema || !schema.format) return;
    if (control.classList && control.classList.contains('form-control')) {
        control.setAttribute('data-format', schema.format);
    }
}

function draftsStableStringify(value) {
    return JSON.stringify(value, function (key, val) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            var ordered = {};
            Object.keys(val).sort().forEach(function (k) {
                ordered[k] = val[k];
            });
            return ordered;
        }
        return val;
    });
}

function draftsSetBaseline(doc) {
    if (doc === null || doc === undefined) {
        draftsBaseline = null;
        return;
    }
    try {
        draftsBaseline = draftsStableStringify(doc);
    } catch (e) {
        draftsBaseline = null;
    }
}

function draftsHasChanges(doc) {
    if (doc === null || doc === undefined) return false;
    var current;
    try {
        current = draftsStableStringify(doc);
    } catch (e) {
        return true;
    }
    if (draftsBaseline === null) {
        draftsBaseline = current;
        return false;
    }
    return current !== draftsBaseline;
}

export {
    parseOptionClasses,
    addTextInputIcon,
    setControlFormat,
    draftsStableStringify,
    draftsSetBaseline,
    draftsHasChanges
};
