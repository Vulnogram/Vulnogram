const fs = require("fs");
var package = require('../package.json');

module.exports = {

    // The Mongodb URL where CVE entries and users are stored.
    // WARNING! Configure MongoDB authentication and use a strong password
    // WARNING! Ensure MongoDB is not reachable from the network.
    database: `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME || "admin"}:${process.env.MONGO_INITDB_ROOT_PASSWORD || "admin"}@${process.env.MONGO_HOST || "127.0.0.1"}:${process.env.MONGO_PORT || "27017"}`,

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
    serverHost: process.env.VULNOGRAM_HOST || '127.0.0.1',
    serverPort: process.env.VULNOGRAM_PORT || 3555,
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

    mitreURL: 'https://www.cve.org/CVERecord?id=',
    defectURL: 'https://example.net/internal/bugs/',
    publicDefectURL: 'https://example.net/bugs/',

    // ACE editor
    ace: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.13/ace.js',
    aceHash: "sha512-OMjy8oWtPbx9rJmoprdaQdS2rRovgTetHjiBf7RL7LvRSouoMLks5aIcgqHb6vGEAduuPdBTDCoztxLR+nv45g==",
    // if you want this served locally, download ace editor to /public/js/ directory and point to that:
    //ace: '/js/ace.min.js',
    //aceHash: "sha512-GoORoNnxst42zE3rYPj4bNBm0Q6ZRXKNH2D9nEmNvVF/z24ywVnijAWVi/09iBiVDQVf3UlZHpzhAJIdd9BXqw=="


    // JSON Editor
    jsoneditor: 'https://cdnjs.cloudflare.com/ajax/libs/json-editor/2.6.1/jsoneditor.min.js',
    //jsoneditor: 'https://cdn.jsdelivr.net/npm/@json-editor/json-editor@latest/dist/jsoneditor.min.js',
    jsoneditorHash: 'sha512-wKxQaNjG9D/GAVUp3sWH/OnnYDQ6NO3rcNGmmZ+YBjSqh7vwKvkBhNvSg91qmz2QSq/rsrrJjOmhdbd/LkbxGw==',
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
