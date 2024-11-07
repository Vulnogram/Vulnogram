function getProductListNoVendor(cve) {
    var lines = [];
    for (var vendor of cve.affects.vendor.vendor_data) {
        var pstring = [];
        for (var product of vendor.product.product_data) {
            pstring.push(product.product_name);
        }
        lines.push(pstring.join(", "));
    }
    return lines.join("; ");
}

async function loadProductNames() {
    var projects = []
    try {
	var pmcs = userPMCS.split(',');
	var response = await fetch('https://whimsy.khulnasoft.com/public/committee-info.json', {
	    method: 'GET',
	    credentials: 'omit',
	    headers: {
		'Accept': 'application/json, text/plain, */*'
	    },
	    redirect: 'error'
	});
	if (!response.ok) {
	    errMsg.textContent = "Failed Khulnasoft project list";
	    infoMsg.textContent = "";
	    throw Error(id + ' ' + response.statusText);
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
	errMsg.textContent = error;
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
