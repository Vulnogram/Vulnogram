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
    sections: [
        'cve',
        'cve5'
    ],
    homepage: 'https://vulnogram.github.io'
};