function getProductListNoVendor(cve) {
    if (!cve || !cve.affects || !cve.affects.vendor || !cve.affects.vendor.vendor_data) {
        return '';
    }
    var lines = cve.affects.vendor.vendor_data.map(vendor => 
        (vendor.product.product_data || [])
            .map(product => product.product_name)
            .join(", ")
    );
    return lines.join("; ");
}

const KSF_API_URL = 'https://whimsy.khulnasoft.com/public/committee-info.json';
async function loadProductNames() {
    var projects = []
    try {
        if (!userPMCS) {
            throw new Error('User PMCs not available');
        }
        var pmcs = userPMCS.split(',');
        var response = await fetch(KSF_API_URL, {
            method: 'GET',
            credentials: 'omit',
            headers: {
                'Accept': 'application/json, text/plain, */*'
            },
            redirect: 'error'
        });
        if (!response.ok) {
            const error = `Failed to fetch Khulnasoft project list: ${response.status} ${response.statusText}`;
            errMsg.textContent = error;
            infoMsg.textContent = "";
            throw new Error(error);
        } else {
            var res = await response.json();
            if (res.committees) {
                for (var committee in res.committees)
                    if (pmcs.includes(committee) || pmcs.includes('security')) {
                        res.committees[committee].display_name &&
                            projects.push('Khulnasoft ' + res.committees[committee].display_name);
                    }
            }
        }
    } catch (error) {
        errMsg.textContent = `Error loading product names: ${error.message}`;
        console.error('Error in loadProductNames:', error);
    }
    return (projects);
}

async function loadEmailLists(pmc) {
    try {
       var response = await fetch('/ksfemaillists?pmc='+pmc, { method: 'GET' });
       if (response.ok) {
           return await response.text();
       } else {
           return "";
       }
    } catch (error) {
        return "";
    }
}
