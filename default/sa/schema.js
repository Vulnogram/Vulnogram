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

var docSchema = {
    "$schema": "http://json-schema.org/draft-04/schema#",

    "definitions": {
        "lang_string": {
            "type": "object",
            "required": ["lang", "value"],
            "properties": {
                "lang": {
                    "type": "string",
                    "default": "eng",
                    "options": {
                        "hidden": "true"
                    }
                },
                "value": {
                    "type": "string",
                    "minLength": 2,
                    "maxLength": 3999,
                    "format": "textarea",
                    options: {
                        "input_height": "9em",
                    }
                }
            }
        }
    },

    "type": "object",
    "required": ["data_type", "ID", "TITLE", "STATE", "data_version", "CVE_list", "DATE_PUBLIC", "CNA_private"],
    "properties": {
        "data_type": {
            "type": "string",
            "enum": ["SA"],
            "options": {
                "hidden": true
            }
        },
        "data_version": {
            "type": "string",
            "enum": ["1.0"],
            "options": {
                "hidden": true
            }
        },
        "ID": {
            "type": "string",
            "pattern": "^[A-Z]*[0-9-]+$"
        },
        "DATE_PUBLIC": {
            "type": "string",
            "format": "datetime"
        },
        "TITLE": {
            "type": "string"
        },
        defect: {
            title: "Defect",
            type: "array",
            format: "taglist",
            "uniqueItems": true,
            items: {
                type: "string"
            },

        },
        PRODUCT_AFFECTED: {
            "title": "Affected product",
            "type": "string"
        },
        "STATE": {
            "type": "string",
            "format": "radio",
            "enum": ["DRAFT", "REVIEW", "READY", "PUBLIC", "RESERVED", "REJECTED", "MERGED"],
            "default": "DRAFT"
        },
        "description": {
            "type": "array",
            "format": "table",
            "minItems": 1,
            "items": {
                "title": "Description",
                "$ref": "#/definitions/lang_string"
            }
        },
        "CVE_list": {
            "type": "array",
            "format": "table",
            "minItems": 1,
            "items": {
                "type": "object",
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
        "work_around": {
            "type": "array",
            "format": "table",
            "items": {
                "title": "Description",
                "$ref": "#/definitions/lang_string"
            }
        },
        "solution": {
            "type": "array",
            "format": "table",
            "minItems": 1,
            "items": {
                "title": "Description",
                "$ref": "#/definitions/lang_string"
            }
        },
        "limit_products": {
            "type": "array",
            "format": "table",
            "items": {
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string"
                    }
                }
            }
        },
        "limit_vendors": {
            "type": "array",
            "format": "table",
            "items": {
                "type": "object",
                "properties": {
                    "vendor_name": {
                        "type": "string"
                    }
                }
            }
        },
        "CNA_private": {
            properties: {
                owner: {
                    type: "string",
                    "format": "radio",
                    enum: ["example", "team", "member", "names", "go", "here"]
                },
                todo: {
                    title: "Reminders",
                    type: "array",
                    format: "table",
                    items: {
                        title: "action item",
                        type: "string"
                    }
                },
                phase: {
                    type: "string",
                    option: {
                        hidden: true
                    },
                    template: "phases[context.state]",
                    watch: {
                        "state": "root.STATE"
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
                                "d": "root.DATE_PUBLIC"
                            }
                        },
                        "year": {
                            type: "string",
                            template: "(context.d ? context.d.substr(0,4) : '')",
                            watch: {
                                "d": "root.DATE_PUBLIC"
                            }
                        },
                        "month": {
                            type: "string",
                            template: "(context.d ? context.d.substr(5,2) : '')",
                            watch: {
                                "d": "root.DATE_PUBLIC"
                            }
                        }
                    }
                }
            },
            required: ["owner"]
        }
    }
};