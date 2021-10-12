var package = require('../package.json');

module.exports = {
    copyright: 'Copyright © Chandan B.N, 2017-2021. Usage of CVE IDs is subject to CVE terms of use. This site does not track you and is safe for working with confidential vulnerability information. Made with ' + package.name + ' ' + package.version,
    basedir: './',
    mitreURL: 'https://cve.mitre.org/cgi-bin/cvename.cgi?name=',
    defectURL: 'https://example.com/bugtracker=',

    // ACE editor
    ace: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.min.js',
    aceHash: "sha512-GoORoNnxst42zE3rYPj4bNBm0Q6ZRXKNH2D9nEmNvVF/z24ywVnijAWVi/09iBiVDQVf3UlZHpzhAJIdd9BXqw==",

    // JSON Editor
    jsoneditor: 'https://cdnjs.cloudflare.com/ajax/libs/json-editor/2.5.4/jsoneditor.min.js',
    jsoneditorHash: 'sha512-uWu+rXQQB3W440i9GCPMZZL2/tf58decmRv8uD5KWo0CQn5Qu8JVkK1EXBmJv9Gj1q7TZeRbbntnrz1hcFkdPQ==',
    sections: [
        'cve'
    ],
    homepage: 'https://vulnogram.github.io'
};