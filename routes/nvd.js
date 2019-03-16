// Copyright (c) 2017 Chandan B N. All rights reserved.

const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

async function getCVE(ids) {
    try {
        var r = await mongoose.connection.collection('nvds').find({
            'cve.CVE_data_meta.ID': {
                '$in': Array.from(ids.values())
            }
        }, {
            'cve.CVE_data_meta': 1,
            'cve.description': 1,
            'impact': 1
        }).toArray();
        for (e of r) {
            e.body = e.cve;
            delete e.cve;
            if ((!e.body.CVE_data_meta.TITLE) && e.body.description && e.body.description.description_data && e.body.description.description_data[0] && e.body.description.description_data[0].value) {
                e.body.CVE_data_meta.TITLE = e.body.description.description_data[0].value;
            }
            if (e.impact) {
                e.body.impact = {};
                if (e.impact.baseMetricV3 && e.impact.baseMetricV3.cvssV3) {
                    e.body.impact.cvss = e.impact.baseMetricV3.cvssV3;
                } else if (e.impact.baseMetricV2 && e.impact.baseMetricV2.cvssV2) {
                    e.body.impact.cvss = e.impact.baseMetricV2.cvssV2;
                }
                delete e.impact;
            }
        }
        return r;
    } catch (e) {
        return [];
    }
}

router.get("/json/:id", async function (req, res) {
    var ids = req.params.id.match(RegExp('CVE-[0-9]{4}-[0-9]{4,7}', 'img'));
    var r = await getCVE(new Set(ids));
    if (ids) {
        res.json({
            q: {},
            ids: ids,
            docs: r
        });
    }
});

module.exports = {
    router: router,
    getCVE: getCVE
};