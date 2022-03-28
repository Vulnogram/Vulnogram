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
            this._middleware = new CveServicesMiddleware(serviceUri, swPath);
            this._request = null;
        }

        // Session mgmt

        login(user, org, key) {
            return this._middleware.setCredentials({ user, org, key });
        }

        logout() {
            return this._middleware.destroy();
        }

        // API methods

        getCveIds() {
            return this._middleware.get('cve-id');
        };

        reserveCveIds(args) {
            return this._middleware.post('cve-id', args)
                       .then(data => data.cve_ids);
        }

        reserveCveId(year = new Date().getFullYear()) {
            return this._middleware.orgName
                       .then(orgName => {
                           let args = {
                               amount: 1,
                               cve_year: year,
                               short_name: orgName,
                           };

                           return this.reserveCveIds(args);
                       });
        }

        reserveSeqCveIds(n = 1, year = new Date().getFullYear()) {
            return this._middleware.orgName
                .then(orgName => {
                    let args = {
                        amount: n,
                        cve_year: year,
                        short_name: orgName,
                        batch_type: 'sequential',
                    };

                    return this.reserveCveIds(args);
                });
        }

        reserveNonSeqCveIds(n = 1, year = new Date().getFullYear()) {
            return this._middleware.orgName
                .then(orgName => {
                    let args = {
                        amount: n,
                        cve_year: year,
                        short_name: orgName,
                        batch_type: 'nonsequential',
                    };

                    return this.reserveCveIds(args);
                });
        }

        getCveId(id) {
            return this._middleware.get('cve-id/'.concat(id));
        }

        updateCveId(id, record) {
            return this._middleware.put('cve-id/'.concat(id), record);
        }

        getCves() {
            return this._middleware.get('cve');
        }

        getCve(id) {
            return this._middleware.get('cve/'.concat(id));
        }

        createCve(id, schema) {
            return this._middleware.post('cve/'.concat(id), undefined, schema);
        }

        updateCve(id, schema) {
            return this._middleware.put('cve/'.concat(id), undefined, schema);
        }

        getOrgInfo() {
            return this._middleware.orgName
                .then(orgName =>
                    this._middleware.get('org/'.concat(orgName)));
        }

        updateOrgInfo(orgInfo) {
            return this._middleware.orgName
                .then(orgName =>
                    this._middleware.get('org/'.concat(orgName), orgInfo));
        }

        createOrgUser(userInfo) {
            return this._middleware.orgName
                .then(orgName =>
                    this._middleware.post(`org/${orgName}/user`, undefined, userInfo));
        }

        updateOrgUser(username, userInfo) {
            return this._middleware.orgName
                .then(orgName =>
                    this._middleware.put(`org/${orgName}/user/${username}`, userInfo));
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
        constructor(serviceUri = 'https://cweawg.mitre.org/api', swPath = 'sw.js') {
            this.serviceUri = serviceUri;
            this.registration;
            this.swPath = swPath;

            if (!('serviceWorker' in navigator)) {
                throw MiddlewareError("Service Workers are not available in your browser.");
            }
        }

        get worker() {
            if (this.registration) {
                return Promise.resolve(this.registration.active);
            }

            let serviceUri = this.serviceUri;

            let initWorker = (worker) => {
                let init_msg = { type: 'init',
                                serviceUri };

                this.simpleMessage(worker, init_msg);
            };

            return navigator.serviceWorker.register(this.swPath)
                .then(reg => {
                    this.registration = reg;

                    if (reg.installing != undefined) {
                        return new Promise(resolve => {
                            let worker = reg.installing;

                            worker.addEventListener('statechange', (e) => {
                                if (e.target.state == 'activated') {
                                    initWorker(e.target);
                                    resolve(e.target);
                                }
                            });
                        });
                    } else {
                        initWorker(reg.active);
                        return reg.active;
                    }
                });
        }

        simpleMessage(worker, msg) {
            return new Promise(resolve => {
                let channel = new MessageChannel();

                channel.port1.onmessage = (msg) => {
                    resolve(msg.data);
                };

                worker.postMessage(msg, [channel.port2]);
            }, reject => {
                worker.onmessageerror = reject;
            });
        }

        send(msg) {
            return this.worker.then(worker => {
                return this.simpleMessage(worker, msg).then(res => {
                    if ('error' in res) {
                        return Promise.reject(res.error);
                    } else {
                        return res.data;
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

            return this.send(msg);
        }

        destroy() {
            if (this.registration)
                return this.registration.unregister();

            return Promise.resolve(false);
        }
    }

    if (window != undefined) {
        window.CveServices = CveServices;
        window.CveServicesMiddleware = CveServicesMiddleware;
    }

    return CveServices;
}));
