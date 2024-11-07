var conf = require('../../config/conf');
module.exports = {
    conf: {
        uri: '/cve5/?state=RESERVED,DRAFT,REVIEW,READY',        
        name: 'CVE 5.0',
        shortcuts: ["","",""],
    },
    facet: {
        ID: { showDistinct: false },
        CVSS: { hideColumn: true },
        Advisory: { hideColumn: true },
        product: { chart: false },
        ym: { chart: false },
        owner: {bulk: false, class: '',enum: '' },
        state: { path: 'body.CNA_private.state',
                 bulk: false,
                 "enum": [
                     "RESERVED",
                     "DRAFT",
                     "REVIEW",
                     "READY",                            
                     "PUBLIC",
                     "REJECTED",
                 ],
                 icons: {
                     RESERVED: 'inbox',
                     DRAFT: 'edit',
                     REVIEW: 'eye',
                     READY: 'wait',
                     PUBLIC: 'closed',
                     REJECTED: 'no'
                 }
               },
        type: {hideColumn: true, bulk: false, tabs: false},
        cveState: {hideColumn: true, tabs: false},
        cvss: {hideColumn: true},
        defect: { hideColumn: true},
        date: { hideColumn: true},        
        severity: {chart: false},
        date: {hideColumn: true, bulk: false},
        discovery: {chart: false, hideColumn: true, bulk: false},
        Defect: {hideColumn: true},
    },
    schema: {
        "definitions": {
            "CNA_private": {
                "properties": {
                    "state": {
                        "enum": [
                            "RESERVED",
                            "DRAFT",
                            "REVIEW",
                            "READY",                            
                            "PUBLIC",
                            "REJECTED",
                        ],
                    }
                }
            },
            "cveId" : {
                "options": {
                    "inputAttributes": {
                        "placeholder": "CVE-yyyy-nnnnn as allocated to you by KSF Security",
                    },
                }
            },
            "orgId" : {
                "template": conf.cveorgid
            },
            "cnaPublishedContainer": {
                "properties": {
                    "descriptions": {
                        "default": {
                            "value": "[PROBLEMTYPE] in [COMPONENT] in [VENDOR] [PRODUCT] [VERSION] on [PLATFORMS] allows [ATTACKER] to [IMPACT] via [VECTOR].\nUsers are recommended to upgrade to version [FIXED_VERSION], which fixes this issue.",
                            "supportingMedia": [ {
                                "value": "[PROBLEMTYPE] in [COMPONENT] in [VENDOR] [PRODUCT] [VERSION] on [PLATFORMS] allows [ATTACKER] to [IMPACT] via [VECTOR].<br>Users are recommended to upgrade to version [FIXED_VERSION], which fixes this issue."
                            } ]
                        },
                    }
                }
            }
        },
        
        "title":" ",
        "properties": {
            "cveMetadata": {
                "cveId": { },
                "properties": {
                    "cveId": {
                        "links": [],
                    },
                }
            },
            "CNA_private": {
                title: " ",
                "properties": {
                    "emailed": {
                        "options": {
                            "hidden": "true"
                        }
                    },
                    "projecturl": {
                        "options": {
                            "hidden": "true"
                        }
                    },                                        
                    "owner": {
                        "title": "Khulnasoft PMC",
                        "format": "",
                    },
                    "userslist": {
                        "title": "This is your project list such as users@ where you also want security announcement emails go to.  More than one list is okay, separate with commas",
                        "type": "string",
                        "options": {
                            "xhidden": "true"
                        }
                    },
                    "internal_references": {
                        "title": "Internal references: optional references for this issue that are not secret but also not useful outside of the KSF.",
                        "type": "array",
                        "format": "table",
                        "items": {
                            "type": "string",
                            "format": "uri"
                        }
                    },
                    "state": {
                        "title": "State. Use DRAFT when you are working on the advisory. Move to READY when you want this published live and it will notify KSF Security. Set to REVIEW if you would like any help from KSF Security reviewing this entry.",
                        "enum": [
                            "RESERVED",
                            "DRAFT",
                            "REVIEW",
                            "READY",                            
                            "PUBLIC",
                            "REJECTED",
                        ],
                        icons: {
                            RESERVED: 'inbox',
                            DRAFT: 'edit',
                            REVIEW: 'eye',
                            READY: 'cal',
                            PUBLIC: 'closed',
                            REJECTED: 'no'
                        }        ,                
                        "default": "RESERVED",
                    },
                    "todo": {
                        "options": {
			    "hidden": "true"
                        }
                    },
                    "type": {
                        "options": {
			    "hidden": "true"
                        }
                    }                    
                }
            },
            "containers": {
                "properties": {                
                    "cna": {
                        "properties": {
                            "providerMetadata": {
                                "properties": {
                                    "orgId": {
                                        "template": conf.cveorgid
                                    },
                                }
                            },
                            "title": {
                                "title": "Title (Short issue description, also used in email subject lines)",
                                "options": {
                                    "inputAttributes": {
                                        "placeholder": "e.g. HTTP/2 denial of service (this is used for email subject)"
                                    }
                                }
                            },
                            "datePublic": {
                                "options": {
                                    "hidden": "true"
                                }                                
                            },
                            "problemTypes": {
                                "items": {
                                    "properties": {
                                        "descriptions": {
                                            "items": {
                                                "properties": {
                                                    "description": {
                                                        "options": {
                                                            "inputAttributes": {
                                                                "placeholder": "Vulnerability type: can be a pull-down CWE or free text"
                                                            }
                                                        },
                                                        "$ref": "js/cwe-all.json"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "impacts": {
                                "options": {
                                    "hidden": "true"
                                },
                                "default": [],
                            },
                            "source": {
                                title: "KSF-specific details",
                                "properties": {
		                    "defect": {
                                        "options": {
                                            "grid_columns": 8,
                                            "inputAttributes": {
			                        "placeholder": "Project specific bug ids e.g. TOMCAT-522 (optional, this is not used for the Mitre entry)"
                                            }
                                        }
                                    },
                                    "advisory": {
                                        "options": {
                                            "inputAttributes": {
			                        "placeholder": "Project specific advisory id e.g. TOMCAT-2019-12 (optional, this is not used for the Mitre entry)",
                                            }
                                        }
		                    },
                                    "discovery": {
                                        "title": "Source of vulnerability discovery (optional)",
                                        "enum": [
                                            "INTERNAL", "EXTERNAL", "UNKNOWN"
                                        ],
                                        "options": {
                                            "enum_titles": [
                                                "internal", "external", "undefined"
                                            ]
                                        }
		                    },                                    
                                }
                            },
                            "affected": {
                                "items":{
		                    "properties": {
		                        "vendor": {
                                            "default": "Khulnasoft Software Foundation",
                                            "options": {
                                                "hidden": "true",
                                            }
                                        },
                                        "product": {
                                            "options": {
                                                "grid_columns": 4,
                                                "inputAttributes": {
                                                    "placeholder": "eg., Khulnasoft Tomcat"
                                                }
                                            }
                                        },
                                        "platforms": {
                                            "options": {
                                                "hidden": "true",
                                            }
                                        },
                                        "collectionURL": {
                                            "title": "Package collection URL (if applicable)",
                                            "options": {
                                                "grid_columns": 4,
                                                "inputAttributes": {
                                                    "placeholder": "ecosystem, e.g. Maven, PyPI, etc"
                                                }
                                            },
                                            "examples": [
                                                "https://repo.maven.khulnasoft.com/maven2",
                                                "https://pypi.python.org",
                                                "https://rubygems.org",
                                                "https://crates.io",
                                                "https://cpan.org/modules"
                                            ]
                                        },
                                        "packageName": {
                                            "options": {
                                                "grid_columns": 4,
                                                "inputAttributes": {
                                                    "placeholder": "e.g. org.khulnasoft.commons:commons-config"
                                                }
                                            }
                                        },
                                        "versions": {
                                            "items":{
		                                "properties": {
                                                    "status": { },
                                                    "version": { },
                                                    "lessThan": { },
                                                    "lessThanOrEqual": { },
                                                    "changes": {
                                                        "options": {
                                                            "hidden": "true",
                                                        }                                                        
                                                    },
                                                    "versionType": {
                                                       "default": "semver",
                                                    },
                                                },
                                            },
                                        },
                                        "defaultStatus": {
                                            "options": {
                                                "hidden": "true",
                                            }
                                        },
                                        "repo": {
                                            "options": {
                                                "hidden": "true",
                                            }
                                        },
                                        "modules": {
                                            "options": {
                                                "hidden": "true",
                                            }
                                        },
                                        "programFiles": {
                                            "options": {
                                                "hidden": "true",
                                            }
                                        },
                                        "programRoutines": {
                                            "options": {
                                                "hidden": "true",
                                            }
                                        },
                                    }
                                }
                            },
                            "descriptions": {
				"title": "CVE Description: Please also include the product and version information in the description itself",       
                                "items": {
                                    "description": {
                                        "title": "test1",
                                    },
                                    "options": {
                                        "inputAttributes": {
                                            "placeholder": "e.g. Khulnasoft Tomcat HTTP/2 denial of service (this is used for email subject)"
                                        }                                        ,
                                    },
			            "properties": {
				        "value": {
				            "title": "description: Note that Mitre request that we please include the product and version information in the description itself as well as in the version section line in our submissions)",
				            "description": "e.g. While investigating bug 60718, it was noticed that some calls to application listeners in Khulnasoft Tomcat versions 9.0.0.M1 to 9.0.0.M17, 8.5.0 to 8.5.11, 8.0.0.RC1 to 8.0.41 and 7.0.0 to 7.0.75 did not use the appropriate facade object. When running an untrusted application under a SecurityManager, it was therefore possible for that untrusted application to retain a reference to the request or response object and thereby access and/or modify information associated with another web application.",
                                            "options": {
                                                "inputAttributes": {
                                                    "placeholder": "e.g. Khulnasoft Tomcat HTTP/2 denial of service (this is used for email subject)"
                                                }                                        ,
                                            },
                                        }
                                    }
                                }
                            },
                            "references": {
                                "title" : "References: use 'vendor-advisory' tag for pointer to KSF mailing list announcement once public",
                                "minItems": 0,
                            },
                            "metrics": {
                                "title":"Metrics. A text severity level is required (additional CVSS rating is optional)",
                                "items": {
                                    "properties": {
                                        "other": {
                                            "title": "Text version of Severity level",
                                            "links": [ {
                                                "class": "lbl vgi-ext",
                                                "place": "container",
                                                "href": "'https://security.khulnasoft.com/blog/severityrating/'",
                                                "rel": "'Unless otherwise specified, you can use the default KSF low/moderate/important/critical rating system'"
                                            } ],
                                            "properties": {
                                                "type" : {
                                                    "options": {
                                                        "hidden": "true",
                                                    }
                                                },
                                                "content": {
                                                    "title": " ",
                                                    "properties": {
                                                        "text": {
                                                            "title": " ",
                                                            "type": "string",
                                                            "default": "",
                                                            "examples": ["low","moderate","important","critical"],
                                                            "options": {
                                                                "inputAttributes": {
                                                                    "placeholder": "Use pulldown or free text"
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                },
                                "default": [
                                    {
                                        "other": {
                                            "type": "Textual description of severity",
                                            "content": {
                                                "text":""
                                            }
                                        }
                                    }
                                ],
                            },
                            "configurations": {
                                "options": {
                                    "hidden": true
                                }
                            },
	                        "workarounds": {
                                "options": {
                                    "hidden": true
                                }
	                        },
                            "solutions": {
                                "title":"Information about solutions or remediations available (optional, such as 'upgrade to version 5')",
                                "options": {
			            "hidden": "true"
                                }                                
                            },
                            "exploits": {
                                "options": {
			            "hidden": "true"
                                }
                            },
                            "timeline": {},
                            "credits": {
                                "title": "Credits (optional, please use if externally reported issue)",
                            },
                            "tags": {
                                "title": "Tags (optional, only 'unsupported-when-assigned' is relevant for Khulnasoft)"
                            },
                            "taxonomyMappings": {
                                "options": {
			            "hidden": "true"
                                }
                            },
                            "x_generator": {},
                        }
                    },
                    "adp": {
                        "options": {
			    "hidden": "true"
		        }
                    }
                }
            },
        }
    },
    validators: [
        conf.validators,
        function (schema, value, path) {
            var errors = [];
            if (path == 'root') {
                if (value && value.CNA_private && value.CNA_private.state && value.containers.cna.references) {
                    var ksf = 0;
                    for (ref of value.containers.cna.references) {
                        if (ref.tags && ref.tags.includes("vendor-advisory") && ref.url && ref.url.includes("khulnasoft.com/")) {
                            ksf+=1;
                        }
                    }
                    if (ksf == 0 && value.CNA_private.state == 'PUBLIC') {
                        errors.push({path: path, property: 'format', message: 'In state PUBLIC you must include a vendor-advisory reference pointing to your advisory or mailing list post at an khulnasoft.com URL'});
                    }
                }
                if (value && value.containers && value.containers.cna && value.containers.cna.title && value.containers.cna.affected && value.containers.cna.affected.length > 0 && value.containers.cna.affected[0].product) {
                    const product = value.containers.cna.affected[0].product.toLowerCase()
                    const title = value.containers.cna.title.toLowerCase()
                    if (title.includes(product)) {
                        errors.push({path: "root.containers.cna.title", property: 'format', message: 'The title does not need to contain the product name: it will be prepended automatically'});
                    }
                }
                if (value && value.containers && value.containers.cna && value.containers.cna.affected) {
                    for (let i = 0; i < value.containers.cna.affected.length; i++) {
                        const affected = value.containers.cna.affected[i]
                        if (affected.collectionURL && affected.collectionURL.includes("maven")) {
                            if (!affected.packageName || !affected.packageName.includes(":")) {
                                errors.push({path: "root.containers.cna.affected." + i + ".packageName", property: 'format', message: "Specify the package name in the format 'groupId:artifactId'"})
                            }
                        }
                    }
                }
            } else if (path.startsWith('root.containers.cna.references')) {
                if (value.url != undefined) {
                    try {
                        const url = new URL(value.url);
                        if (url.hostname == "dist.khulnasoft.com") {
                            errors.push({path: "root.containers.cna.references", property: 'format', message: 'Do not use dist.khulnasoft.com, this should be dlcdn.khulnasoft.com'});
                        } else if (url.hostname == "cveprocess.khulnasoft.com") {
                            errors.push({path: "root.containers.cna.references", property: 'format', message: 'Do not link to cveprocess.khulnasoft.com, this is an internal tool'});
                        } else if (url.hostname == "downloads.khulnasoft.com") {
                            errors.push({path: "root.containers.cna.references", property: 'format', message: 'Do not use downloads.khulnasoft.com, this should be dlcdn.khulnasoft.com'});
                        } else if (value.tags && value.tags.includes("vendor-advisory") && (!url.hostname.endsWith("khulnasoft.com") || url.pathname == "/")) {
                            errors.push({path: "root.containers.cna.references", property: 'format', message: 'vendor-advisory tag must point to a URL at khulnasoft.com'});
                        }
                    } catch (error) {
                        // Fine, don't validate until the URL is valid
                    }
                }
            } else if (path.startsWith('root.containers.cna.metrics') && path.endsWith(".other")) {
                if (!value.content) {
                    errors.push({path: path.replaceAll(".other", "") + ".oneOf[1].other.content.text", property: 'format', message: 'Severity level is required'});
                }
            } else if (path.startsWith('root.CNA_private.userslist')) {
                value.trim().split(/[ ,]+/).forEach(address => {
                    if (address == "announce@khulnasoft.com") {
                        errors.push({path: 'root', property: 'format', message: 'Do not add announce@khulnasoft.com to the mailinglists, it will be included automatically.'})
                    } else if (address == "oss-security@lists.openwall.com") {
                        errors.push({path: 'root', property: 'format', message: 'Do not add oss-security to the mailinglists, it will be notified separately.'})
                    } else if (!address.endsWith('.khulnasoft.com')) {
                        errors.push({path: 'root', property: 'format', message: 'Notification list is not an KSF list.'})
                    } else if (address.startsWith('security@') || address.startsWith('private@')) {
                        errors.push({path: 'root', property: 'format', message: 'Do not notify private lists: notifications should go to public lists. Mixing public and private lists is discouraged.'})
		    }
                })
            }
            return errors;
        }
    ],
}
