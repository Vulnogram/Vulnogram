const fs = require("fs");
var package = require('../package.json');

module.exports = {

    // The Mongodb URL where CVE entries and users are stored.
    // WARNING! Configure MongoDB authentication and use a strong password
    // WARNING! Ensure MongoDB is not reachable from the network. 
    // database:'mongodb://vulnogram:StringLongPass@127.0.0.1:27017/vulnogram'
    database: 'mongodb://127.0.0.1:27017/vulnogram',

    // Name of the organization that should be used in page titles etc.,
    //orgName: 'Example Org',

    // Name of the group that should be used in page titles etc.,
    groupName: 'Security Incident Response Team',

    //CNA contact address
    //contact: 'sirt@example.net',

    classification: 'Confidential INTERNAL USE ONLY',
    copyright: '© Example Org. Made with ' + package.name + ' ' + package.version,

    // Uncomment this line and set a random string to allow unauthenticated access to draft CVE entries that are in review-ready or publish-ready state via /review/<token>/ or /review/<token>/CVE-ID
    // This may be useful to share a link to the draft for internal reviews and only those with the link have access to the drafts.    
   //reviewToken: 'randomtoken',

    // port where this tool is running
    serverHost: '127.0.0.1',
    serverPort: 3555,
    basedir: '/',

    //Uncomment this block to enable HTTPs. Configure paths for valid SSL certificates. 
    // Either get them from your favorite Certificate Authority or generate self signed:
    // Keep these safe and secured and readable only by account running vulnogram process!
    // $ openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out cert.pem
/*
    httpsOptions: {
        key: fs.readFileSync("./config/key.pem"),
        cert: fs.readFileSync("./config/cert.pem"),
        minVersion: 'TLSv1.2'
    },
*/
    
    mitreURL: 'https://cve.mitre.org/cgi-bin/cvename.cgi?name=',
    defectURL: 'https://example.net/internal/bugs/',
    publicDefectURL: 'https://example.net/bugs/',

    // ACE editor
    ace: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.min.js',
    aceHash: "sha512-GoORoNnxst42zE3rYPj4bNBm0Q6ZRXKNH2D9nEmNvVF/z24ywVnijAWVi/09iBiVDQVf3UlZHpzhAJIdd9BXqw==",
    // if you want this served locally, download ace editor to /public/js/ directory and point to that:
    //ace: '/js/ace.min.js',
    //aceHash: "sha512-GoORoNnxst42zE3rYPj4bNBm0Q6ZRXKNH2D9nEmNvVF/z24ywVnijAWVi/09iBiVDQVf3UlZHpzhAJIdd9BXqw=="


    // JSON Editor
    jsoneditor: 'https://cdnjs.cloudflare.com/ajax/libs/json-editor/2.5.4/jsoneditor.min.js',
    //jsoneditor: 'https://cdn.jsdelivr.net/npm/@json-editor/json-editor@latest/dist/jsoneditor.min.js',
    jsoneditorHash: 'sha512-uWu+rXQQB3W440i9GCPMZZL2/tf58decmRv8uD5KWo0CQn5Qu8JVkK1EXBmJv9Gj1q7TZeRbbntnrz1hcFkdPQ==',
    // if you want this served locally, download above jsoneditor editor to /public/js/ directory and point to that:
    //jsoneditor: '/js/jsoneditor.js',

    usernameRegex: '[a-zA-Z0-9]{3,}',
    sections: [
        'cve',
        'nvd',
        'home'
    ],
    homepage: '/home',

    // Configure addional custom ExpressJS routes.
/*
    customRoutes: [
        {
            path:"/info",
            route: "./customRoutes/info"
        }
    ]*/
};
