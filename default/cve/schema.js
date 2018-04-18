var langEnum = ["eng", "fra", "spa", "ger", "jpn", "zho"];

var phases = {
    DRAFT: "Current",
    REVIEW: "Current",
    READY: "Current",
    PUBLIC: "Past",
    RESERVED: "Future",
    REPLACED_BY: "Other",
    REJECTED: "Deleted",
    SPLIT_FROM: "Other",
    MERGED_TO: "Other"
}
var cvssChangeables = {
    "attackVector": "cvss.attackVector",
    "attackComplexity": "cvss.attackComplexity",
    "privilegesRequired": "cvss.privilegesRequired",
    "userInteraction": "cvss.userInteraction",
    "scope": "cvss.scope",
    "confidentialityImpact": "cvss.confidentialityImpact",
    "integrityImpact": "cvss.integrityImpact",
    "availabilityImpact": "cvss.availabilityImpact"
}
var CVSSschema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "JSON Schema for Common Vulnerability Scoring System version 3.0",
    "id": "cvss",
    "type": "object",
    "definitions": {
        "attackVectorType": {
            "type": "string",
            "format": "radio",
            "enum": ["PHYSICAL", "LOCAL", "ADJACENT_NETWORK", "NETWORK"],
        },
        "modifiedAttackVectorType": {
            "type": "string",
            "format": "radio",
            "enum": ["NETWORK", "ADJACENT_NETWORK", "LOCAL", "PHYSICAL", "NOT_DEFINED"]
        },
        "attackComplexityType": {
            "type": "string",
            "format": "radio",
            "enum": ["HIGH", "LOW"]
        },
        "modifiedAttackComplexityType": {
            "type": "string",
            "format": "radio",
            "enum": ["HIGH", "LOW", "NOT_DEFINED"]
        },
        "privilegesRequiredType": {
            "type": "string",
            "format": "radio",
            "enum": ["HIGH", "LOW", "NONE"]
        },
        "modifiedPrivilegesRequiredType": {
            "type": "string",
            "format": "radio",
            "enum": ["HIGH", "LOW", "NONE", "NOT_DEFINED"]
        },
        "userInteractionType": {
            "type": "string",
            "format": "radio",
            "enum": ["REQUIRED", "NONE"]
        },
        "modifiedUserInteractionType": {
            "type": "string",
            "format": "radio",
            "enum": ["NONE", "REQUIRED", "NOT_DEFINED"]
        },
        "scopeType": {
            "type": "string",
            "format": "radio",
            "enum": ["UNCHANGED", "CHANGED"]
        },
        "modifiedScopeType": {
            "type": "string",
            "enum": ["UNCHANGED", "CHANGED", "NOT_DEFINED"]
        },
        "ciaType": {
            "type": "string",
            "format": "radio",
            "enum": ["NONE", "LOW", "HIGH"]
        },
        "modifiedCiaType": {
            "type": "string",
            "enum": ["NONE", "LOW", "HIGH", "NOT_DEFINED"]
        },
        "exploitCodeMaturityType": {
            "type": "string",
            "enum": ["UNPROVEN", "PROOF_OF_CONCEPT", "FUNCTIONAL", "HIGH", "NOT_DEFINED"]
        },
        "remediationLevelType": {
            "type": "string",
            "enum": ["OFFICIAL_FIX", "TEMPORARY_FIX", "WORKAROUND", "UNAVAILABLE", "NOT_DEFINED"]
        },
        "confidenceType": {
            "type": "string",
            "enum": ["UNKNOWN", "REASONABLE", "CONFIRMED", "NOT_DEFINED"]
        },
        "ciaRequirementType": {
            "type": "string",
            "enum": ["LOW", "MEDIUM", "HIGH", "NOT_DEFINED"]
        },
        "scoreType": {
            "type": "number",
            "minimum": 0,
            "maximum": 10
        },
        "severityType": {
            "type": "string",
            "format": "string",
            //"enum": ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
        }
    },
    "properties": {
        "version": {
            "type": "string",
            "enum": ["3.0"],
            "options": {
                "hidden": "true"
            }
        },
        "attackVector": {
            "$ref": "#/definitions/attackVectorType"
        },
        "attackComplexity": {
            "$ref": "#/definitions/attackComplexityType"
        },
        "privilegesRequired": {
            "$ref": "#/definitions/privilegesRequiredType"
        },
        "userInteraction": {
            "$ref": "#/definitions/userInteractionType"
        },
        "scope": {
            "$ref": "#/definitions/scopeType"
        },
        "confidentialityImpact": {
            "$ref": "#/definitions/ciaType"
        },
        "integrityImpact": {
            "$ref": "#/definitions/ciaType"
        },
        "availabilityImpact": {
            "$ref": "#/definitions/ciaType"
        },
        "vectorString": {
            "type": "string",
            options: {
                input_width: "50em"
            },
            "pattern": "^CVSS:3.0/((AV:[NALP]|AC:[LH]|PR:[UNLH]|UI:[NR]|S:[UC]|[CIA]:[NLH]|E:[XUPFH]|RL:[XOTWU]|RC:[XURC]|[CIA]R:[XLMH]|MAV:[XNALP]|MAC:[XLH]|MPR:[XUNLH]|MUI:[XNR]|MS:[XUC]|M[CIA]:[XNLH])/)*(AV:[NALP]|AC:[LH]|PR:[UNLH]|UI:[NR]|S:[UC]|[CIA]:[NLH]|E:[XUPFH]|RL:[XOTWU]|RC:[XURC]|[CIA]R:[XLMH]|MAV:[XNALP]|MAC:[XLH]|MPR:[XUNLH]|MUI:[XNR]|MS:[XUC]|M[CIA]:[XNLH])$",
            "template": "cvssjs.vector(context)",
            "watch": cvssChangeables
        },
        "baseScore": {
            "$ref": "#/definitions/scoreType",
            options: {
                input_width: "5em"
            },
            template: "cvssjs.calculate(context)",
            watch: cvssChangeables
        },
        "baseSeverity": {
            "$ref": "#/definitions/severityType",
            template: "cvssjs.severity(context.sc).name",
            watch: {
                "sc": "cvss.baseScore"
            }
        },
        /*        "exploitCodeMaturity":            { "$ref": "#/definitions/exploitCodeMaturityType" },
                "remediationLevel":               { "$ref": "#/definitions/remediationLevelType" },
                "reportConfidence":               { "$ref": "#/definitions/confidenceType" },
                "temporalScore":                  { "$ref": "#/definitions/scoreType" },
                "temporalSeverity":               { "$ref": "#/definitions/severityType" },
                "confidentialityRequirement":     { "$ref": "#/definitions/ciaRequirementType" },
                "integrityRequirement":           { "$ref": "#/definitions/ciaRequirementType" },
                "availabilityRequirement":        { "$ref": "#/definitions/ciaRequirementType" },
                "modifiedAttackVector":           { "$ref": "#/definitions/modifiedAttackVectorType" },
                "modifiedAttackComplexity":       { "$ref": "#/definitions/modifiedAttackComplexityType" },
                "modifiedPrivilegesRequired":     { "$ref": "#/definitions/modifiedPrivilegesRequiredType" },
                "modifiedUserInteraction":        { "$ref": "#/definitions/modifiedUserInteractionType" },
                "modifiedScope":                  { "$ref": "#/definitions/modifiedScopeType" },
                "modifiedConfidentialityImpact":  { "$ref": "#/definitions/modifiedCiaType" },
                "modifiedIntegrityImpact":        { "$ref": "#/definitions/modifiedCiaType" },
                "modifiedAvailabilityImpact":     { "$ref": "#/definitions/modifiedCiaType" },
                "environmentalScore":             { "$ref": "#/definitions/scoreType" },
                "environmentalSeverity":          { "$ref": "#/definitions/severityType" } */
    },
    "required": ["version", "vectorString", "baseScore", "baseSeverity"]
};

//TODO: needs refactoring for standalone instance
//if (!userName) {
//    var userName = '';
//}

var docSchema = {
    "$schema": "http://json-schema.org/draft-04/schema#",

    "definitions": {
        "cve_id": {
            "type": "string",
            "pattern": "^CVE-[0-9]{4}-[0-9A-Za-z\._-]{4,}$",
            "message": 'Valid email is required!'
        },
        "email_address": {
            "type": "string",
            "pattern": "^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$",
            "message": 'Valid email required'
        },
        "product": {
            "type": "object",
            "required": ["product_name", "version"],
            "properties": {
                "product_name": {
                    "type": "string",
                    "minLength": 1,
                    "description": "eg., Example Express",
                    "message": 'A product name is required!'

                },
                "version": {
                    "type": "object",
                    "required": ["version_data"],
                    "properties": {
                        "version_data": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                                "title": "version",
                                "type": "object",
                                "required": ["version_value"],
                                "id": "v",
                                "properties": {
                                    "version_name": {
                                        "title": "Version name (X)",
                                        "type": "string",
                                        "description": "eg., 4.0"
                                    },
                                    "affected": {
                                        "type": "string",
                                        "enum": ["", "<", "<=", "=", ">", ">=", "!<", "<=", "!", "!>", "!>=", "?"],
                                        "options": {
                                            "enum_titles": [
                                            "",
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
                                            "? (status of n is unknown)"
                                        ]
                                        }
                                    },
                                    "version_value": {
                                        "title": "Version value (n)",
                                        "type": "string",
                                        "description": "eg., 4.0 update 2",
                                        "minLength": 1,
                                        "message": 'Affected version value is required!'

                                    },
                                    "platform": {
                                        "type": "string",
                                        "description": "eg., x86"

                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        reference: {
            "id": "ref",
            "type": "object",
            "required": [ "url" ],
            properties: {
                refsource: {
                    type: "string",
                    // Uncomment to configure default advisory URL
                     default: "CONFIRM",
                     enum: [ "AIXAPAR", "ALLAIRE", "APPLE", "ATSTAKE", "AUSCERT", "BEA", "BID", "BINDVIEW", "BUGTRAQ", "CALDERA", "CERT", "CERT-VN", "CHECKPOINT", "CIAC", "CISCO", "COMPAQ", "CONECTIVA", "CONFIRM", "DEBIAN", "EEYE", "ENGARDE", "ERS", "EXPLOIT-DB", "FarmerVenema", "FEDORA", "FREEBSD", "FRSIRT", "FULLDISC", "GENTOO", "HP", "HPBUG", "IBM", "IDEFENSE", "IMMUNIX", "ISS", "JVN", "JVNDB", "L0PHT", "MANDRAKE", "MANDRIVA", "MISC", "MLIST", "MS", "MSKB", "NAI", "NETBSD", "NTBUGTRAQ", "OPENBSD", "OPENPKG", "OSVDB", "OVAL", "REDHAT", "SCO", "SECTRACK", "SECUNIA", "SF-INCIDENTS", "SGI", "SLACKWARE", "SREASON", "SREASONRES", "SUN", "SUNALERT", "SUNBUG", "SUSE", "TRUSTIX", "TURBO", "UBUNTU", "VIM", "VULN-DEV", "VULNWATCH", "VUPEN", "WIN2KSEC", "XF" ]
                },
                url: {
                    // Uncomment to configure default advisory URL
                    // default: "https://kb.juniper.net/",
                    type: "string",
                    "maxLength": 500,
                    "pattern": "^(ftp|http)s?://\\S+$",
                    "message": 'Valid URL is required!'

                },
                name: {
                    type: "string",
                    // Uncomment to configure default advisory URL
                    // default: "https://kb.juniper.net/",
                    /*template: "context.self ? context.self : (((context.refsource == 'CONFIRM') || (context.refsource == 'MISC')) ? context.url : context.self)",
                    watch: {
                        "url": "ref.url",
                        "refsource": "ref.refsource"
                    }*/
                }
            }
        },
        "lang_string": {
            "type": "object",
            "required": ["lang", "value"],
            "properties": {
                "lang": {
                    "type": "string"
                },
                "value": {
                    "title": " ",
                    "type": "string",
                    "minLength": 2,
                    "maxLength": 3999,

                }
            }
        }
    },

    "type": "object",
    "required": ["data_type", "data_format", "data_version", "CVE_data_meta", "affects", "problemtype", "references", "description"],
    "properties": {
        "data_type": {
            "type": "string",
            "enum": ["CVE"]
        },
        "data_format": {
            "type": "string",
            "enum": ["MITRE"]
        },
        "data_version": {
            "type": "string",
            "enum": ["4.0"]
        },
        "CVE_data_meta": {
            "type": "object",
            "required": ["ID", "ASSIGNER", "STATE"],
            "properties": {
                "ID": {
                    "$ref": "#/definitions/cve_id",
                    "description": "CVE-yyyy-nnnn"
                },
                "ASSIGNER": {
                    "$ref": "#/definitions/email_address",
                    "description": "Email of CNA assigning this CVE ID"
                },
                "DATE_PUBLIC": {
                    "type": "string",
                    "format": "datetime"
                },
                "TITLE": {
                    "type": "string",
                    "description": "Short summary"
                },
                AKA: {
                    "type": "string",
                    "title": "Also known as",
                    "description": "eg., HeartBleed, Shellshock"
                },
                STATE: {
                    "type": "string",
                    "enum": ["DRAFT", "REVIEW", "READY", "PUBLIC", "RESERVED", "REPLACED_BY", "REJECTED", "SPLIT_FROM", "MERGED_TO"],
                    "default": "DRAFT"
                }
            }
        },
        source: {
            type: "object",
            properties: {
                defect: {
                    title: "Defect",
                    type: "array",
                    "description": "CNA specific bug tracking IDs",
                    format: "taglist",
                    "uniqueItems": true,
                    items: {
                        type: "string"
                    },

                },
                advisory: {
                    title: "Advisory-ID",
                    type: "string",
                    "description": "CNA specific advisory IDs (Optional)",
                },
                discovery: {
                    type: "radio",
                    "title": "Found during",
                    "enum": ["INTERNAL", "EXTERNAL", "USER", "UNKNOWN"],
                    "options": {
                        "enum_titles": [
                                "internal research",
                                "external research",
                                "production use",
                                "unknown"
                            ]
                    },
                    default: "UNKNOWN"
                }
            }
        },
        "affects": {
            "type": "object",
            "required": ["vendor"],
            "properties": {
                "vendor": {
                    "type": "object",
                    "required": ["vendor_data"],
                    "properties": {
                        "vendor_data": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                                "title": "vendor",
                                "type": "object",
                                "required": ["vendor_name", "product"],
                                "properties": {
                                    "vendor_name": {
                                        "type": "string",
                                        "description": "eg., Example Org",
                                        "minLength": 1
                                    },
                                    "product": {
                                        "type": "object",
                                        "required": ["product_data"],
                                        "properties": {
                                            "product_data": {
                                                "type": "array",
                                                "minItems": 1,
                                                "items": {
                                                    "title": "product",
                                                    "$ref": "#/definitions/product"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "description": {
            "type": "object",
            "required": ["description_data"],
            "properties": {
                "description_data": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "title": "description",
                        "$ref": "#/definitions/lang_string"
                    }
                }
            }
        },
        "problemtype": {
            "type": "object",
            "required": ["problemtype_data"],
            "properties": {
                "problemtype_data": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "title": "problem type",
                        "type": "object",
                        "required": ["description"],
                        "properties": {
                            "description": {
                                "type": "array",
                                "minItems": 1,
                                "items": {
                                    "title": "problem type description",
                                    "$ref": "#/definitions/lang_string"
                                }
                            }
                        }
                    }
                }
            }
        },
        "references": {
            "type": "object",
            "required": ["reference_data"],
            "properties": {
                "reference_data": {
                    "type": "array",
                    "minItems": 1,
                    "maxItems": 500,
                    "items": {
                        "title": "URL",
                        "$ref": "#/definitions/reference"
                    }
                }
            }
        }
    }
};

// Additions to CVE Schema that could be benefitial for all.
var docSchema_plus = {
    options: {
        //        input_width: "10em"
    },
    definitions: {
        lang_string: {
            properties: {
                lang: {
                    "options": {
                        "hidden": "true"
                    },
                    default: "eng"
                },
                value: {
                    format: "textarea",
                    options: {
                        "input_height": "9em"
                    }
                }
            }
        },
        product: {
            properties: {
                version: {
                    properties: {
                        version_data: {
                            format: "table",
                            items: {
                                properties: {
                                    platform: {
                                        type: "string"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    properties: {
        data_type: {
            "options": {
                "hidden": "true"
            }
        },
        "data_format": {
            "options": {
                "hidden": "true"
            }

        },
        "data_version": {
            "options": {
                "hidden": "true"
            }
        },
        CVE_data_meta: {
            "id": "CDM",
            options: {
                layout: "grid",
                grid_columns: 2
            },
            properties: {
                ID: {
                    options: {
                        "input_width": "24em"
                    }
                },
                DATE_PUBLIC: {
                    options: {
                        input_width: "20em"
                    }
                },
                TITLE: {
                    options: {
                        input_width: "100%"
                    }
                },
                STATE: {
                    format: "radio"
                }
            }
        },
        affects: {
            format: "table",
            properties: {
                vendor: {
                    properties: {
                        vendor_data: {
                            format: "table"
                        }
                    }
                }
            }
        },
        description: {
            properties: {
                description_data: {
                    format: "table"
                }
            }
        },
        problemtype: {
            properties: {
                problemtype_data: {
                    format: "table",
                    items: {
                        properties: {
                            description: {
                                format: "table"
                            }
                        }
                    }
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
                    "type": "object",
                    "id": "cvss",
                    "properties": CVSSschema.properties
                }
            }
        },
        "exploit": {
            "type": "array",
            "format": "table",
            "items": {
                "title": "Exploit",
                "$ref": "#/definitions/lang_string"
            }
        },
        "work_around": {
            "type": "array",
            "format": "table",
            "items": {
                "title": "work around",
                "$ref": "#/definitions/lang_string"
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
                "$ref": "#/definitions/lang_string"
            }
        },
        references: {
            properties: {
                reference_data: {
                    format: "table"
                }
            },
            propertyOrder: 14
        },
    }
};

var CVEschema_custom = {
    definitions: {
        product: {
            properties: {
                product_name: {
                    type: "string"
                    // Uncomment to configure default product name or configure an enum to show limited options
                    // enum: ["product1", "product2"]
                    // default: ""
                }
            }
        },
        reference: {
            properties: {
                url: {
                    type: "string"
                    // Uncomment to configure default advisory URL
                    // default: "https://example.net/advisory/"
                }
            }
        }
    },
    properties: {
        CVE_data_meta: {
            properties: {
                ASSIGNER: {
                    // Uncomment to configure default for ASSIGNER email ID
                    // default: "sirt@example.net",
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
                                        // Uncomment to configure default vendor name, set hidden true to hide in editor
                                        // default: "Example Org",
                                        options: {
                                            // hidden: true
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
            "items": {
                "default": {
                    // Set default language for strings
                    "lang": "eng",
                    "value": ""
                }
            }
        },
        "work_around": {
            "items": {
                "default": {
                    // Set default language for strings
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
                    enum: ["example", "team", "member", "usernames", "go", "here"]
                },
                phase: {
                    type: "string",
                    option: {
                        hidden: true
                    },
                    template: "phases[context.state]",
                    watch: {
                        "state": "root.CVE_data_meta.STATE"
                    }
                },
                publish: {
                    type: "object",
                    "options": {
                        hidden: true
                    },
                    properties: {
                        "ym": {
                            type: "string",
                            template: "(context.d ? context.d.substr(0,7) : '')",
                            watch: {
                                "d": "root.CVE_data_meta.DATE_PUBLIC"
                            }
                        },
                        "year": {
                            type: "string",
                            template: "(context.d ? context.d.substr(0,4) : '')",
                            watch: {
                                "d": "root.CVE_data_meta.DATE_PUBLIC"
                            }
                        },
                        "month": {
                            type: "string",
                            template: "(context.d ? context.d.substr(5,2) : '')",
                            watch: {
                                "d": "root.CVE_data_meta.DATE_PUBLIC"
                            }
                        }
                    }
                },
                share_with_CVE: {
                    type: "boolean",
                    "format": "checkbox",
                    "default": "true"
                },
                internal_comments: {
                    type: "string",
                    format: "textarea",
                    options: {
                        "input_height": "6em"
                    },
                    default: ''
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
            required: ["owner", "todo"]
        }
    }
};

Object.assign(docSchema.definitions, CVSSschema.definitions);
textUtil.mergeJSON(docSchema, docSchema_plus);
if (CVEschema_custom) {
    textUtil.mergeJSON(docSchema, CVEschema_custom);
}
// docSchema should now have the schema to be used by JSON Editor