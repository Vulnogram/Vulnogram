var conf = require('../../config/conf');
var express = require('express')
var router = express.Router();
const csurf = require('csurf');
var csrfProtection = csurf();
var package = require('../../package.json');
module.exports = {
conf: {
    title: 'CVE: Common Vulnerabilities and Exposures',
    name: 'CVE',
    uri: '/cve/?state=DRAFT,REVIEW,READY',
    class: 'vgi-alert',
    order: 0.1, //Where to place the section on heading?
    shortcuts: [
    {
        label: 'My CVEs',
        href: function(g) {
            return ('/cve/?state=RESERVED,DRAFT,REVIEW,READY&owner='+g.user.username);
        },
        class: 'icn folder'
    },
    {
        label: 'Preview',
        href: '/review/drafts',
        class: 'icn REVIEW',
        target: '_blank'
    },
    {
        label: 'Slides',
        href: '/review/slides',
        class: 'icn Slides',
        target: '_blank'
    }
    ]
},
icons: {
    'TYPE': 'bucket',
    'CVE_data_meta': 'info',
    'STATE': 'knob',
    'new': 'new'
},
/*
Configure important query and aggregation parameters for index page

This JSON is used to build querymen schema and a Mongo facet query
used mainly for index page which also lets query/filter the list of items. 

The key ID is important. It tells where to find the unique identifer for the document.

path: the path of an element in JSON document body
regex: for user input for validation
tabs: if true, show a top level tabs with aggregated counts of documents
chart: if true, shows a small histogram/bar chart of aggregation
hideColumn: if true, hides the column from the listing table
sort: defult sort order for mongo queries
pipeline: addtional mongo pipeline operations (useful for unwinding arrays)

*/
facet: {
    ID: {
        path: 'body.CVE_data_meta.ID',
        regex: 'CVE-[a-zA-Z0-9\._-]+',
        showDistinct: true
    },
    state: {
        path: 'body.CVE_data_meta.STATE',
        //chart: true,
        tabs: true,
        bulk: true,
        enum: ["DRAFT", "REVIEW", "READY", "PUBLIC", "RESERVED", "REJECT",  "MERGED_TO"],
        class: 'icn nobr '
    },
    CVSS: {
        path: 'body.impact.cvss.baseScore'
    },
    severity: {
        path: 'body.impact.cvss.baseSeverity',
        chart: true,
        hideColumn: true
    },
    discovery: {
        path: 'body.source.discovery',
        chart: true,
        class: 'icn nobr '
    },
    Defect: {
        path: 'body.source.defect',
        href: conf.defectURL,
        showDistinct: true
    },
    Advisory: {
        path: 'body.source.advisory'
    },
    date: {
        path: 'body.CVE_data_meta.DATE_PUBLIC'
    },
    updated: {
        path: 'updatedAt'
    },
    product: {
        path: 'body.affects.vendor.vendor_data.product.product_data.product_name',
        chart: true,
        pipeline: [
            {
                $unwind: "$body.affects.vendor.vendor_data"
            }, {
                $unwind: "$body.affects.vendor.vendor_data.product.product_data"
            }, {
                 $sortByCount: "$body.affects.vendor.vendor_data.product.product_data.product_name"
            }
        ]
    },
    Title: {
        path: 'body.CVE_data_meta.TITLE',
        href: '/cve/',
        xref: {
            href: 'ID'
        }
    },
    todo: {
        path: { $size : "$body.CNA_private.todo"},
        class: 'bdg'
    },
    ym: {
        path: 'body.CNA_private.publish.ym',
        chart: true,
        hideColumn: true,
        sort: -1
    },
    owner: {
        path: 'body.CNA_private.owner',
        chart: true,
        bulk: true,
        enum: ['example', 'team', 'memebers'],
        class: 'ico '
    },
  /*  'state!': {
        path: 'body.CVE_data_meta.STATE',
        chart: false,
        bulk: false,
        queryOperator: '$ne'
    }*/   
},

schema: {
 "$schema": "http://json-schema.org/draft-04/schema#",
 "definitions": {
  "cve_id": {
   "type": "string",
   "pattern": "^CVE-[0-9]{4}-[0-9A-Za-z._-]{4,}$",
   "options": {
       "class": "vgi-tag",
     "patternmessage": "Invalid CVE ID"
   },
   "message": "Valid CVE ID is required!",
   "links": [
    {
     "class": "sml vgi-ext",
     "href": "'https://nvd.nist.gov/vuln/detail/' + context.self",
     "title": "'NVD's CVE Entry",
     "rel": "'NVD'"
    }
   ]
  },
  "email_address": {
   "type": "string",
   "pattern": "^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$",
   "message": "Valid email required",
   "options": {
    "class": "vgi-user",
    "patternmessage": "Invalid email"
    },   
  },
  "product": {
   "type": "object",
   "format": "grid",
   "required": [
    "product_name",
    "version"
   ],
   "properties": {
    "product_name": {
     "type": "string",
     "minLength": 1,
     "description": "eg., Example Express",
     "message": "A product name is required!",
        "options": {
        "grid_columns": 10,
        "formClass": "lni"
        },
        //"$ref":"/product/examples/?field=body.product"
    },
    "version": {
     "type": "object",
     "required": [
      "version_data"
     ],
     "properties": {
      "version_data": {
        "title": " ",
        "options": {
            "class": "hid"
        },
       "type": "array",
       "minItems": 1,
       "items": {
        "title": "Version",
        "options": {
            "class": "hid"
        },
        "type": "object",
        "required": [
         "version_value"
        ],
        "id": "v",
        "properties": {
         "version_name": {
          "title": "Version group name (X)",
          "type": "string",
          "description": "eg., 4.0"
         },
         "version_affected": {
          "type": "string",
          "enum": [
           "",
           "<",
           "<=",
           "=",
           ">",
           ">=",
           "!<",
           "!<=",
           "!",
           "!>",
           "!>=",
           "?<",
           "?<=",
           "?",
           "?>",
           "?>="
          ],
          "options": {
              "input_width": "5em",
           "enum_titles": [
            "Not Selected",
            "< (affects X versions prior to n)",
            "<= (affects X versions up to n)",
            " = (affects n)",
            " > (affects X versions above n)",
            " >= (affects X versions n and above)",
            "!< (doesn't affect X versions prior to n)",
            "!<= (doesn't affect X versions n and below)",
            "! (doesn't affect n)",
            "!> (doesn't affect X versions above n)",
            "!>= (doesn't affect X versions n and above)",
            "?< (status of X versions prior to n is unknown)",
            "?<= (status of X versions up to n is unknown)",
            "? (status of n is unknown)",
            "?> (status of X versions above n is unknown)",
            "?>= (status of X versions n and above is unknown)",
           ]
          }
         },
         "version_value": {
          "title": "Version value (n)",
          "type": "string",
          "description": "eg., 4.0 update 2",
          "minLength": 1,
          "message": "Affect version value is required!"
         },
         "platform": {
          "type": "string",
          "description": "eg., x86"
         }
        }
       },
       "format": "table"
      }
     }
    }
   }
  },
  "reference": {
   "id": "ref",
   "type": "object",
   "required": [
    "url"
   ],
   "properties": {
    "refsource": {
     "type": "string",
     "default": "CONFIRM",
     "enum": [
      "AIXAPAR",
      "ALLAIRE",
      "APPLE",
      "ATSTAKE",
      "AUSCERT",
      "BEA",
      "BID",
      "BINDVIEW",
      "BUGTRAQ",
      "CALDERA",
      "CERT",
      "CERT-VN",
      "CHECKPOINT",
      "CIAC",
      "CISCO",
      "COMPAQ",
      "CONECTIVA",
      "CONFIRM",
      "DEBIAN",
      "EEYE",
      "ENGARDE",
      "ERS",
      "EXPLOIT-DB",
      "FarmerVenema",
      "FEDORA",
      "FREEBSD",
      "FRSIRT",
      "FULLDISC",
      "GENTOO",
      "HP",
      "HPBUG",
      "IBM",
      "IDEFENSE",
      "IMMUNIX",
      "ISS",
      "JVN",
      "JVNDB",
      "L0PHT",
      "MANDRAKE",
      "MANDRIVA",
      "MISC",
      "MLIST",
      "MS",
      "MSKB",
      "NAI",
      "NETBSD",
      "NTBUGTRAQ",
      "OPENBSD",
      "OPENPKG",
      "OSVDB",
      "OVAL",
      "REDHAT",
      "SCO",
      "SECTRACK",
      "SECUNIA",
      "SF-INCIDENTS",
      "SGI",
      "SLACKWARE",
      "SREASON",
      "SREASONRES",
      "SUN",
      "SUNALERT",
      "SUNBUG",
      "SUSE",
      "TRUSTIX",
      "TURBO",
      "UBUNTU",
      "VIM",
      "VULN-DEV",
      "VULNWATCH",
      "VUPEN",
      "WIN2KSEC",
      "XF"
     ]
    },
    "url": {
     "type": "string",
     "maxLength": 500,
     "pattern": "^(ftp|http)s?://\\S+$",
     "message": "Valid URL is required!",
     "links": [
      {
       "href": "context.self",
       "title": "context.self",
       "rel": "'Open link'"
      }
     ]
    },
    "name": {
    "options": {
        "hidden": true,
    },
     "maxLength": 500,
     "type": "string"
    }
   }
  },
  "lang_string": {
   "type": "object",
   "required": [
    "lang",
    "value"
   ],
   "properties": {
    "lang": {
     "type": "string",
     "options": {
      "hidden": "true"
     },
     "default": "eng"
    },
    "value": {
     "title": " ",
     "type": "string",
     "minLength": 2,
     "maxLength": 3999,
     "format": "textarea",
     "options": {
      "input_height": "9em",
      "expand_height": true
     }
    }
   }
  }
 },
 "type": "object",
 "required": [
  "data_type",
  "data_format",
  "data_version",
  "CVE_data_meta",
  "affects",
  "problemtype",
  "references",
  "description"
 ],
 "properties": {
  "data_type": {
   "type": "string",
   "enum": [
    "CVE"
   ],
   "options": {
    "hidden": "true"
   }
  },
  "data_format": {
   "type": "string",
   "enum": [
    "MITRE"
   ],
   "options": {
    "hidden": "true"
   }
  },
  "data_version": {
   "type": "string",
   "enum": [
    "4.0"
   ],
   "options": {
    "hidden": "true"
   }
  },
  "generator": {
      "type": "object",
      "properties": {
          "engine": {
              "type": "string",
              "template": '"' + package.name+' '+package.version + '"'
          }
      },
    "options": {
        "hidden": "true"
    }
  },
  "CVE_data_meta": {
   "type": "object",
   "format": "grid",
   "required": [
    "ID",
    "ASSIGNER",
    "STATE"
   ],
   "properties": {
    "ID": {
     "$ref": "#/definitions/cve_id",
     "description": "CVE-yyyy-nnnn",
     "options": {
        "grid_columns": 4
     }
    },
    "ASSIGNER": {
     "title": "Assigning CNA",
     "$ref": "#/definitions/email_address",
     "description": "Email of CNA assigning this CVE ID",
     "default": (conf.contact ? conf.contact : ''),
     "options": {
    "grid_columns": 3
     }
    },
    "DATE_PUBLIC": {
     "title": "Date Public",
     "type": "string",
     "format": "datetime",
     "description": "YYYY-MM-DD",
     "options": {
         "class": "date vgi-cal",
         "grid_columns": 4
     }
    },
    "TITLE": {
     "type": "string",
     "description": "Short summary",
      "options": {
        "class": "vgi-title",
         "grid_columns": 9
     }
   },
    "AKA": {
     "type": "string",
     "title": "Also known as",
     "description": "eg., HeartBleed, Shellshock",
       "options": {
         "grid_columns": 3
     }
   },
    "STATE": {
     "type": "string",
     "enum": [
      "DRAFT",
      "REVIEW",
      "READY",
      "PUBLIC",
      "RESERVED",
   //   "REPLACED_BY",
      "REJECT",
    //  "SPLIT_FROM",
    //  "MERGED_TO"
     ],
     "default": "DRAFT",
     "format": "radio",
      "options": {
         "grid_columns": 12
     }    }
   },
   "id": "CDM",
   "options": {
    "layout": "grid",
    "grid_columns": 12
   }
  },
  "affects": {
   "type": "object",
   "title": "Affected products",
   "required": [
    "vendor"
   ],
   "properties": {
    "vendor": {
     "type": "object",
     "required": [
      "vendor_data"
     ],
     "properties": {
      "vendor_data": {
       "title": " ",
       "options": {
            "class": "hid"
       },
       "type": "array",
       "minItems": 1,
       "items": {
        "title": "vendor",
        "headerTemplate": "' '",
        "type": "object",
        "required": [
         "vendor_name",
         "product"
        ],
        "properties": {
         "vendor_name": {
          "type": "string",
          "description": "eg., Example Org",
             "default": conf.orgName ? conf.orgName: '',
          "minLength": 1,
          "options": {
              "formClass": "lni"
          }
         },
         "product": {
          "type": "object",
          "required": [
           "product_data"
          ],
          "properties": {
           "product_data": {
               "title": " ",
               "options": {
                    "class": "hid"
               },
            "type": "array",
            "format": "grid",
            "minItems": 1,
            "items": {
                "headerTemplate": "' '",
             "title": "product",
             "$ref": "#/definitions/product"
            }
           }
          }
         }
        }
       },
      }
     }
    }
   },
   "format": "table"
  },
  "problemtype": {
   "type": "object",
   "required": [
    "problemtype_data"
   ],
   "properties": {
    "problemtype_data": {
        "title": " ",
        "options": {
             "class": "hid"
        },
     "type": "array",
     "minItems": 1,
     "items": {
      "title": "problem type",
      "type": "object",
      "required": [
       "description"
      ],
      "properties": {
       "description": {
        "type": "array",
        "minItems": 1,
        "options": {
            "disable_array_add": "true"
        },
        "items": {
         "title": "problem type description",
           "type": "object",
           "required": [
            "lang",
            "value"
           ],
           "properties": {
            "lang": {
             "type": "string",
             "options": {
              "hidden": "true"
             },
             "default": "eng"
            },
            "value": {
             "description": "Vulnerability type: can be a CWE or free text",
             "title": " ",
             "type": "string",
             "minLength": 2,
             "maxLength": 3999,
             "$ref": "js/cwe-frequent.json"
            }
           }
        },
        "format": "table"
       }
      }
     },
     "format": "table"
    }
   }
  },
  "description": {
    "options": {
        "class": "vgi-text tgap"
   },
   "type": "object",
   "required": [
    "description_data"
   ],
   "properties": {
    "description_data": {
     "type": "array",
     "title": " ",
     "options": {
          "class": "hid"
     },
     "minItems": 1,
     "items": {
      "title": "description",
      "$ref": "#/definitions/lang_string"
     },
     "format": "table"
    }
   }
  },
  "references": {
   "type": "object",
   "required": [
    "reference_data"
   ],
   "properties": {
    "reference_data": {
     "type": "array",
     "minItems": 1,
     "maxItems": 500,
     "items": {
      "title": "URL",
      "$ref": "#/definitions/reference"
     },
     "format": "table"
    }
   }
  },
  "configuration": {
   "type": "array",
   "format": "table",
   "items": {
    "title": "required configuration",
    "$ref": "#/definitions/lang_string"
   }
  },
  "impact": {
   "type": "object",
   "properties": {
    "cvss": {
     "$ref": "js/cvss.json"
    }
   }
  },
  "exploit": {
   "type": "array",
   "format": "table",
   "items": {
    "title": "Exploit",
    "$ref": "#/definitions/lang_string",
    "default": {
     "lang": "eng",
     "value": ""
    }
   }
  },
  "work_around": {
   "type": "array",
   "format": "table",
   "items": {
    "title": "work around",
    "$ref": "#/definitions/lang_string",
    "default": {
     "lang": "eng",
     "value": ""
    }
   }
  },
  "solution": {
   "type": "array",
   "format": "table",
   "items": {
    "title": "solution",
    "$ref": "#/definitions/lang_string"
   }
  },
  "credit": {
   "type": "array",
   "format": "table",
   "items": {
       "title": "credit statement",
       "type": "object",
       "required": [
            "lang",
            "value"
           ],
       "properties": {
           "lang": {
               "type": "string",
               "options": {
                   "hidden": "true"
               },
               "default": "eng"
           },
           "value": {
               "description": "Names of people acknowledged for discovering, fixing, or helping with this CVE",
               "title": " ",
               "type": "string",
               "minLength": 2,
               "maxLength": 3999,
           }
       }
   }
   },
   "source": {
    "type": "object",
    "format": "grid",
    "options": {
     "class": "vgi-info tgap",
     "grid_columns": 12
 
   },   
    "properties": {
     "defect": {
      "title": "Defect",
      "type": "array",
      "description": "CNA specific bug tracking IDs",
      "format": "taglist",
      "uniqueItems": true,
      "items": {
       "type": "string"
      },
      "options": {
         "class": "vgi-bug",
         "gird_columns": 2,
         "formClass": "lni"
      }     
     },
     "advisory": {
      "title": "Advisory-ID",
      "type": "string",
      "description": "CNA specific advisory IDs (Optional)",
      "options": {
         "class": "vgi-alert",
         "gird_columns": 2,
         "formClass": "lni"
      }
     },
     "discovery": {
         "type": "string",
         "title": "Source of vulnerability discovery",
         "format": "radio",
      "enum": [
       "INTERNAL",
       "EXTERNAL",
       "USER",
       "UNKNOWN"
      ],
      "options": {
         "class": "vgi-info",
         "grid_columns": 6,
         "enum_titles": [
        "internal",
        "external",
        "during use",
        "unknown"
       ],
       "icons": {
        "INTERNAL":"hardhat",
        "EXTERNAL": "hat",
        "USER":"cap",
        "UPSTREAM":"in",
        "UNKNOWN":"what"
      }
      },
      "default": "UNKNOWN"
     }
    }
   },   
  "CNA_private": {
   "properties": {
    "owner": {
     "type": "string",
     "format": "radio",
     "$ref": "/users/list/json"
    },
    "publish": {
     "type": "object",
     "options": {
      "hidden": true
     },
     "properties": {
      "ym": {
       "type": "string",
       "template": "(context.d ? context.d.substr(0,7) : '')",
       "watch": {
        "d": "root.CVE_data_meta.DATE_PUBLIC"
       }
      },
      "year": {
       "type": "string",
       "template": "(context.d ? context.d.substr(0,4) : '')",
       "watch": {
        "d": "root.CVE_data_meta.DATE_PUBLIC"
       }
      },
      "month": {
       "type": "string",
       "template": "(context.d ? context.d.substr(5,2) : '')",
       "watch": {
        "d": "root.CVE_data_meta.DATE_PUBLIC"
       }
      }
     }
    },
    "share_with_CVE": {
     "type": "boolean",
     "format": "checkbox",
     "default": "true",
     "description": "a flag to share this entry to cvelist."
    },
       "CVE_table_description": {
           "title": "CVE table description",
           "type": "array",
           "format": "table",
           "items": {
               "title": "Description",
               "$ref": "#/definitions/lang_string"
           }
       },
        "CVE_list": {
            "title": "CVE table",
            "description": "For multi-CVE advisory.",
            "type": "array",
            "format": "table",
            "minItems": 0,
            "items": {
                "type": "object",
                "title": "List of CVEs for a table",
                "properties": {
                    "CVE": {
                        "type": "string",
                        "pattern": "(CVE-[0-9]{4}-[0-9A-Za-z\._-]{4,}[,\s]?)+"
                    },
                    "summary": {
                        "type": "string"
                    }
                }
            }
     },       
    "internal_comments": {
     "type": "string",
     "format": "textarea",
     "options": {
      "input_height": "6em",
      "expand_height": true
     },
     "default": ""
    },
    "todo": {
     "title": "Reminders",
     "type": "array",
     "format": "table",
     "items": {
      "title": "action item",
      "type": "string"
     }
    }
   },
   "required": [
    "owner",
    "todo"
   ]
  }
 }
},
validators: [
    function (schema, value, path) {
        var errors = [];
        if (path === "root.references") {
            var confirms = 0, miscs = 0;
            var data = value.reference_data;
            for(r in data) {
                if(data[r].refsource == 'CONFIRM') {
                   confirms++; 
                }
                if(data[r].refsource == 'MISC' || data[r].refsource == '') {
                   miscs++; 
                }
                if(data[r].refsource == 'CONFIRM' || data[r].refsource == 'MISC') {
                    if(data[r].url != data[r].name && data[r].name != '') {
                        errors.push({
                            path: 'root.references.reference_data.' + r + '.name',
                            property: 'format',
                            message: 'name should be same as URL for CONFIRM or MISC backwords compatibility)'
                        });
                    }
                }
                
            }
            if (confirms == 0 && miscs == data.length) {
                errors.push({
                    path: 'root.references',
                    property: 'format',
                    message: 'There should be atleast one CONFIRM URL or a legacy refsource type!'
                });
            }
        }
        return errors;
    }
],
router: router.get('/pr:pr', csrfProtection, function (req, res) {
        var CVE_JSON_skeleton = {
            "data_type": "CVE",
            "data_format": "MITRE",
            "data_version": "4.0",

            "CVE_data_meta": {
                "ASSIGNER": conf.contact,
                "DATE_PUBLIC": "",
                "TITLE": "Example title goes here. See config/conf.js on how to configure this."
            },
            "source": {
              "defect": req.params.pr  
            },
            CNA_private: {
                "owner": "",
                "todo": []
            }
        };
        res.render('../default/cve/edit', {
            allowAjax: true,
            schemaName: 'cve',
            opts: module.exports,
            title: 'Create a CVE entry from a defect',
            doc: {
                body: CVE_JSON_skeleton,
            },
            csrfToken: req.csrfToken(),
            postUrl: "./new"
        });
    })

}
