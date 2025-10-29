var package = require('../package.json');

module.exports = {
    copyright: 'Copyright © Chandan B.N, 2017-' + new Date().getFullYear() +'. Usage of CVE IDs is subject to CVE terms of use. This site does not track you and is safe for working with confidential vulnerability information. Made with ' + package.name + ' ' + package.version,
    basedir: './',
    mitreURL: 'https://www.cve.org/cverecord?id=',
    defectURL: 'https://example.com/bugtracker=',

    // ACE editor
    ace: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.13/ace.js',
    aceHash: "sha512-OMjy8oWtPbx9rJmoprdaQdS2rRovgTetHjiBf7RL7LvRSouoMLks5aIcgqHb6vGEAduuPdBTDCoztxLR+nv45g==",

    // JSON Editor
    jsoneditor: 'https://cdnjs.cloudflare.com/ajax/libs/json-editor/2.8.0/jsoneditor.min.js',
    jsoneditorHash: 'sha512-8y8kuGFzNGSgACEMNnXJGhOQaLAd4P9MdCXnJ37QjGTBPRrD5FCEVEKj/93xNihQehkO3yVKnOECFWGxxBsveQ==',

    // ajv - JSON schema draft-07 validation
    // NOTE -- including ajv is experimental and can be excluded if desired by commenting out the next two lines
    //ajv: 'https://cdnjs.cloudflare.com/ajax/libs/ajv/8.12.0/ajv7.min.js',
    //ajvHash: 'sha512-U2SW9Ihh3GF6F8gP8QgLS+I244xnM5pFCh3cigpw7bAzUDnKDlxdlFL4kjyXTle8SJl/tJ0gdnwd44Eb3hLG/Q==',
    sections: [
//        'cve',
        'cve5',
//        'cvss4'
    ],
    homepage: 'https://vulnogram.org'
};
