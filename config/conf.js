const fs = require("fs");
var package = require('../package.json');
var secrets = require('./customsecrets.js');

module.exports = {
    // CVE automation configuration and CNA name
    cveorgid: "'f0158376-9dc2-43b6-827c-5f631a4d8d09'",
    cveapiheaders: secrets.cveapiheaders,
    cveapiurl: "https://cveawg.mitre.org/api",
    cveapishortname: "apache",
    cveapiliveservice: true,
    // which PMC is admin group?
    admingroupname: "security",
    // which PMC have a security@ address?
    pmcswithsecurityemails: ["airflow","ambari","commons","couchdb","dolphinscheduler","dubbo","fineract","geronimo","guacamole","hadoop","hive","httpd","ignite","jackrabbit","kafka","libcloud","logging","lucene","metron","milagro","nifi","ofbiz","openmeetings","openoffice","orc","ozone","sentry","shiro","singa","sling","solr","spamassassin","spark","struts","tomcat","trafficcontrol","trafficserver","trafodion","zeppelin","zookeeper"],
    // which PMC are allowed to live allocate a CNA name from CVE Project
    pmcstrustedascna: ["*","-zeppelin"],

    // The Mongodb URL where CVE entries and users are stored.
    // WARNING! Configure MongoDB authentication and use a strong password
    // WARNING! Ensure MongoDB is not reachable from the network.
    database: secrets.database,
    //database: `mongodb://vulnogram:StrongLongPass@127.0.0.1:27017/vulnogram`,
    // Name of the organization that should be used in page titles etc.,
    orgName: ' ',

    // Name of the group that should be used in page titles etc.,
    groupName: ' ',

    //CNA contact address
    contact: 'security@apache.org',

    classification: 'This tool is based on Vulnogram, contact security@apache.org with any queries or problems',
    copyright : 'v0.1.0-rc1-142-g1b76b57',

    // Uncomment this line and set a random string to allow unauthenticated access to draft CVE entries that are in review-ready or publish-ready state via /review/<token>/ or /review/<token>/CVE-ID
    // This may be useful to share a link to the draft for internal reviews and only those with the link have access to the drafts.
   //reviewToken: 'randomtoken',

    // port where this tool is running
    serverHost: process.env.VULNOGRAM_HOST || '0.0.0.0',
    serverPort: process.env.VULNOGRAM_PORT || 3555,
    basedir: '/',

    //Uncomment this block to enable HTTPs. Configure paths for valid SSL certificates.
    // Either get them from your favorite Certificate Authority or generate self signed:
    // Keep these safe and secured and readable only by account running vulnogram process!
    // $ openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out cert.pem

    httpsOptions: {
        key: fs.readFileSync('/etc/letsencrypt/live/security-vm-he-fi.apache.org/privkey.pem', 'utf8'),
        cert: fs.readFileSync('/etc/letsencrypt/live/security-vm-he-fi.apache.org/cert.pem', 'utf8'),
        ca: fs.readFileSync('/etc/letsencrypt/live/security-vm-he-fi.apache.org/chain.pem', 'utf8'),
        minVersion: 'TLSv1.2'
    },

    mitreURL: 'https://www.cve.org/CVERecord?id=',
    defectURL: '',
    publicDefectURL: '',

    // ACE editor
    ace: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.13/ace.js',
    aceHash: "sha512-OMjy8oWtPbx9rJmoprdaQdS2rRovgTetHjiBf7RL7LvRSouoMLks5aIcgqHb6vGEAduuPdBTDCoztxLR+nv45g==",
    // if you want this served locally, download ace editor to /public/js/ directory and point to that:
    //ace: '/js/ace.js',
    //aceHash: "sha512-GoORoNnxst42zE3rYPj4bNBm0Q6ZRXKNH2D9nEmNvVF/z24ywVnijAWVi/09iBiVDQVf3UlZHpzhAJIdd9BXqw==",


    // JSON Editor
    jsoneditor: 'https://cdnjs.cloudflare.com/ajax/libs/json-editor/2.8.0/jsoneditor.min.js',
    jsoneditorHash: 'sha512-8y8kuGFzNGSgACEMNnXJGhOQaLAd4P9MdCXnJ37QjGTBPRrD5FCEVEKj/93xNihQehkO3yVKnOECFWGxxBsveQ==',
    // if you want this served locally, download above jsoneditor editor to /public/js/ directory and point to that:
    //jsoneditor: '/js/jsoneditor.min.js',

    // ajv - JSON schema draft-07 validation
    // NOTE -- including ajv is experimental and can be excluded if desired by commenting out the next two lines
    ajv: 'https://cdnjs.cloudflare.com/ajax/libs/ajv/8.12.0/ajv7.min.js',
    ajvHash: 'sha512-U2SW9Ihh3GF6F8gP8QgLS+I244xnM5pFCh3cigpw7bAzUDnKDlxdlFL4kjyXTle8SJl/tJ0gdnwd44Eb3hLG/Q==',
    // if you want this served locally, download above ajv to /public/js/ directory and point to that:
    //ajv: '/js/ajv7.min.js',
    //ajvHash: 'sha512-U2SW9Ihh3GF6F8gP8QgLS+I244xnM5pFCh3cigpw7bAzUDnKDlxdlFL4kjyXTle8SJl/tJ0gdnwd44Eb3hLG/Q==',

    usernameRegex: '[a-zA-Z0-9]{3,}',
    sections: [
        'cve5',
        'cve',
    ],
    homepage: '/cve5',

    // Configure addional custom ExpressJS routes.
/*
    customRoutes: [
        {
            path:"/info",
            route: "./customRoutes/info"
        }
    ]*/
};
