module.exports = {
conf: {
    title: 'Dashboard',
    name: 'Vulnogram',
    class: 'vulnogram',
    order: -10,
    uri: '/home/'
},
facet: {
    ID: {
        path: 'body.ID',
        regex: 'PLOT-[A-Za-z0-9]+',        
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
          "pattern": "^PLOT-([A-Za-z0-9]+)$",
      },
    "title": {
      "$id": "#/properties/title",
      "type": "string",
      "title": "TITLE",
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
        "pie","bar"
      ],
      "pattern": "^(.*)$"
    },
    "section": {
        type: "string",
       examples: ["pr","cve","sir","jira","note","nvd","contact"]
    },
    "query": {
        type: "string",
        "$ref": "/home/examples?field=body.query"
    },
    "key": {
      "$id": "#/properties/key",
      "type": "array",
      "format": "taglist",
      "title": "Group by fields (Max 2 for bar charts, Max 1 for pie charts)",
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
            "$id": "#/properties/color/properties/domain/items",
            "type": "string",
          },
        "options": {
                    "grid_columns": 6
        }            
        },
        "range": {
          "type": "array",
          "title": "The Range Schema",
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