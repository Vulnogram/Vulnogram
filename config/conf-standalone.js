var package = require('../package.json');

module.exports = {
    copyright: 'Copyright © Chandan B.N, 2017-2021. Usage of CVE IDs is subject to CVE terms of use. This site does not track you and is safe for working with confidential vulnerability information. Made with ' + package.name + ' ' + package.version,
    basedir: './',
    mitreURL: 'https://www.cve.org/CVERecord?id=',
    defectURL: 'https://example.com/bugtracker=',

    // ACE editor
    ace: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.13/ace.js',
    aceHash: "sha512-OMjy8oWtPbx9rJmoprdaQdS2rRovgTetHjiBf7RL7LvRSouoMLks5aIcgqHb6vGEAduuPdBTDCoztxLR+nv45g==",

    // JSON Editor
    jsoneditor: 'https://cdnjs.cloudflare.com/ajax/libs/json-editor/2.6.1/jsoneditor.min.js',
    jsoneditorHash: 'sha512-wKxQaNjG9D/GAVUp3sWH/OnnYDQ6NO3rcNGmmZ+YBjSqh7vwKvkBhNvSg91qmz2QSq/rsrrJjOmhdbd/LkbxGw==',
    sections: [
        'cve',
        'cve5'
    ],
    homepage: 'https://vulnogram.github.io'
};