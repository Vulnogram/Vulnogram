module.exports = {
    orgName: '',
    groupName: '',
    contact: 'psirt@example.net',
    classification: '',
    copyright: 'Copyright © Chandan B.N, 2017',
    advisoryTemplates: 'common',
    appName: 'Vulnogram',
    // port where this tool is running
    serverPort: 3555,
    basedir: '',

    // ACE editor
    ace: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.8/ace.js',
    aceHash: "sha384-sVVk7tngixhF2/zKU0IYtVvpuVYLTwt9srAn1ZjLJeEWKh9AebgDI+PD3USZfpBH",

    // JSON Editor
    jsoneditor: 'https://cdnjs.cloudflare.com/ajax/libs/json-editor/0.7.28/jsoneditor.min.js',
    jsoneditorHash: "sha384-kPMw40PaU/i5rM9X+5s/7qmujSY7EXGocROnFOXOnywfZGxp2t4RbQZ1dFwh7UBB",

    //JSON to yaml convertor
    //yalmjs: 'https://cdnjs.cloudflare.com/ajax/libs/yamljs/0.3.0/yaml.min.js',

    //Override MITRE JSON Schema with defaults specific to CNA 
    CVEschema_custom: {}
}