var express = require('express')
var router = express.Router()
const csurf = require('csurf');
var csrfProtection = csurf();
var conf = require('../../config/conf');

// Utility routine to pre-fill CVE JSON with data from a defect tracking system.
// Defect identifier is in req.params.bug
// First query your defect or bug tracking system
// Fill the skeleton JSON with relevant details, transform data as necessary

router.get('/pr:pr', csrfProtection, function (req, res) {
        var CVE_JSON_skeleton = {
            "data_type": "CVE",
            "data_format": "MITRE",
            "data_version": "4.0",

            "CVE_data_meta": {
                "ASSIGNER": conf.contact,
                "DATE_PUBLIC": "",
                "TITLE": "Example title goes here. See config/conf.js on how to configure this."
            },
            "source": {
              "defect": req.params.pr  
            },
            CNA_private: {
                "owner": "",
                "todo": []
            }
        };
        res.render('../../default/cve/edit', {
            schemaName: 'cve',
            title: 'Create a CVE entry from a defect',
            doc: {
                body: CVE_JSON_skeleton,
            },
            csrfToken: req.csrfToken(),
            postUrl: "./new"
        });
    });

module.exports = router;