/*
  * CVE Services REST API - ECMAScript 6 Client v1.0.0
  *
  * Copyright 2021, Ben N (pajexali@gmail.com)
  * See LICENSE for a full copy of the license.
  *
  * Provides simple JS interface to perform common actions in the CVE API for an
  * authenticated user, whilst storing API credentials locally in the browser.
*/

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

    class CveServices {
        constructor(serviceUri, creds) {
            if (serviceUri == null) {
                serviceUri = 'https://cweawg.mitre.org/api';
            }

            this._request = new CveServicesRequest(serviceUri, creds);
        }

        getCveIds(args) {
            return this._request.get('cve-id', args)
                .then(data => data.cve_ids);
        };

        reserveCveIds(args) {
            return this._request.post('cve-id', args)
                .then(data => data.cve_ids);
        }

        reserveCveId(year = new Date().getFullYear()) {
            return this._request.orgName
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
            return this._request.orgName
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
            return this._request.orgName
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
            return this._request.get(['cve-id', id].join('/'));
        }

        updateCveId(id, record) {
            return this._request.put(`cve-id/${id}`, record);
        }

        getCves() {
            return this._request.get('cve');
        }

        getCve(id) {
            return this._request.get(`cve/${id}`);
        }

        createCve(id, schema) {
            return this._request.post(`cve/${id}`, undefined, schema);
        }

        updateCve(id, schema) {
            return this._request.put(`cve/${id}`, undefined, schema);
        }

        getOrgInfo() {
            return this._request.orgName
                .then(org =>
                    this._request.get(['org', org].join('/')));
        }

        getOrgUsers() {
            return this._request.orgName
                .then(org =>
                        this._request.get(['org', org, 'users'].join('/')));
        }

        getOrgIdQuota() {
            return this._request.orgName
                .then(org =>
                      this._request.get(['org', org, 'id_quota'].join('/')));
        }

        getOrgUser(username) {
            return this._request.orgName
                .then(org =>
                      this._request.get(['org', org, 'user', username].join('/')));
        }
    };

    class CveServicesRequest {
        constructor(serviceUri, creds) {
            this._clientAuth = creds;
            this._serviceUri = serviceUri;
        }

        middleware() {
            return this.clientLogin()
                .then((cred) => {
                    return {
                        headers: {
                            'CVE-API-KEY': cred.key,
                            'CVE-API-ORG': cred.org,
                            'CVE-API-USER': cred.user,
                        }
                    };
            });
        }

        get orgName() {
            let obj = this;

            return new Promise(resolve => {
                if (obj._clientAuth != null) {
                    resolve(obj._clientAuth.org);
                } else {
                    obj.clientLogin()
                        .then(cred => resolve(cred.org));
                }
            });
        }

        get userName() {
            let obj = this;

            return new Promise(resolve => {
                if (obj._clientAuth != null) {
                    resolve(obj._clientAuth.user);
                } else {
                    obj.clientLogin()
                        .then(cred => resolve(cred.user));
                }
            });
        }

        clientLogin() {
            if (this._clientAuth == null) {

                // Look in session storage as first cache
                let creds = window.sessionStorage.getItem('cve-services-creds');

                if (creds != undefined) {
                    let parsed_creds = JSON.parse(creds);

                    this.cacheLogin(parsed_creds);
                    return Promise.resolve(this._clientAuth);
                }

                let getFunc;
                let setFunc;

                if (window.PasswordCredential) {
                    return this.clientLoginBrowserCred();
                } else {
                    return this.clientLoginLocalStorage();
                }
            } else {
                return Promise.resolve(this._clientAuth);
            }
        }

        cacheLogin(creds) {
            if (this._clientAuth == null) {
                this._clientAuth = creds;
            }

            //if (window.sessionStorage.getItem('cve-services-creds') == null) {
            //    sessionStorage.setItem('cve-services-creds', JSON.stringify(creds));
            //}
        }

        clientLoginLocalStorage() {
            let object = this;

            const returnCreds = function(masterKey, clientAuth) {

                const iv = localStorage.getItem('cve-api-key-iv')
                    .split(",").map(x => { return parseInt(x); });

                let apiKeyEnc = localStorage.getItem('cve-api-key')
                    .split(",").map(x => { return parseInt(x); });

                let apiKeyBuf = new Uint8Array(apiKeyEnc.length);

                for (let i = 0; i < apiKeyEnc.length; i++) {
                    apiKeyBuf[i] = apiKeyEnc[i];
                }

                apiKeyBuf = apiKeyBuf.buffer;

                let ivBuf = new Uint8Array(iv.length);

                for (let i = 0; i < iv.length; i++) {
                    ivBuf[i] = iv[i];
                }

                return crypto.subtle
                    .decrypt({name: "AES-GCM", iv: ivBuf}, masterKey, apiKeyBuf)
                    .then(keyBuf => {
                        let keyStr = new TextDecoder().decode(keyBuf);
                        let [user, org, key] = keyStr.split('|');
                        let creds = { key, org, user };

                        object.cacheLogin(creds);

                        return object._clientAuth;
                    });
            };

            if (!localStorage.hasOwnProperty('cve-api-key')) {
                return this.clientStoreLocalStorageCred()
                    .then((masterKey, clientAuth) => returnCreds(masterKey));

            } else {
                return this.clientLocalStoragePassToKey()
                    .then((masterKey, clientAuth) => returnCreds(masterKey));
            }
        }

        clientLoginBrowserCred() {
            let storeCred = this.clientStoreBrowserCred;

            return navigator.credentials.get({password: true})
                .then(cred => {
                    if (cred == null) {
                        return storeCred();
                    } else {
                        return cred;
                    }
                })
                .then(cred => {
                    let [user, org] = cred.id.split("|");
                    let key = cred.password;
                    let creds = { key, org, user };
                    this.cacheLogin(creds);

                    return this._clientAuth;
                });
        }

        clientLocalStoragePassToKey() {
            const passphrase = prompt("Enter your passphrase to secure your CVE credentials:");

            let encoder = new TextEncoder();
            let passphraseEnc = encoder.encode(passphrase);

            return crypto.subtle.digest("SHA-256", passphraseEnc)
                .then(digest => crypto.subtle.importKey("raw",
                                                        digest,
                                                        {name: "AES-GCM"},
                                                        false,
                                                        ["encrypt", "decrypt"]));
        }

        clientStoreLocalStorageCred() {
            return this.clientLocalStoragePassToKey()
                .then(masterKey => {
                    const apiKey = prompt("Provide CVE API key:");
                    const user = prompt("Provide CVE API username:");
                    const org = prompt("Provide CVE API organisation name:");

                    const keyStr = [user, org, apiKey].join('|');

                    let enc = new TextEncoder();
                    let apiKeyEnc = enc.encode(keyStr);

                    let iv = crypto.getRandomValues(new Uint8Array(12));

                    return crypto.subtle.encrypt({name: "AES-GCM", iv}, masterKey, apiKeyEnc)
                        .then(key => {
                            var keyArray = new Uint8Array(key);

                            localStorage.setItem('cve-api-key', keyArray);
                            localStorage.setItem('cve-api-key-iv', iv);

                            return masterKey;
                        });
                });
        }

        clientStoreBrowserCred() {
            return new Promise(resolve => {
                let doc = window.document;

                alert("You have not yet stored your credentials.\n" +
                    "You will be prompted for your CVE API account details now.");

                let org = prompt('CNA organisation short name: ');
                let user = prompt('CVE API account username: ');
                let key = prompt('CVE API KEY: ');

                let cred = new PasswordCredential({ id: 'cve-services',
                                                    name: `${user}|${org}`,
                                                    password: key });

                navigator.credentials.store(cred)
                    .then(result => console.log(result));

                resolve(cred);
            });
        }

        get(path, query) {
            return this.middleware()
                .then(opts => {
                    let queryPath = '';

                    if (query) {
                        queryPath = new URLSearchParams(query).toString();
                    }

                    return fetch(`${this._serviceUri}/${path}?${queryPath}`, opts)
                        .then(res => res.json());
                });
        }

        post(path, query, body) {
            return this.middleware()
                .then(opts => {
                    opts.method = 'POST';

                    let queryPath = '';

                    if (query) {
                        queryPath = '?' + new URLSearchParams(query).toString();
                    }

                    if (body) {
                        opts.headers['Content-Type'] = 'application/json';
                        opts.body = JSON.stringify(body);
                    }

                    return fetch(`${this._serviceUri}/${path}${queryPath}`, opts);
                });
        }

        put(path, query, body) {
            return this.middleware()
                .then(opts => {
                    opts.method = 'PUT';

                    let queryPath = '';

                    if (query) {
                        queryPath = '?' + new URLSearchParams(query).toString();
                    }

                    if (body) {
                        opts.headers['Content-Type'] = 'application/json';
                        opts.body = JSON.stringify(body);
                    }

                    return fetch(`${this._serviceUri}/${path}?${queryPath}`, opts);
                });
        }
    };

    if (window != undefined) {
        window.CveServices = CveServices;
    }

    return CveServices;
}));