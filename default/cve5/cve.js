//
// CVE.js
// Filename: cve.js
//
// Author: Ben Nott <pajexali@gmail.com>
//
// Description: Exposes MITRE CVE API through CveServices using Service Worker
// middleware for credential storage and request handling.
//
// Copyright 2022, Ben Nott <pajexali@gmail.com>.
// See LICENSE for a full copy of the license.
//

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    class NoCredentialsError extends Error {};

    class CredentialError extends Error {};

    class MiddlewareError extends Error {};

    class CveServices {
        constructor(serviceUri = 'https://cveawg.mitre.org/api', swPath = 'sw.js') {
            //console.log('called constructer');
            this._middleware = new CveServicesMiddleware(serviceUri, swPath);
}

        // Session mgmt

        login(user, org, key, rememberMe) {
            //console.log('called login');
            return this._middleware.setCredentials({ user, org, key, rememberMe });
        }

        logout() {
            //console.log("Called logout");
            return this._middleware.destroy();
        }

        getSession() {
            return this._middleware.getSession();
        }

        // API methods

        getCveIds(args) {
            return this._middleware.get('cve-id', args);
        };

        reserveCveIds(args) {
            return this._middleware.post('cve-id', args);
        }

        getCveId(id) {
            return this._middleware.get('cve-id/'.concat(id));
        }

        updateCveId(id, state, org = undefined) {
            let record = { state };

            if (org)
                record['org'] = org;

            return this._middleware.put('cve-id/'.concat(id), record);
        }

        getCve(id) {
            return this._middleware.get('cve/'.concat(id));
        }

        createCve(id, schema) {
            return this._middleware.post('cve/'.concat(id, '/cna'), undefined, schema);
        }

        updateCve(id, schema) {
            return this._middleware.put('cve/'.concat(id, '/cna'), undefined, schema);
        }

        updateAdp(id, schema) {
            return this._middleware.put('cve/'.concat(id, '/adp'), undefined, schema);
        }

        createRejectedCve(id, schema) {
            return this._middleware.post('cve/'.concat(id, '/reject'), undefined, schema);
        }

        updateRejectedCve(id, schema) {
            return this._middleware.put('cve/'.concat(id, '/reject'), undefined, schema);
        }

        getOrg() {
            return this._middleware.orgName.then(orgName => orgName);
        }

        getOrgInfo() {
            return this._middleware.orgName
                .then(orgName =>
                    this._middleware.get('org/'.concat(orgName)));
        }

        createOrgUser(userInfo) {
            return this._middleware.orgName
                .then(orgName =>
                    this._middleware.post(`org/${orgName}/user`, undefined, userInfo));
        }

        updateOrgUser(username, userInfo) {
            return this._middleware.orgName
                .then(orgName =>
                    this._middleware.put(`org/${orgName}/user/${username}`, userInfo, undefined));
        }

        resetOrgUserApiKey(username) {
            return this._middleware.orgName
                .then(orgName =>
                    this._middleware.put(`org/${orgName}/user/${username}/reset_secret`));
        }

        getOrgUsers() {
            return this._middleware.orgName
                .then(orgName =>
                    this._middleware.get(`org/${orgName}/users`));
        }

        getOrgIdQuota() {
            return this._middleware.orgName
                .then(orgName =>
                    this._middleware.get(`org/${orgName}/id_quota`));
        }

        getOrgUser(username) {
            return this._middleware.orgName
                .then(orgName =>
                    this._middleware.get(`org/${orgName}/user/${username}`));
        }
    };

    class CveServicesMiddleware {
        constructor(serviceUri = 'https://cveawg.mitre.org/api', swPath = 'sw.js') {
            this.serviceUri = serviceUri;
            this.registration;
            this.swPath = swPath;

            if (!('serviceWorker' in navigator)) {
                throw MiddlewareError("Service Workers are not available in your browser.");
            }
        }

        get worker() {
            let serviceUri = this.serviceUri;

            let initWorker = (worker) => {
                this.simpleMessage(worker, { type: 'init', serviceUri });
            };

            if (this.registration && this.registration.active) {
                if (!this._initialized) {
                    this._initialized = true;
                }
                // Always send init so a browser-terminated+restarted SW gets
                // storage.serviceUri restored (SW restart clears in-memory state
                // but leaves registration.active non-null with no browser event).
                initWorker(this.registration.active);
                return Promise.resolve(this.registration.active);
            }

            if (this.registration && !this.registration.active) {
                const pending = this.registration.installing || this.registration.waiting;
                if (pending) {
                    return new Promise(resolve => {
                        pending.addEventListener('statechange', (e) => {
                            if (e.target.state === 'activated') {
                                this._initialized = true;
                                initWorker(e.target);
                                resolve(e.target);
                            }
                        });
                    });
                }
            }

            return navigator.serviceWorker.register(this.swPath)
                .then(reg => {
                    this.registration = reg;

                    if (reg.installing != undefined) {
                        return new Promise(resolve => {
                            let worker = reg.installing;

                            worker.addEventListener('statechange', (e) => {
                                if (e.target.state == 'activated') {
                                    this._initialized = true;
                                    initWorker(e.target);
                                    resolve(e.target);
                                }
                            });
                        });
                    } else {
                        this._initialized = true;
                        initWorker(reg.active);
                        return reg.active;
                    }
                });
        }

        simpleMessage(worker, msg) {
            return new Promise((resolve, reject) => {
                let channel = new MessageChannel();

                channel.port1.onmessage = (msg) => {
                    if ('debug' in msg)
                        console.log(msg);
                    resolve(msg.data);
                };
                channel.port1.onmessageerror = reject;

                worker.postMessage(msg, [channel.port2]);
            });
        }

        send(msg) {
            return this.worker.then(worker => {
                return this.simpleMessage(worker, msg).then(res => {
                    if(typeof res === 'object' && 'error' in res) {
                        return Promise.reject(res);
                    } else {
                        return res;
                    }
                });
            });
        }

        serviceRequest(request) {
            let msg = {
                type: 'request',
                ...request,
            };

            return this.send(msg);
        }

        echo() {
            return this.send({type: 'echo'});
        }

        setCredentials(creds) {
            let msg = {
                type: 'login',
                creds,
            };

            return this.send(msg);
        }

        get(path, query) {
            let req = {
                method: 'GET',
                path, query
            };

            return this.serviceRequest(req);
        }

        post(path, query, body) {
            let req = {
                method: 'POST',
                path, query, body
            };

            return this.serviceRequest(req);
        }

        put(path, query, body) {
            let req = {
                method: 'PUT',
                path, query, body
            };

            return this.serviceRequest(req);
        }

        get orgName() {
            let msg = {
                type: 'getOrg',
            };
            var o = this.send(msg);
            return o;
        }

        getSession() {
            return this.send({ type: 'getSession' });
        }

        destroy() {
            let unregisterCurrent = () => {
                let reg = this.registration;
                if (!reg) {
                    return Promise.resolve(true);
                }
                return reg.unregister()
                    .catch(() => false)
                    .then(() => {
                        this.registration = undefined;
                        this._initialized = false;
                        return true;
                    });
            };

            // Ensure destroy reaches the worker before unregistration.
            // destroySession() in the SW broadcasts the logout event.
            return this.send({type: 'destroy'})
                .catch(() => false)
                .then(() => unregisterCurrent())
                .then(() => true)
                .catch(() => false);
        }
    }

    if (window != undefined) {
        window.CveServices = CveServices;
        window.CveServicesMiddleware = CveServicesMiddleware;
    }

    return CveServices;
}));
