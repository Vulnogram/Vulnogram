module.exports = {

    // The Mongodb URL where CVE entries and users are stored.
    database: 'mongodb://vulnogram:Use a long & strong Password@127.0.0.1:27017/vulnogram',

    // Name of the organization that should be used in page titles etc.,
    orgName: 'Example Org',

    // Name of the group that should be used in page titles etc.,
    groupName: 'Security Incident Response Team',

    //CNA contact address
    contact: 'sirt@example.net',

    classification: 'Confidential INTERNAL USE ONLY',
    copyright: '© Example Org',

    // Uncomment this line and set a random string to allow unauthenticated access to draft CVE entries that are in review-ready or publish-ready state via /review/<token>/ or /review/<token>/CVE-ID
    // This may be useful to share a link to the draft for internal reviews and only those with the link have access to the drafts.    
   //reviewToken: 'randomtoken',

    appName: 'Vulnogram',
    // port where this tool is running
    serverPort: 3555,
    basedir: '/',
    mitreURL: 'https://cve.mitre.org/cgi-bin/cvename.cgi?name=',
    defectURL: 'https://example.net/internal/bugs/',
    publicDefectURL: 'https://example.net/bugs/',
    // ACE editor
    //ace: '/js/ace.js',
    ace: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.3/ace.js',
    aceHash: "sha384-rP/6HzF4Ap08EuRS9yaQsEPDqb8xS5WVTAzL7/LKTnUmJawbKoeSNyqHnNaiXY5X",

    // JSON Editor
    //jsoneditor: '/js/jsoneditor.js',
    jsoneditor: 'https://cdn.jsdelivr.net/npm/@json-editor/json-editor@1.2.1/dist/jsoneditor.min.js',
    jsoneditorHash: 'sha384-iSUg2WRV2cauD+nwMuv7ITxwSe+2heHjWFIOjiWk5/Yve5ovwg/t7qp3ht6VlQBL',

    usernameRegex: '[a-zA-Z0-9]{3,}',
    sections: [
        'cve',
        'nvd'
    ],
    homepage: '/home',
    charts: [
        {
            href: "/cve/agg?state=DRAFT,REVIEW,READY&sort=ym&f=ym&f=owner",
            key: "owner",
            list: "/cve/?state=DRAFT,REVIEW,READY&sort=ym",
            title: "Active CVE Pipeline"
        },
        {
            href: "/cve/agg?sort=ym&f=ym&f=owner",
            key: "owner",
            list: "/cve/?sort=ym",
            title: "CVEs over time"
        },
        {
            href: "/cve/agg?state=DRAFT,REVIEW,READY&f=product",
            key: "product",
            list: "/cve/?state=DRAFT,REVIEW,READY,PUBLIC",
            title: "Active CVEs by Product",
            type: "pie"
        }
    ]
};
