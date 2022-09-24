var appConf = require('../../config/conf');
var sections = require('../../models/sections')();

module.exports = {
conf: {
    title: 'Dashboard',
    name: 'Vulnogram',
    class: 'vgi-logo',
    order: -10,
    uri: '/home/'
},
facet: {
    ID: {
        path: 'body.ID',
        regex: 'PLOT-[A-Za-z0-9-_]+',
        chart: false,
        href: '/home/',
        hrefSuffix: '#chart'
    },
    title: {
        path: 'body.title',
        href: '/home/',
        xref: {
            href:'ID'
        },
        hrefSuffix: '#chart'
    },
    "order": {
        path: 'body.order',
        hidden: true,
        sortDefault: 'order',
    },
    "owner": {
        path: 'body.owner',
        tabs: true
    },
    updated: {
        path: 'updatedAt'
    },
    href: {
        path: 'body.href',
//        hideColumn: true
    },
    key: {
        path: 'body.key',
//        hideColumn: true
    },
    list: {
        path: 'body.list',
//        hideColumn: true
    },
    type: {
        path: 'body.type',
//        hideColumn: true
    },
    color: {
        path: 'body.color',
//        hideColumn: true
    }
},
schema: {    
  "definitions": {},
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": [
    "ID",
    "href",
    "key",
    "list",
    "title",
    "type"
  ],
  "properties": {
      "ID": {
          "type": "string",
          "description": "Unique ID starting with PLOT-xxxxxxx..",
          "pattern": "^PLOT-([A-Za-z0-9]+)$",
      },
    "title": {
      "$id": "#/properties/title",
      "type": "string",
      "title": "TITLE",
      "description": "Chart title",
      "default": "",
      "examples": [
        "All CVEs by Severity"
      ],
      "pattern": "^(.*)$"
    },
    "order": {
        "type": "number",
        "description": "A floating point number to sort the order of charts."
    },
    owner: {
            type: "string",
            "format": "radio",
            "$ref": "/users/list/json",
    },
    "type": {
      "$id": "#/properties/type",
      "type": "radio",
      "title": "Chart Type",
      "default": "bar",
      "enum": [
        "pie","bar","treemap"
      ],
      "pattern": "^(.*)$"
    },
    "section": {
        type: "string",
        format: "radio",
        enum: sections,
    },
    "query": {
      "title": "Query (eg., severity=CRITICAL,HIGH&product=Example) - Copy it from a filtered section view.",
        type: "string",
        "$ref": "/home/examples?field=body.query",
        "description": "URI query string For eg., field1=value&field2=value1,value2"
    },
    "key": {
      "$id": "#/properties/key",
      "type": "array",
      "format": "taglist",
      "title": "Group by field names (Max 2 for bar charts, Max 1 for pie charts)",
      "$ref": "/home/examples?field=body.key",
      "items": {
            "type": "string",   
        },
        "maxItems": 2,
        "minItems": 1
    },
    "href": {
        "options": {
            hidden: true,
        },
      "$id": "#/properties/href",
      "type": "string",
      "title": "Chart Data URL",
      "description": "Must be /[section]/agg?[query parameters]&f=[group by field1]&f=[group by field2]..",
                    template: '"/"+context.s+"/agg?" +context.q + "&f=" + context.f[0] + (context.f[1]? "&f=" + context.f[1] : "")',  
                    watch: {
                        s: 'root.section',
                        q: 'root.query',
                        f: 'root.key'
                    }
    },
    "list": {
        "options": {
            hidden: true,
        },
      "$id": "#/properties/list",
      "type": "string",
      "title": "Hyperlink",
      template: '"/"+context.s+"?" +context.q',  
        watch: {
                        s: 'root.section',
                        q: 'root.query',
        }
    },
    "color": {
    "description": "Optionally specify colors to assign to specific values.",
    "format": "grid",

      "type": "object",
      "title": "Colors",
      "required": [
        "domain",
        "range"
      ],
      "properties": {
        "domain": {
          "type": "array",
            "format": "table",
          "title": "Values",
          "items": {
            "title": "Names",

            "$id": "#/properties/color/properties/domain/items",
            "type": "string",
          },
        "options": {
                    "grid_columns": 6
        }            
        },
        "range": {
          "type": "array",
          "title": "Colors",
          "format": "table",
          "items": {
            "type": "string",
            "title": "Colors (html color names or hex color codes)",
            "default": "",
            "format": "color",
            "examples": [
              "orangered",
              "salmon",
              "orange",
              "gold",
              "green",
              "lightgray",
              "lightgray"
            ],
          },
        "options": {
                    "grid_columns": 6
        }            

        }
      }
    }
  }
}
}