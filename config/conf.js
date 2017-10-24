module.exports = {

    // The Mongodb URL where CVE entries and users are stored.
    database: 'mongodb://vulnogram:Use a long & strong Password@localhost:27017/vulnogram',

    // Name of the organization that should be used in page titles etc.,
    orgName: 'Example & Co',

    // Name of the group that should be used in page titles etc.,
    groupName: 'Product Security Incident Response Team',

    //CNA contact address
    contact: 'psirt@example.net',

    classification: 'Confidential INTERNAL USE ONLY',
    copyright: '© Example.com',
    // Pug templates for advisories can be customized by duplicating the directory cve/common/ and changing this parameter
    advisoryTemplates: 'common',

    // Uncomment this line and set a random string to allow unauthenticated access to draft CVE entries that are in review-ready or publish-ready state via /review/<token>/ or /review/<token>/CVE-ID
    // This may be useful to share a link to the draft for internal reviews and only those with the link have access to the drafts.    
    //reviewToken: '4XAIeq5atD7',

    appName: 'Vulnogram',
    // port where this tool is running
    serverPort: 3555,
    basedir: '/',

    // ACE editor
    ace: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.8/ace.js',
    aceHash: "sha384-sVVk7tngixhF2/zKU0IYtVvpuVYLTwt9srAn1ZjLJeEWKh9AebgDI+PD3USZfpBH",

    // JSON Editor
    jsoneditor: 'https://cdnjs.cloudflare.com/ajax/libs/json-editor/0.7.28/jsoneditor.min.js',
    jsoneditorHash: "sha384-kPMw40PaU/i5rM9X+5s/7qmujSY7EXGocROnFOXOnywfZGxp2t4RbQZ1dFwh7UBB",
    
    //JSON to yaml convertor
    //yalmjs: 'https://cdnjs.cloudflare.com/ajax/libs/yamljs/0.3.0/yaml.min.js',
    // Utility routine to pre-fill CVE JSON with data from a defect tracking system.
    // Defect identifier is in req.params.bug
    // First query your defect or bug tracking system
    // Fill the skeleton JSON with relevant details, transform data as necessary
    //
    // Defaults for your CNA organization can also be customized in public/js/schemas.js CVEschema_custom
    
    
    cveRegex: 'CVE-[0-9]{4}-[0-9A-Za-z\.-]{4,}',
    usernameRegex: '[a-zA-Z0-9]{3,}',
    newCVE: function (req, res) {
        var CVE_JSON_skeleton = {
            "data_type": "CVE",
            "data_format": "MITRE",
            "data_version": "4.0",

            "CVE_data_meta": {
                "ASSIGNER": this.contact,
                "DATE_PUBLIC": "",
                "TITLE": "Example title goes here. See config/conf.js on how to configure this."
            },
            CNA_private: {
                "owner": "",
                "state": "drafting",
                "advisoryID": "",
                "defect": req.params.pr,
                "todo": []
            }
        };

        res.render('cves/edit', {
            title: 'Create a CVE entry from a defect',
            doc: {
                cve: CVE_JSON_skeleton,
            },
            csrfToken: req.csrfToken()
        });
    },

    //Override MITRE JSON Schema with defaults specific to CNA 
    CVEschema_custom: {
        definitions: {
            product: {
                properties: {
                    product_name: {
                        default: "Default Example Product"
                    }
                }
            },
            reference: {
                properties: {
                    url: {
                        default: "https://example.com/"
                    }
                }
            }
        },
        properties: {
            CVE_data_meta: {
                properties: {
                    ASSIGNER: {
                        default: "sirt@example.com",
                        options: {
                            // Set property hidden to true to hide this in the GUI CVE editor.
                            //hidden: true
                        }
                    }
                }
            },
            affects: {
                properties: {
                    vendor: {
                        properties: {
                            vendor_data: {
                                items: {
                                    properties: {
                                        vendor_name: {
                                            default: "Example.com",
                                            options: {
                                                hidden: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "exploit": {
                "default": ""
            },
            "work_around": {
                "items": {
                    "default": {
                        "lang": "eng",
                        "value": ""
                    }
                }
            },

            // Contents of this item will not be exported to MITRE (as seen under JSON tab)
            // This is ideal for a CNA to store meta data that could be considered confidential or not worth inclusion in cve list.
            "CNA_private": {
                properties: {
                    owner: {
                        type: "string",
                        "format": "radio",
                        enum: ["example", "team", "member", "names", "go", "here"]
                    },
                    state: {
                        "format": "radio",
                        "type": "string",
                        "enum": ["drafting", "review-ready", "publish-ready", "published", "deferred", "rejected", "merged"]
                    },
                    advisoryID: {
                        type: "string",
                        options: {
                            input_width: "20em"
                        }
                    },
                    defect: {
                        type: "string",
                        options: {
                            input_width: "20em"
                        }
                    },
                    todo: {
                        title: "Reminders",
                        type: "array",
                        format: "table",
                        items: {
                            title: "action item",
                            type: "string"
                        }
                    }
                },
                required: ["owner", "state", "defect", "todo"]
            }
        }
    }
};