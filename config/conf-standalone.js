var package = require('../package.json');

module.exports = {
    copyright: 'Copyright © Chandan B.N, 2017-2019. Usage of CVE IDs is subject to CVE terms of use. This site does not track you and is safe for working with confidential vulnerability information. Made with ' + package.name + ' ' + package.version,
    basedir: './',
    mitreURL: 'https://cve.mitre.org/cgi-bin/cvename.cgi?name=',
    defectURL: 'https://example.com/bugtracker=',

    // ACE editor
    ace: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.3/ace.js',
    aceHash: "sha384-rP/6HzF4Ap08EuRS9yaQsEPDqb8xS5WVTAzL7/LKTnUmJawbKoeSNyqHnNaiXY5X",

    // JSON Editor
    jsoneditor: 'https://cdn.jsdelivr.net/npm/@json-editor/json-editor@1.2.1/dist/jsoneditor.min.js',
    jsoneditorHash: 'sha384-iSUg2WRV2cauD+nwMuv7ITxwSe+2heHjWFIOjiWk5/Yve5ovwg/t7qp3ht6VlQBL',
    sections: [
        'cve'
    ],
    homepage: 'https://vulnogram.github.io'
};