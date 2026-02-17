const fs = require("fs");
var package = require('../package.json');

module.exports = {

    // The Mongodb URL where CVE entries and users are stored.
    // WARNING! Configure MongoDB authentication and use a strong password
    // WARNING! Ensure MongoDB is not reachable from the network.
    database: `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME || "admin"}:${process.env.MONGO_INITDB_ROOT_PASSWORD || "admin"}@${process.env.MONGO_HOST || "127.0.0.1"}:${process.env.MONGO_PORT || "27017"}`,
    //database: `mongodb://vulnogram:StrongLongPass@127.0.0.1:27017/vulnogram`,
    // database: `mongodb://127.0.0.1:27017/vulnogram`,
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
    realtime: {
        enabled: process.env.VULNOGRAM_REALTIME !== 'false',
        debounceMs: 350,
        maxPatchBytes: 50000,
        maxPatchOps: 2000,
        rateLimit: {
            windowMs: 1000,
            max: 60
        }
    },

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
    //ace: '/js/ace.js',
    //aceHash: "sha512-GoORoNnxst42zE3rYPj4bNBm0Q6ZRXKNH2D9nEmNvVF/z24ywVnijAWVi/09iBiVDQVf3UlZHpzhAJIdd9BXqw==",


    // JSON Editor
    //jsoneditor: 'https://cdnjs.cloudflare.com/ajax/libs/json-editor/2.15.2/jsoneditor.js',
    jsoneditorHash: 'sha512-Odi69X/i28s3GR3ZQyE+g4ieU30AMOovH50wJbehVMWxVChGa1KCUzyvOXkHfYr/2AQizFRNWI1R6oifT16ouQ==',
    // if you want this served locally, download above jsoneditor editor to /public/js/ directory and point to that:
    jsoneditor: '/js/jsoneditor.min.js',

    // ajv - JSON schema draft-07 validation
    // NOTE -- including ajv is experimental and can be excluded if desired by commenting out the next two lines
    ajv: 'https://cdnjs.cloudflare.com/ajax/libs/ajv/8.12.0/ajv7.min.js',
    ajvHash: 'sha512-U2SW9Ihh3GF6F8gP8QgLS+I244xnM5pFCh3cigpw7bAzUDnKDlxdlFL4kjyXTle8SJl/tJ0gdnwd44Eb3hLG/Q==',
    // if you want this served locally, download above ajv to /public/js/ directory and point to that:
    //ajv: '/js/ajv7.min.js',
    //ajvHash: 'sha512-U2SW9Ihh3GF6F8gP8QgLS+I244xnM5pFCh3cigpw7bAzUDnKDlxdlFL4kjyXTle8SJl/tJ0gdnwd44Eb3hLG/Q==',

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
