// CVE5 list page interactions.
(function () {
    var inferredSchema = 'cve5';
    if (document.body && typeof document.body.className === 'string') {
        var className = document.body.className.trim();
        if (className) {
            inferredSchema = className.split(/\s+/)[0];
        }
    }

    var schemaName = (typeof window.schemaName === 'string' && window.schemaName) ? window.schemaName : inferredSchema;
    var currentYear = new Date().getFullYear();
    var defaultTimeout = 1000 * 60 * 60;

    window.schemaName = schemaName;
    window.currentYear = currentYear;
    window.defaultTimeout = defaultTimeout;

    function initTeamPublishSelected() {
        var statusEl = document.getElementById('teamPublishStatus');
        var publishButton = document.getElementById('teamPublishSelected');
        if (!publishButton) {
            return;
        }

        function setTeamStatus(text, isError) {
            if (!statusEl) {
                return;
            }
            statusEl.innerText = text || '';
            if (isError) {
                statusEl.classList.add('tred');
            } else {
                statusEl.classList.remove('tred');
            }
        }

        publishButton.addEventListener('click', async function (event) {
            event.preventDefault();
            var selected = Array.from(document.querySelectorAll('#vgListTable .rowCheck:checked')).map(function (el) {
                return el.value;
            }).filter(Boolean);
            if (selected.length == 0) {
                setTeamStatus('Select one or more drafts to publish.', true);
                return;
            }
            if (typeof cveTeamSetRowStatus === 'function') {
                selected.forEach(function (id) {
                    cveTeamSetRowStatus(id, 'Queued');
                });
            }

            publishButton.disabled = true;
            setTeamStatus('Loading ' + selected.length + ' selected drafts...');
            try {
                var response = await fetch('/' + schemaName + '/json/', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/plain, */*'
                    },
                    body: JSON.stringify({
                        ids: selected,
                        fields: ['body']
                    })
                });
                if (!response.ok) {
                    throw new Error(response.statusText || 'Failed to load selected drafts');
                }
                var docs = await response.json();
                var items = (docs || []).map(function (doc) {
                    var body = doc && doc.body ? doc.body : doc;
                    return {
                        id: body && body.cveMetadata ? body.cveMetadata.cveId : null,
                        doc: body
                    };
                }).filter(function (entry) {
                    return entry && entry.id && entry.doc;
                });
                if (items.length == 0) {
                    setTeamStatus('No publishable CVE drafts found in selection.', true);
                    if (typeof cveTeamSetRowStatus === 'function') {
                        selected.forEach(function (id) {
                            cveTeamSetRowStatus(id, 'Not publishable', true);
                        });
                    }
                    return;
                }
                setTeamStatus('Publishing ' + items.length + ' draft(s)...');
                var summary = await cvePublishItems(items, function (entry, state, message) {
                    if (!entry || !entry.id) {
                        return;
                    }
                    if (state == 'publishing') {
                        setTeamStatus('Publishing ' + entry.id + ' ...');
                        if (typeof cveTeamSetRowStatus === 'function') {
                            cveTeamSetRowStatus(entry.id, 'Publishing...');
                        }
                    } else if (state == 'published') {
                        if (typeof cveTeamSetRowStatus === 'function') {
                            cveTeamSetRowStatus(entry.id, message ? message : 'Published');
                        }
                    } else if (state == 'failed') {
                        setTeamStatus('Failed: ' + entry.id + ' - ' + message, true);
                        if (typeof cveTeamSetRowStatus === 'function') {
                            cveTeamSetRowStatus(entry.id, message ? message : 'Failed', true);
                        }
                    } else if (state == 'skipped') {
                        if (typeof cveTeamSetRowStatus === 'function') {
                            cveTeamSetRowStatus(entry.id, message ? message : 'Skipped', true);
                        }
                    }
                });
                if (summary.skipped == summary.total && summary.total > 0 && summary.failed == 0 && summary.published == 0) {
                    setTeamStatus('Login required to publish selected drafts.', true);
                } else if (summary.failed > 0) {
                    setTeamStatus('Published ' + summary.published + ' of ' + summary.total + '. Failed: ' + summary.failed + '.', true);
                } else {
                    setTeamStatus('Successfully published ' + summary.published + ' draft(s).');
                }
            } catch (e) {
                var errText = cvePublishErrorMessage(e);
                setTeamStatus(errText, true);
                if (typeof cveTeamSetRowStatus === 'function') {
                    selected.forEach(function (id) {
                        cveTeamSetRowStatus(id, errText, true);
                    });
                }
            } finally {
                publishButton.disabled = false;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTeamPublishSelected);
    } else {
        initTeamPublishSelected();
    }
})();
