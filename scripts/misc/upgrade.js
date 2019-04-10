// These are mongo shell routines to upgrade the database
// load these in mongo shell to run appropriate routines
// WARNING: Make backups of all data before running these.
// WARNING: These routines can make irreversable changes to data.
// WARNING: Use with caution. these scripts have not been well tested

console.log('WARNING: This is a mongo shell script');
console.log('WARNING: This is not a nodejs script');

print('These are mongo shell routines to upgrade the database')
print('load these in mongo shell to run appropriate routines')

print('WARNING: Make backups of all data before running these.');
print('WARNING: These routines can make irreversable changes to data.');

var smap = {
    "internally found": "INTERNAL",
    "seen in production": "USER",
    "researcher reported": "EXTERNAL",
    "third party source": "EXTERNAL"
}
var statemap = {
    "drafting": "DRAFT",
    "review-ready": "REVIEW",
    "publish-ready": "READY",
    "published": "PUBLIC",
    "deferred": "RESERVED",
    "rejected": "REJECTED",
    "merged": "MERGED_TO"
}
var phases = {
    DRAFT: "Current",
    REVIEW: "Current",
    READY: "Current",
    PUBLIC: "Past",
    RESERVED: "Future",
    REPLACED_BY: "Other",
    REJECTED: "Deleted",
    SPLIT_FROM: "Other",
    MERGED_TO: "Other"
};
function upgradeDocv002to003(doc) {
    if (doc.cve) {
        print('Found ' + doc.cve.CVE_data_meta.ID);
        var source = {};
        var DCCP = doc.cve.CNA_private;
        if (DCCP) {
            delete DCCP.merge_with;
            if (DCCP.defect) {
                source.defect = DCCP.defect;
            }
            delete DCCP.defect;
            if (DCCP.advisoryID) {
                source.advisory = DCCP.advisoryID;
            }
            delete DCCP.advisoryID
            if (DCCP.metadata && DCCP.metadata.source) {
                source.discovery = smap[DCCP.metadata.source];
            }
            doc.cve.source = source;
            delete DCCP.metadata;
            if (DCCP.bundle) {
                delete DCCP.bundle;
            }
            if (doc.cve.CVE_data_meta.DATE_PUBLIC) {
                DCCP.publish = {}
                DCCP.publish.ym = doc.cve.CVE_data_meta.DATE_PUBLIC.substr(0, 7);
                DCCP.publish.year = doc.cve.CVE_data_meta.DATE_PUBLIC.substr(0, 4);
                DCCP.publish.month = doc.cve.CVE_data_meta.DATE_PUBLIC.substr(5, 2);
            }
            //if(DCCP.share_with_CVE) {
            //    delete DCCP.share_with_CVE;
            //}
            if (DCCP.merge_with) {
                delete DCCP.merge_with;
            }
            if (DCCP.state) {
                doc.cve.CVE_data_meta.STATE = statemap[DCCP.state];
                delete DCCP.state;
            }
        }
        // change this code to copy over advisory id from URL to source.advisory field.
/*
        if (doc.cve.references && doc.cve.references.reference_data) {
            var jsa = doc.cve.references.reference_data[0].url.match(/JSA\d+/);
            if (jsa) {
                if (!doc.cve.source.advisory) {
                    doc.cve.source.advisory = jsa[0];
                }
            }
        }
*/
        if (doc.cve.affects && doc.cve.affects.vendor && doc.cve.affects.vendor.vendor_data) {
            for (var vi in doc.cve.affects.vendor.vendor_data) {
                var v = doc.cve.affects.vendor.vendor_data[vi];
                //print(v.vendor_name);
                if (v.product && v.product.product_data) {
                    for (var pi in v.product.product_data) {
                        var p = v.product.product_data[pi];
                        //print(p.product_name);
                        if (p.version && p.version.version_data) {
                            for (var vri in p.version.version_data) {
                                var vr = p.version.version_data[vri];
                                //print(vr.version_value);
                                var k = vr.version_value.match(/(.*)\s+prior\s+to\s+(.*)/i);
                                if (k) {
                                    vr.version_name = k[1];
                                    vr.affected = "<";
                                    vr.version_value = k[2];
                                }
                            }
                        }
                    }
                }
            }
        }
        if (doc.cve.credit)
            var newCredit = [];
        for (ci in doc.cve.credit) {
            var c = doc.cve.credit[ci];
            if (typeof c === 'string' || c instanceof String) {
                newCredit.push({
                    lang: "eng",
                    value: c
                });
            } else {
                newCredit.push(c);
            }
        }
        if (doc.cve.solution instanceof String || typeof doc.cve.solution === 'string') {
            var solution = [{
                lang: "eng",
                "value": doc.cve.solution
                    }];
            doc.cve.solution = solution;
        }
        if (doc.cve.exploit instanceof String || typeof doc.cve.exploit === 'string') {
            var exploit = [{
                lang: "eng",
                "value": doc.cve.exploit
                    }];
            doc.cve.exploit = exploit;
        }
        doc.body = doc.cve;
        delete doc.cve;
    }
    return doc;
}

function upgrade() {
    var counter = 0,
        total = 0;

    var cves = db.collection('cves');
    var cvesn = db.collection('cvesnew');
    console.log("Connected successfully to server");
    cves.find({}).forEach(function (doc) {
        if (doc) {
            total++;
            if (doc.cve) {
                var id = doc.cve.CVE_data_meta.ID;
                var ndoc = upgradeDocv002to003(doc);
                delete ndoc.id;
                cvesn.save(ndoc).then((result) => {
                    console.log('Updated ' + id);
                    counter++;
                });
            }
        } else {
            console.log('Looked at ' + total + ' documents');
            db.close()
        }
    });
}

function setupYM(){
    db.getCollection('cves').find().forEach(function(doc){
        s = {};
        if(doc.body.CVE_data_meta.DATE_PUBLIC) {
            s["body.CNA_private.publish.ym"] = doc.body.CVE_data_meta.DATE_PUBLIC.substr(0,7);
            s["body.CNA_private.publish.year"] = doc.body.CVE_data_meta.DATE_PUBLIC.substr(0,4);
            s["body.CNA_private.publish.month"] = doc.body.CVE_data_meta.DATE_PUBLIC.substr(5,2);
        }
        s["body.CNA_private.phase"] = phases[doc.body.CVE_data_meta.STATE];
        db.getCollection('cves').update({_id:doc._id}, {$set: s});
    });
}

function setupYMsa() {
    db.getCollection('sas').find().forEach(function(doc){
        s = {};
        if(doc.body.DATE_PUBLIC) {
            s["body.CNA_private.publish.ym"] = doc.body.DATE_PUBLIC.substr(0,7);
            s["body.CNA_private.publish.year"] = doc.body.DATE_PUBLIC.substr(0,4);
            s["body.CNA_private.publish.month"] = doc.body.DATE_PUBLIC.substr(5,2);
        }
        s["body.CNA_private.phase"] = phases[doc.body.STATE];
        db.getCollection('sas').update({_id:doc._id}, {$set: s});
    });
}

// upgrades mongo ids that uses to CVE ID to ObjectIDs.
// This is necessary for comments feature to work
function idUpgrade() {
    db.getCollection('cves').find({"_id" : /CVE-/}).forEach(function(doc) {
        doc._id;
        var oldId = doc._id;
        'removing ' + oldId;
        db.getCollection('cves').remove({ _id: oldId });
        delete doc._id;
        res = db.getCollection('cves').insertOne(doc);
        db.getCollection('cvehistories').update({docid: oldId},{$set:{'parent_id': res.insertedId}});

    });
}

/*
function refnameadd(d) {
    for (r of d.body.references.references_data) {
        r.name = r.url;
        r.refsource = 'CONFIRM';
        r.name = r.url;
    }
    delete d._id;
    return d;
}
*/
function calc(d) {
    if (d.body.CVE_data_meta.DATE_PUBLIC > "") {
        dt = d.body.CVE_data_meta.DATE_PUBLIC;
        if (!d.body.CNA_private.publish) {
            d.body.CNA_private.publish = {};
        }
        d.body.CNA_private.publish.year = dt.substr(0,4);
        d.body.CNA_private.publish.ym = dt.substr(0,7);
        d.body.CNA_private.publish.month = dt.substr(5,2);
    }
    return d;
}

function sacalc(d) {
    if (d.body.DATE_PUBLIC > "") {
        dt = d.body.DATE_PUBLIC;
        if (!d.body.CNA_private.publish) {
            d.body.CNA_private.publish = {};
        }
        d.body.CNA_private.publish.year = dt.substr(0,4);
        d.body.CNA_private.publish.ym = dt.substr(0,7);
        d.body.CNA_private.publish.month = dt.substr(5,2);
    }
    return d;
}

function severityLevel(score) {
        var s = parseFloat(score);
        if(isNaN(s) || s < 0) {
            return '-';
        }
        if(s == 0.0) {
            return 'NONE'
        } else if(s <= 3.9) {
            return 'LOW'
        } else if(s <= 6.9) {
            return 'MEDIUM'
        } else if(s <= 8.9) {
            return 'HIGH'
        } else if(s <= 10.0) {
            return 'CRITICAL'
        } else {
            return '-';
        }
};
