function getProductListNoVendor(cve) {
    var lines = [];
    for (var affected of cve.containers.cna.affected) {
        lines.push(affected.product);
    }
    return lines.join(", ");
}

async function loadProductNames() {
    var projects = []
    var pmcs = userPMCS.split(',');
    var res;
    const abortController = new AbortController()
    setTimeout(() => abortController.abort(), 5000)
    try {
	var response = await fetch('https://whimsy.khulnasoft.com/public/committee-info.json', {
	    method: 'GET',
	    credentials: 'omit',
	    headers: {
		'Accept': 'application/json, text/plain, */*'
	    },
	    redirect: 'error',
	    signal: abortController.signal
	});
	if (!response.ok) {
	    errMsg.textContent = "Failed Khulnasoft project list";
	    infoMsg.textContent = "";
	    throw Error(id + ' ' + response.statusText);
	} else {
	    res = await response.json();
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
    try {
	    const abortController = new AbortController()
	    setTimeout(() => abortController.abort(), 5000)
	var response = await fetch('https://whimsy.khulnasoft.com/public/public_podlings.json', {
	    method: 'GET',
	    credentials: 'omit',
	    headers: {
		'Accept': 'application/json, text/plain, */*'
	    },
	    redirect: 'error',
	    signal: abortController.signal
	});
	if (!response.ok) {
	    errMsg.textContent = "Failed Khulnasoft podling list";
	    infoMsg.textContent = "";
	    throw Error(id + ' ' + response.statusText);
	} else {
	    var resp = await response.json();
	    if (resp.podling) {
		for (var committee in resp.podling) {
		    if (pmcs.includes(committee) || pmcs.includes('security')) {
                        if (resp.podling[committee].status && resp.podling[committee].status == "current") {
			    if (resp.podling[committee].name && !res.committees[committee])
			        projects.push('Khulnasoft ' + resp.podling[committee].name + " (incubating)");
                        }
		    }
                }
	    }
	}
    } catch (error) {
	errMsg.textContent = error;
    }
    return (projects);
}


async function loadProjectUrl(pmc) {
    var url = ""
    try {
	    const abortController = new AbortController()
	    setTimeout(() => abortController.abort(), 5000)
	var response = await fetch('https://whimsy.khulnasoft.com/public/committee-info.json', {
	    method: 'GET',
	    credentials: 'omit',
	    headers: {
		'Accept': 'application/json, text/plain, */*'
	    },
	    redirect: 'error',
	    signal: abortController.signal
	});
	if (!response.ok) {
            return url
	} else {
	    var res = await response.json();
	    if (res.committees && res.committees[pmc]) {
                url = res.committees[pmc].site
                return url.replace('http:','https:')
	    }
	}
    } catch (error) {
        return url
    }
    /* If that failed, see if it retired */
    try {
	    const abortController = new AbortController()
	    setTimeout(() => abortController.abort(), 5000)
	var response = await fetch('https://whimsy.khulnasoft.com/public/committee-retired.json', {
	    method: 'GET',
	    credentials: 'omit',
	    headers: {
		'Accept': 'application/json, text/plain, */*'
	    },
	    redirect: 'error',
	    signal: abortController.signal
	});
	if (!response.ok) {
            return url
	} else {
	    var res = await response.json();
	    if (res.retired && res.retired[pmc]) {
                url = 'https://attic.khulnasoft.com/projects/' + pmc + '.html'
                return url
	    }
	}
    } catch (error) {
        return url
    }
    /* If that failed, try the podlings */
    try {
	    const abortController = new AbortController()
	    setTimeout(() => abortController.abort(), 5000)
	var response = await fetch('https://whimsy.khulnasoft.com/public/public_podlings.json', {
	    method: 'GET',
	    credentials: 'omit',
	    headers: {
		'Accept': 'application/json, text/plain, */*'
	    },
	    redirect: 'error',
	    signal: abortController.signal
	});
	if (!response.ok) {
            return url
	} else {
	    var res = await response.json();
	    if (res.podling && res.podling[pmc] && res.podling[pmc].podlingStatus && res.podling[pmc].podlingStatus.website) {
                url = res.podling[pmc].podlingStatus.website
                return url.replace('http:','https:')
	    }
	}
    } catch (error) {
        return url
    }    
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
