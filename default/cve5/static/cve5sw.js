//
// CveServices - Service Worker Middleware
// Filename: sw.js
//
// Author: Ben N
//
// Description: Handles exchange of API requests with credentials.
//
// Copyright 2022, Ben Nott <pajexali@gmail.com>.
// See LICENSE for a full copy of the license.
//

const storage = {};

destroySession = () => {
    if ('creds' in storage) {
        delete storage['creds'];
    }
};

setSessionTimer = () => {
    let defaultTimeout = 1000 * 60 * 60;

    setTimeout(
        destroySession,
        defaultTimeout
    );
};

setCredentials = (creds) => {
    storage.creds = creds;
    setSessionTimer();
};

clientReply = (e, msg) => {
    e.ports[0].postMessage(msg);
};

checkSession = (e) => {
    if (!('creds' in storage)) {
        clientReply(e, {error: "NO_SESSION", message: "You are not logged in." });
        return false;
    }

    return true;
};

defaultOpts = () => {
    return {
        headers: {
            'content-type': 'application/json',
            'CVE-API-KEY': storage.creds.key,
            'CVE-API-ORG': storage.creds.org,
            'CVE-API-USER': storage.creds.user,
        },
    };
};

getURL = (path, query) => {
    let url = new URL(`/api/${path}`, storage.serviceUri);

    if (query) {
        for (const [k, v] of Object.entries(query)) {
            url.searchParams.append(k, v);
        }
    }

    return url.toString();
};

doFetch = (event, url, opts) => {
    return fetch(url, opts)
        .then(res => {
            if (res.ok) {
                res.json().then(data => clientReply(event, data));
            } else {
                res.json().then(msg => {
                    clientReply(event, msg);
                });
            }
        })
        .catch(err => {
            clientReply(event, { error: err });
        });
};

requestService = (event) => {
    let { query, path, method } = event.data;

    let opts = defaultOpts();
    let url = getURL(path, query);

    if (['PUT', 'POST'].includes(method)) {
        opts.method = method;

        if ('body' in event.data) {
            opts.body = JSON.stringify(event.data.body);
        }
    }

    return doFetch(event, url, opts);
};

self.onmessage = e => {
    switch (e.data.type) {
        case 'init':
            if ('serviceUri' in e.data) {
                storage.serviceUri = e.data.serviceUri;
                clientReply(e, 'ok');
            }
            break;
        case 'echo':
            clientReply(e, 'echo');
            break;
        case 'login':
            setCredentials(e.data.creds);
            clientReply(e, 'ok');
            break;
        case 'request':
            if (checkSession(e)) {
                requestService(e);
            }
            break;
        case 'getOrg':
            if (checkSession(e)) {
                clientReply(e, storage.creds.org);
            }
            break;
        default:
            clientReply(e, {error: 'Not supported'});
            break;
    }
};
