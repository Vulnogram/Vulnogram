module.exports = {
conf:{
    title: 'National Vulnerability Database',
    readonly: true,
    name: 'NVD',
    disableDrafts: true,
    class: 'vgi-data'
},
facet: {
    ID: {
        path: 'cve.CVE_data_meta.ID',
        regex: 'CVE-[0-9]{4}-[0-9]{4,10}',
        class: 'nobr'
    },
    cvss: {
        path: 'impact.baseMetricV3.cvssV3.baseScore',
        //chart: true,
        //hideColumn: true
    },
    severity: {
        path: 'impact.baseMetricV3.cvssV3.baseSeverity',
        chart: true,
        hideColumn: true
    },
    AV: {
        path: 'impact.baseMetricV3.cvssV3.attackVector',
        chart: true,
    },
    PR: {
        path: 'impact.baseMetricV3.cvssV3.privilegesRequired',
        chart: true,
    },
    C: {
        path: 'impact.baseMetricV3.cvssV3.confidentialityImpact',
        chart: true,
    },
    I: {
        path: 'impact.baseMetricV3.cvssV3.integrityImpact',
        chart: true,
    },
    A: {
        path: 'impact.baseMetricV3.cvssV3.avilabilityVector',
        chart: true,
    },
    date: {
        path: 'publishedDate',
        sortDefault: '-date'
    },
    type: {
        path: 'cve.problemtype.problemtype_data.description.value',
        //chart: true
    },
    vendor: {
        path: 'cve.affects.vendor.vendor_data.vendor_name',
        pipeline: [
            {
                $unwind: "$cve.affects.vendor.vendor_data"
            }, {
                 $sortByCount: "$cve.affects.vendor.vendor_data.vendor_name"
            }
        ]
    },
   /* product: {
        path: 'cve.affects.vendor.vendor_data.product.product_data.product_name',
        pipeline: [
            {
                $unwind: "$cve.affects.vendor.vendor_data"
            }, {
                $unwind: "$cve.affects.vendor.vendor_data.product.product_data"
            }, {
                 $sortByCount: "$cve.affects.vendor.vendor_data.product.product_data.product_name"
            }
        ]
    },*/
    description: {
        path: 'cve.description.description_data.value',
        class: 'sgl'
    }
}
}
