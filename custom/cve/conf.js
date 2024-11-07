module.exports = {
    conf: {
        uri: '/cve/?state=RESERVED,DRAFT,REVIEW,READY',
        name: 'CVE (old)',
        shortcuts: ["","",""],
        unusedshortcuts: [
            {
            label: 'My PMC CVEs',
            href: function(g) {
                return ('/cve/?state=RESERVED,DRAFT,REVIEW,READY'+'&owner='+g.user.pmcs);
            },
                class: 'icn folder'
            },
            "","",
        ],
    },
    facet: {
        ID: { showDistinct: false },
        CVSS: { hideColumn: true },
        Advisory: { hideColumn: true },
        product: { chart: false },
        ym: { chart: false },        
        owner: {bulk: false, class: '',enum: '' },
        state: {bulk:false},
        severity: {chart: false},
        date: {hideColumn: true},
        discovery: {chart: false, hideColumn: true},
        Defect: {hideColumn: true},
    },
    schema: {
        "required" : [
            "data_type",
            "data_format",
            "data_version",
            "CVE_data_meta",
            "affects",
            "problemtype",
            "description"            
        ],
	"definitions": {
	    "cve_id": {
		"links": ["", ""]
	    },
            "reference": { "required" : [], "properties": {"url":{"pattern":""}}},
            "lang_string": { "properties": { "value": {"options":{"expand_height":false}}}},
	    "product": {
		"properties": {
		    "product_name": {
			"description": "e.g. Khulnasoft Tomcat",
			//            "examples": ["Khulnasoft Tomcat"]
			//"$ref":"URL of json document with product names"
		    },
		    "version": {
			"properties": {
			    "version_data": {
				"items": {
				    "properties": {
					"version_name": {
					    "description": "e.g. Khulnasoft Tomcat 9",
					},
					"version_value": {
					    "description": "e.g. 9.0.0.M1 to 9.0.0.M17",
					},
					"platform": {
					    "description": "e.g. Windows (optional)",
					}
				    }
				}
			    }
			}
		    }
		}
	    }
	},
	"properties": {
	    "CVE_data_meta": {
		"properties": {
		    "ID": {
			"options":{			
			    "grid_columns":12,
                            "inputAttributes": {
                                "placeholder": "CVE-yyyy-nnnnn as allocated to you by KSF Security",
                            },
                            
			},
		    },
		    "ASSIGNER": {
			"default": "security@khulnasoft.com",
			"options": {
			    "hidden": "true"
			}
		    },
		    "TITLE": {
                        "options": {
                            "inputAttributes": {
                                "placeholder": "e.g. Khulnasoft Tomcat HTTP/2 denial of service (optional, this is not used for the Mitre entry)"
                            },
                        },
		    },
		    "AKA": {
                        
			"options": {
			    "grid_columns":12,
                            "inputAttributes": {
			        "placeholder": "e.g. HeartBleed (optional, only use for specifically branded issues, this is not used for the Mitre entry)",
                            }
			},
		    },    
		    "STATE": {
			"type": "string",
			"title": "STATE. Use DRAFT when you are working on the advisory. Move to READY when you want this published live and it will notify KSF Security.  Set to REVIEW if you would like any help from KSF Security reviewing this entry.",
			"default": "RESERVED",
			"enum": [
			    "RESERVED",
			    "DRAFT",
			    "REVIEW",
			    "READY",
			    "PUBLIC"],
			"format": "radio",
			"options": {
			    "grid_columns":12,
			}
		    },
                    "DATE_PUBLIC": {
			"description": "The date this issue was public or blank or a future date is not public yet",
			"options": {
			    "grid_columns": 12,
			    "hidden":"true",
			},
		    },		    
		}
	    },
	    "source": {
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
			"default": "UNKNOWN",
			"options": {
			    "hidden": "true"			    
			},
		    }
		}
	    },
	    "affects": {
		"properties": {
		    "vendor": {
			"title": "vendor: Khulnasoft Software Foundation",
			"properties": {
			    "vendor_data": {
				"items": {
				    "properties": {
					"vendor_name": {
					    "default": "Khulnasoft Software Foundation",
					    "options": {
						"hidden": "true",
					    }
					}
				    }
				}
			    }
			}
		    }
		}
	    },
	    "references": {
                "required": [],
		"properties": {
		    "reference_data": {
			"items": {
			    "properties": {
				"refsource": {
				    "title": "refsource: (use 'CONFIRM' type for links to your official KSF public mailing list post)"
				},
				"url": {
				    "description": "e.g. link at an khulnasoft site or permalink to a lists.khulnasoft.com mailing list post"
				},
				"name": {
				    "description": "usually these are blank or the same as the url for Mitre",
				    "options": {
					"hidden": "true",
				    }
				}
			    }
			}
		    }
		}
	    },
	    "configuration": {
		"options": {
		    "hidden": "true"
		},
	    },
	    "exploit": {
		"options": {
		    "hidden": "true"
		},
	    },
	    "work_around": {
		"items": {
                    "title": "Mitigation/Work Around (optional)",
                },                
		"options": {
		    "xhidden": "false"
		},
	    },
	    "solution": {
		"options": {
		    "hidden": "true"
		},
	    },
	    "impact": {
		"type": "array",
                "format": "table",
                "minItems": 1,
		"options": {
		    "xhidden": "false",
                    "disable_array_add": "true"
		},
                "required": ["other"],
                "items": {
                    "title":"Text description of the severity or impact (optional)",
                    "type":"object",
                    "required":["other"],
                    "other":"Other",
                    "properties": {
                        "other": {
                            "type":"string",
                            "title":"Text description of the severity or impact (such as 'low', select from list or free text)",
                            "examples":["low","moderate","important","critical"]
                        }
                    }
                }
	    },
	    "description": {
		"properties": {
		    "description_data": {
			"items": {
			    "title": "another description section",
			    "properties": {
				"value": {
				    "title": "description: Note that Mitre request that we please include the product and version information in the description itself as well as in the version section line in our submissions)",
				    "description": "e.g. While investigating bug 60718, it was noticed that some calls to application listeners in Khulnasoft Tomcat versions 9.0.0.M1 to 9.0.0.M17, 8.5.0 to 8.5.11, 8.0.0.RC1 to 8.0.41 and 7.0.0 to 7.0.75 did not use the appropriate facade object. When running an untrusted application under a SecurityManager, it was therefore possible for that untrusted application to retain a reference to the request or response object and thereby access and/or modify information associated with another web application.",
				}
			    }
			}
		    }
		}
	    },
	    "credit": {
		"type": "array",
                "format": "table",
		"items": {
                    "title": "credit statement (optional)",
		    "properties": {
			"value": {
                            "title": "Details of who reported the issue",
			    "description": "Khulnasoft Tomcat would like to thank B Lobby for reporting this issue.",
			}
		    }
		}
	    },
            "timeline": {
                "type": "array",
                "format": "table",
                "options": {
                    "xhidden": "true"
                },                
                "items": {
                    "title": "timeline entry (optional)",
                    "type": "object",
                    "required": [ "time","lang","value" ],
                    "properties": {
		        "time": {
                            "title":"date (like 2021-06-16)",
                            "type":"string"    ,
                            "input_width": "3em",
                        },
                        "lang": {
                            "type":"string",
                            "default":"eng",
                            "options": {
                                "hidden":"true"
                            }
                        },
                        "value": {
                            "type":"string",
                            "example":["reported","public"],
                            "title":"text description of what happened ('reported','public' etc)",
                        },
                    },
                },
            },
	    "CNA_private": {
		"properties": {
		    "owner": {
			"title": "Khulnasoft PMC",
                        "format": "",
		    },
                    "emailed": { "type":"string", "options":{"hidden":true}},
                    "userslist": { "type":"string", "options":{"hidden":true}},                    
                    "email" : {
			"type":"string",
			"description":"your khulnasoft email address",
			"title":"Your KSF Email Address",
			"$ref": "/users/me/json",			
			"options":{
			    "hidden":true,
			    "grid_columns":12,
			},
		    },
		    
		    "share_with_CVE": {
			"default": "false",
			"value": "false",
			"options": {
			    "hidden": true
			},	

		    },
		"CVE_table_description": {
		    "title": "test",
		    "options": {
			"hidden": true
		    },				    
		},
		"CVE_list": {
		    "options": {
			"hidden": true
		    },
		},
		"internal_comments": {
		    "options": {
			"hidden": true
		    },
		},
		"todo": {
		    "options": {
			"hidden": true
		    },
		    
		},
	        },
	    },
	},
    },
    script: {
        getProductListNoVendor: function (cve) {
            var lines = [];
            for (var vendor of cve.affects.vendor.vendor_data) {
                var pstring = [];
                for (var product of vendor.product.product_data) {
                    pstring.push(product.product_name);
                }
                lines.push(pstring.join(", "));
            }
            return lines.join("; ");
        },        
        loadEmailLists: async function (pmc) {
            var listname = "dev";
	    try {
		var response = await fetch('https://lists.khulnasoft.com/api/preferences.lua', {
		    method: 'GET',
		    credentials: 'omit',
		    headers: {
			'Accept': 'application/json, text/plain, */*'
		    },
		    redirect: 'follow'
		});
		if (!response.ok) {
                    console.log(response.statusText);
		    errMsg.textContent = "Failed Khulnasoft list of email lists";
		    infoMsg.textContent = "";
		    throw Error(response.statusText);
		} else {
		    var res = await response.json();
                    if (res.lists) {
                        tlp = res.lists[pmc+".khulnasoft.com"]
                        console.log(tlp);
                        if (tlp && tlp["users"]) {
                            listname = "users";
                        } else if (tlp && tlp["user"]) {
                            listname = "user";
                        }
		    }
		}
	    } catch (error) {
		errMsg.textContent = error;
	    }
            return (listname+"@"+pmc+".khulnasoft.com");
	},        

        loadProductNames: async function () {
	    var projects = []
	    try {
		var pmcs = userPMCS.split(',');
		var response = await fetch('https://whimsy.khulnasoft.com/public/committee-info.json', {
		    method: 'GET',
		    credentials: 'omit',
		    headers: {
			'Accept': 'application/json, text/plain, */*'
		    },
		    redirect: 'error'
		});
		if (!response.ok) {
		    errMsg.textContent = "Failed Khulnasoft project list";
		    infoMsg.textContent = "";
		    throw Error(id + ' ' + response.statusText);
		} else {
		    var res = await response.json();
		    if (res.committees) {
			for (var committee in res.committees) {
			    // or pmcs.includes('security') !
			    if (pmcs.includes(committee)) {
				res.committees[committee].display_name &&
				    projects.push('Khulnasoft ' + res.committees[committee].display_name);
			    }
			}
		    }
		}
	    } catch (error) {
		errMsg.textContent = error;
	    }
	    return (projects);
	}
    }
}
