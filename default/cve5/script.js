var currentYear = new Date().getFullYear();
const defaultTimeout = 1000 * 60 * 60; // one hour timeout

function hidepopups() {
    document.getElementById("userListPopup").open = false;
    document.getElementById("userStatsPopup").open = false;
}

function tweetJSON(event, link) {
    var j = mainTabGroup.getValue();
    if (!j) {
        event.preventDefault();
        return;
    }
    var id = j.cveMetadata.cveId;
    var text = id + ' ' + getBestTitle(j.containers.cna);
    text = text.replace(/ +(?= )/g, '');
    link.href = 'https://twitter.com/intent/tweet?&text='
        + encodeURI(text)
        + '&url=' + encodeURI(textUtil.deep_value(j, 'containers.cna.references.0.url'));
}

function loadCVE(value) {
    var realId = value.match(/(CVE-(\d{4})-(\d{1,12})(\d{3}))/);
    if (realId) {
        var id = realId[1];
        var year = realId[2];
        var bucket = realId[3];
        fetch('https://raw.githubusercontent.com/CVEProject/cvelistv5/master/review_set/' + year + '/' + bucket + 'xxx/' + id + '.json', {
            method: 'GET',
            credentials: 'omit',
            headers: {
                'Accept': 'application/json, text/plain, */*'
            },
            redirect: 'error'
        })
            .then(function (response) {
                if (!response.ok) {
                    errMsg.textContent = "Failed to load valid CVE JSON";
                    infoMsg.textContent = "";
                    throw Error(id + ' ' + response.statusText);
                }
                return response.json();
            })
            .then(function (res) {
                if (res.dataVersion && (res.dataVersion == '5.0' || res.dataVersion == '5.1')) {
                    if (res.containers.cna.x_legacyV4Record) {
                        delete res.containers.cna.x_legacyV4Record;
                    }
                    if (res.containers) {
                        res = cveFixForVulnogram(res);
                    }
                    var edOpts = (res.cveMetadata.state == 'REJECTED') ? rejectEditorOption : publicEditorOption;
                    mainTabGroup.change(0);
                    loadJSON(res, id, "Loaded " + id + " from GIT!", edOpts);
                } else {
                    errMsg.textContent = "Failed to load valid CVE JSON v 5.0 record";
                    infoMsg.textContent = "";
                }
            })
            .catch(function (error) {
                errMsg.textContent = error;
            })
    } else {
        errMsg.textContent = "CVE ID required";
    }
    return false;
}

async function rejectRecord() {
    var id = getDocID();
    if (window.confirm('Do you want to reject ' + id + '? All vulnerability details will be removed.')) {
        loadJSON({
            cveMetadata: {
                cveId: id,
                state: 'REJECTED'
            }
        }, id, 'Rejcting ' + id, rejectEditorOption);
        mainTabGroup.change(0);
    }
}

async function draftEmail(event, link, renderId) {
    var subject = ''
    if (typeof (mainTabGroup) !== 'undefined') {
        var j = mainTabGroup.getValue();
        if (!j) {
            event.preventDefault();
            return;
        }
        var id = textUtil.deep_value(j, 'cveMetadata.cveId');
        /* var cvelist = textUtil.deep_value(j, 'CNA_private.CVE_list');
         if (cvelist && cvelist.length > 0) {
             id = '';
         }*/
        subject = id + ' ' + getBestTitle(j.containers.cna);
    } else {
        var t = document.getElementById(renderId).getElementsByTagName('h2')[0];
        if (t) {
            subject = t.textContent;
        }
    }
    var emailBody = document.getElementById(renderId).innerText;
    link.href = "mailto:?subject=" + encodeURI(subject) + '&body=' + encodeURI(emailBody);
};

var additionalTabs = {
    advisoryTab: {
        title: 'Advisory',
        setValue: async function (j) {
            if (pugRender && document.getElementById("render")) {
                var cve_list = textUtil.deep_value(j, 'CNA_private.CVE_list');
                if (cve_list && cve_list.length > 0) {
                    var cSet = new Set();
                    var cMap = {};
                    for (var d of cve_list) {
                        if (d.CVE) {
                            for (var x of d.CVE.match(/CVE-\d{4}-[a-zA-Z\d\._-]{4,}/igm)) {
                                cSet.add(x);
                                cMap[x] = {
                                    impact: '',
                                    summary: d.summary
                                }
                            }
                        }
                    }
                    if (cSet.size > 0) {
                        var r = await textUtil.getDocuments('nvd', Array.from(cSet), ['cve.CVE_data_meta', 'cve.description', 'impact']);
                        for (var c of r) {
                            var cveid = textUtil.deep_value(c, 'cve.CVE_data_meta.ID');
                            if (textUtil.deep_value(c, 'impact.baseMetricV3.cvssV3')) {
                                cMap[cveid].impact = {
                                    cvss: c.impact.baseMetricV3.cvssV3
                                };
                            } else if (textUtil.deep_value(c, 'impact.baseMetricV2.cvssV2')) {
                                cMap[cveid].impact = {
                                    cvss: c.impact.baseMetricV2.cvssV2
                                };
                            }
                            if (!cMap[cveid].summary) {
                                var title = textUtil.deep_value(c, 'cve.CVE_data_meta.TITLE');
                                cMap[cveid].summary = title ? title : textUtil.deep_value(c, 'cve.description.description_data')[0].value;
                            }
                            cSet.delete(cveid);
                        }
                        if (cSet.size > 0) {
                            var nr = await textUtil.getDocuments('cve', Array.from(cSet), ['body.CVE_data_meta', 'body.impact', 'body.description']);
                            for (c of nr) {
                                var cveid = textUtil.deep_value(c, 'body.CVE_data_meta.ID');
                                if (textUtil.deep_value(c, 'body.impact.cvss')) {
                                    cMap[cveid].impact = c.body.impact;
                                }
                                if (!cMap[cveid].summary) {
                                    var desc = textUtil.deep_value(c, 'body.description.description_data')[0].value;
                                    cMap[cveid].summary = desc ? desc : textUtil.deep_value(c, 'body.CVE_data_meta.TITLE');
                                }
                            }
                        }
                        document.getElementById("render").innerHTML = pugRender({
                            renderTemplate: 'page',
                            doc: j,
                            cmap: cMap,
                        });
                    } else {
                        document.getElementById("render").innerHTML = pugRender({
                            renderTemplate: 'page',
                            doc: j
                        });
                    }
                } else {
                    document.getElementById("render").innerHTML = pugRender({
                        renderTemplate: 'page',
                        doc: j
                    });
                }
            }
        }
    },
    mitreTab: {
        title: 'MITRE-Preview',
        setValue: function (j) {
            document.getElementById("mitreweb").innerHTML = pugRender({
                renderTemplate: 'mitre',
                doc: j
            });
        }
    },
    cvePortalTab: {
        title: 'CVE Org',
        setValue: function () {

        }
    }
}

/* fullname = vendor . product . platforms . module .others . default status
/* table --> [ fullname ][version][affected|unaffected|unknown] = [ list of ranges ] */
function versionStatusTable5(affected) {
    var t = {}; // resulting table structure
    nameAndPlatforms = {};
    var showCols = {
        platforms: false,
        modules: false,
        affected: false,
        unaffected: false,
        unknown: false
    };
    for (var p of affected) {
        var pname = p.product ? p.product : p.packageName ? p.packageName : '';
        if (p.platforms)
            showCols.platforms = true;
        if (p.modules)
            showCols.modules = true;
        if (p.status)
            showCols[p.status] = true;
        var platforms =
            (p.platforms ? p.platforms.join(', ') : '');
        var others = {};
        if (p.collectionURL) {
            others.collectionURL = p.collectionURL;
        }
        if (p.repo) {
            others.repo = p.repo;
        }
        if (p.programFiles) {
            others.programFiles = p.programFiles;
        }
        if (p.programRoutines) {
            others.programRoutines = p.programRoutines;
        }
        var modules = p.modules ? p.modules.join(', ') : '';
        var pFullName = [
            (p.vendor ? p.vendor + ' ' : '') + pname + (major ? ' ' + major : ''),
            platforms,
            modules,
            others,
            p.defaultStatus
        ];
        nameAndPlatforms[pFullName] = pFullName;
        if (p.versions) {
            for (v of p.versions) {
                var rows = {
                    affected: [],
                    unaffected: [],
                    unknown: []
                };
                var major = undefined; //major ? major[1] : '';
                if (v.version) {
                    showCols[v.status] = true;
                    if (!v.changes) {  // simple range versions
                        var rangeStart = '';
                        if (v.version != 'unspecified' && v.version != 0)
                            rangeStart = 'from ' + v.version;
                        if (v.lessThan) {
                            var rangeEnd = ' before ' + v.lessThan;
                            if (v.lessThan == 'unspecified' || v.lessThan == '*')
                                rangeEnd = "";
                            rows[v.status].push(rangeStart + rangeEnd);
                        } else if (v.lessThanOrEqual) {
                            var rangeEnd = ' through ' + v.lessThanOrEqual;
                            if (v.lessThanOrEqual == 'unspecified' || v.lessThanOrEqual == '*')
                                rangeEnd = "";
                            rows[v.status].push(rangeStart + rangeEnd);
                        } else {
                            rows[v.status].push(v.version);
                        }
                    } else {
                        var ver = v.version;
                        showCols[v.status] = true;
                        var range = '';
                        if (ver != 'unspecified' && ver != 0)
                            range = 'from ' + ver;
                        if (v.lessThan) {
                            var rangeEnd = ' before ' + v.lessThan;
                            if (v.lessThan == 'unspecified' || v.lessThan == '*')
                                rangeEnd = "";
                            range = range + (v.lessThan != ver ? rangeEnd : '');
                        } else if (v.lessThanOrEqual) {
                            var rangeEnd = ' through ' + v.lessThanOrEqual;
                            if (v.lessThanOrEqual == 'unspecified' || v.lessThanOrEqual == '*')
                                rangeEnd = "";
                            range = range + (v.lessThanOrEqual != ver ? rangeEnd : '');
                        } else {
                            range = ver;
                        }
                        var changes = [];
                        for (c of v.changes) {
                            changes.push(c.status + ' from ' + c.at);
                        }
                        if (changes.length > 0) {
                            range = range + ' (' + changes.join(', ') + ')';
                        }
                        rows[v.status].push(range);
                    }
                }
                if (!t[pFullName]) t[pFullName] = [];
                t[pFullName].push(rows);
            }
        }
    }
    return ({ groups: nameAndPlatforms, vals: t, show: showCols });
}

function getProductAffected(cve) {
    var lines = [];
    for (var vendor of cve.affected.vendors) {
        var pstring = [];
        for (var product of vendor.products) {
            var versions = {};
            var includePlatforms = true;
            var platforms = {};
            for (var version of product.versions) {
                if (version.version_affected && version.version_affected.indexOf('!') < 0 && version.version_affected.indexOf('?') < 0) {
                    versions[version.version_name] = 1;
                    if (version.platform == "all" || version.platform == "") {
                        includePlatforms = false;
                    }
                    if (includePlatforms && version.platform) {
                        var ps = version.platform.split(',');
                        for (var p of ps) {
                            platforms[p.trim()] = true;
                        }
                    }
                }
            }
            pstring.push('This issue affects ' + product.product_name + ' ' +
                Object.keys(versions).sort().join(", ") + '.');
            if (includePlatforms && (Object.keys(platforms).length > 0)) {
                pstring.push('Affected platforms: ' + Object.keys(platforms).sort().join(', ') + '.');
            }
        }
        lines.push(pstring.join(" "));
    }
    return lines.join();
};

/* safely convert HTML in supportingMedia to text */
function domhtml(html) {
    text = htmltoText(html) || "";
    let doc = new DOMParser().parseFromString('<pre>' + text + '</pre>', 'text/html');
    var ret = doc.body.innerText || "";
    return ret.trim();
}

function htmltoText(html) {
    if (html) {
        let text = html;
        //text = text.replace(/\n/gi, "");
        text = text.replace(/<style([\s\S]*?)<\/style[^>]*?>/gi, "");
        text = text.replace(/<script([\s\S]*?)<\/script[^>]*?>/gi, "");
        text = text.replace(/<a.*?href="(.*?)[\?\"].*?>\1<\/a.*?>/gi, " $1 ");
        text = text.replace(/<a.*?href="(.*?)[\?\"].*?>(.*?)<\/a.*?>/gi, " $2 $1 ");
        text = text.replace(/<\/div[^>]*?>/gi, "\n\n");
        text = text.replace(/<\/li[^>]*?>/gi, "\n");
        text = text.replace(/<li.*?>/gi, "  *  ");
        text = text.replace(/<\/ul[^>]*?>/gi, "\n\n");
        text = text.replace(/<\/p[^>]*?>/gi, "\n\n");
        text = text.replace(/<br\s*[\/]?>/gi, "\n");
        text = text.replace(/<[^>]+>/gi, "");
        //text = text.replace(/^\s*/gim, "");
        //text = text.replace(/ ,/gi, ",");
        //text = text.replace(/ +/gi, " ");
        //text = text.replace(/\n\n/gi, "\n");
        text = text.replace(/^\s+/,"");
        text = text.replace(/\s+$/,"");
        return text;
    }
};
function getProblemTypeString(o) {
    var pts = [];
    for (var j = 0; j < o.problemTypes.length; j++) {
        for (var k = 0; k < o.problemTypes[j].descriptions.length; k++) {
            if (o.problemTypes[j].descriptions[k].lang == "en") {
                var pt = o.problemTypes[j].descriptions[k].description;
                if (pt) {
                    pts.push(pt.replace(/^CWE-[0-9 ]+/, ''));
                }
            }
        }
    }
    return pts.join(', ');
};
function getProductList(cna) {
    var lines = [];
    for (var p of cna.affected) {
        lines.push(p.product);
    }
    return lines.join("; ");
};
function getBestTitle(o) {
    var title = o.providerMetadata.title;
    if (!title) {
        title = getProblemTypeString(o) + ' vulnerability in ' + getProductList(o);
    }
    return title;
};

document.addEventListener("click", function (e) {
    var popup = document.querySelector(".popup");
    if (popup) {
        var insideTooltip = popup.contains(e.target);
        if (!insideTooltip) {
            popup.removeAttribute("open");
        }
    }
});

var autoTextRequired = [
    'root.containers.cna.affected',
    'root.containers.cna.problemTypes',
    'root.containers.cna.impacts',
]
function enoughAutoTextFields(res) {
    for(s of res) {
        for(p of autoTextRequired) {
            if (s.path.startsWith(p)) {
                return false;
            }
        }
    }
    return true;
}

async function autoText(event) {
    if (event) {
        event.preventDefault();
    }
    if (docEditor.validation_results
        && (docEditor.validation_results.length == 0 || enoughAutoTextFields(docEditor.validation_results)))
         {
        var doc = docEditor.getValue();
        var text = cveRender({
            ctemplate: 'autoText',
            con: doc.containers.cna
        });
        // remove extra spaces
        text = text.trim().replaceAll(/\s+/g, ' ');
        hE = await docEditor.getEditor('root.containers.cna.descriptions.0.supportingMedia.0.value');

        // Capitolize sentances.
        var rg = /(^\w{1}|\.\s*\w{1})/gi;
        text = text.replace(rg, function (toReplace) {
            return toReplace.toUpperCase();
        });
        hE.setValue(text, '', false);
    } else {
        showAlert('Please enter all the required fields first!');
    }
}

function addRichText(d) {
    var ht = '';
    if (d.value) {
        ht = cveRender({
            ctemplate: 'htext',
            t: d.value
        })
    }
    if (!d.supportingMedia) {
        d.supportingMedia = [
            {
                type: "text/html",
                base64: false,
                value: ht
            }
        ]
    }
    return d;
}

function addRichTextArray(j) {
    if (j && j.length > 0) {
        j.forEach(element => addRichText(element));
    }
}

function addRichTextCVE(j) {
    var htmlFields = [
        'descriptions',
        'solutions',
        'workarounds',
        'exploits',
        'configurations'
    ];

    if (j && j.containers && j.containers.cna) {
        var cna = j.containers.cna
        htmlFields.forEach(element => {
            addRichTextArray(cna[element])
        });
    }
    return j;
}

function cvssv3_0_to_cvss3_1(j) {
    if (j && j.containers && j.containers.cna && j.containers.cna.metrics) {
        j.containers.cna.metrics.forEach(m => {
            if (m.cvssV3_0) {
                m.cvssV3_1 = m.cvssV3_0;
                m.cvssV3_1.version = "3.1";
                if (m.cvssV3_1.vectorString) {
                    m.cvssV3_1.vectorString = m.cvssV3_1.vectorString.replace('CVSS:3.0', 'CVSS:3.1');
                }
                delete m.cvssV3_0;
            }
        });
    }
    return j
}

async function loadCVEFile(event, elem) {
    var file = elem.files[0];
    if (file) {
        try {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                try {
                    res = JSON.parse(evt.target.result);
                    if (res && res.dataVersion == "5.0" || res.dataVersion == "5.1") {
                        res = cveFixForVulnogram(res);
                        //docEditor.setValue(res);
                        var edOpts = (res.cveMetadata.state == 'REJECTED') ? rejectEditorOption : publicEditorOption;
                        mainTabGroup.change(0);
                        loadJSON(res, null, "Imported file", edOpts);
                    } else {
                        showAlert("Not a CVE JSON 5.0 file!");
                    }
                } catch (e) {
                    showAlert(e);
                }
            };
            reader.onerror = function (evt) {
                errMsg.textContent = "Error reading file";
                showAlert('Error reading file!');
            };
        } catch (e) {
            showAlert(e);
        }
    }
}

function cveFixForVulnogram(j) {
    j = addRichTextCVE(j);
    j = cvssv3_0_to_cvss3_1(j);
    if (j.containers && j.containers.cna && j.containers.cna.problemTypes == undefined) {
        j.containers.cna.problemTypes = [];
    }
    if (j.containers && j.containers.cna && j.containers.cna.impacts == undefined) {
        j.containers.cna.impacts = [];
    }
    if (j.containers && j.containers.cna && j.containers.cna.metrics == undefined) {
        j.containers.cna.metrics = [];
    }
    return j;
}


function toggleCpeApplicability() {
  const toggleSwitch = document.getElementById("toggleSwitch");
  const cpeInputSection = document.getElementById("cpeInputSection");
  const cpeBodySection = document.getElementById("cpeBodySection");
  const cpeManualNote = document.getElementById("cpeManualNote");

  if (toggleSwitch.checked) {
    if (cpeInputSection) cpeInputSection.style.display = "block";
    if (cpeBodySection) cpeBodySection.style.display = "none";
    if (cpeManualNote) cpeManualNote.style.display = "block";
  } else {
    if (cpeBodySection) cpeBodySection.style.display = "block";
    if (cpeInputSection) cpeInputSection.style.display = "none";
    if (cpeManualNote) cpeManualNote.style.display = "none";
  }
}

function resetCpeInput() {
  const currentJson = docEditor.getValue();

  // Populate the CPE Applicability block from the affected products section
  const affected = docEditor.getValue().containers.cna.affected;
  const cpeApplicability = generateCpeApplicability(affected);

  // Update the cpeApplicability section with cpeApplicabilityNodes
  currentJson.containers.cna.cpeApplicability = cpeApplicability;

  // Set the updated JSON model back to the docEditor
  docEditor.setValue(currentJson);

  // Clear the JSON text input and error message
  const textInput = document.getElementById("jsonTextInput");
  const errorMessageElement = document.getElementById("jsonErrorMessage");
  textInput.value = "";
  errorMessageElement.style.display = "none";
  errorMessageElement.textContent = "";
}

// Function to process manually-entered CPE Applicability block
function processCpeInput() {
  const validatedCpeaJson = validateJsonInput();
  validateCpeApplicabilitySchema(validatedCpeaJson);
}

// Function to validate JSON-formatted input
function validateJsonInput() {
  const textInput = document.getElementById("jsonTextInput");
  const errorMessageElement = document.getElementById("jsonErrorMessage");
  errorMessageElement.style.color = "red";

  // Check if input is empty
  const inputValue = textInput.value.trim();
  if (!inputValue) {
    errorMessageElement.textContent = "Input cannot be empty.";
    errorMessageElement.style.display = "block";
    return;
  }

  // Maximum length for the input
  const MAX_LENGTH = 10000;
  // Check if input exceeds maximum length
  if (inputValue.length > MAX_LENGTH) {
    errorMessageElement.textContent = `Input is too long. Maximum allowed length is ${MAX_LENGTH} characters.`;
    errorMessageElement.style.display = "block";
    return;
  }

  // Validate JSON format of input
  let cpeaBlock;
  try {
    cpeaBlock = JSON.parse(textInput.value);
    errorMessageElement.style.display = "none";
  } catch (e) {
    errorMessageElement.textContent = "Invalid JSON format: " + e.message;
    errorMessageElement.style.display = "block";
    return;
  }

  return cpeaBlock;
}

async function validateCpeApplicabilitySchema(validatedCpeaJson) {
  const errorMessageElement = document.getElementById("jsonErrorMessage");
  let cpeApplicabilityNodes;

  // Check if the validatedCpeaJson is valid
  if (Array.isArray(validatedCpeaJson)) {
    cpeApplicabilityNodes = validatedCpeaJson;
  } else if (
    validatedCpeaJson &&
    typeof validatedCpeaJson === "object" &&
    Array.isArray(validatedCpeaJson.cpeApplicability)
  ) {
    cpeApplicabilityNodes = validatedCpeaJson.cpeApplicability;
  } else {
    errorMessageElement.style.color = "red";
    errorMessageElement.innerHTML =
      "Invalid CPE Applicability JSON input:<br>" +
      "Input must be an array or an object with a 'cpeApplicability' array property.";
    errorMessageElement.style.display = "block";
    return;
  }

  // Read and update the doc editor's JSON.
  const currentJson = docEditor.getValue();
  currentJson.containers.cna.cpeApplicability = cpeApplicabilityNodes;
  docEditor.setValue(currentJson);

  const customValidator = (schema, value, path) => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const valid = validate(value);

    if (!valid) {
      console.error("Validation errors for path:", path, validate.errors);
      return validate.errors;
    }

    // Skip validation for other paths
    return [];
  };

  // Add a custom validator, use it to validate the CPE Applicability statement,
  // and then remove the custom validator.
  JSONEditor.defaults.custom_validators.push(customValidator);
  const validationResults = docEditor.validate();
  JSONEditor.defaults.custom_validators.pop();

  // If there are no validation results, we're done.
  if (validationResults.length == 0) return;

  // Get the validation errors we care about.
  const cpeApplicabilityErrors = validationResults.filter((error) =>
    error.path.startsWith("root.containers.cna.cpeApplicability")
  );

  // Where to put the errors or success message.
  const schemaErrorMessage = document.getElementById("schemaErrorMessage");

  // If there are no errors, report success and stop!
  if (cpeApplicabilityErrors.length == 0) {
    schemaErrorMessage.innerHTML =
      "Valid: CPE Applicability block conforms to CVE 5.0 schema";
    schemaErrorMessage.style.display = "block";
    schemaErrorMessage.style.color = "#24b23b";
    return;
  }

  // If there are errors, report them,
  const errorMessage = cpeApplicabilityErrors
    .map((error) => `${error.path}: ${error.message}`)
    .join("\n");
  schemaErrorMessage.style.color = "red";
  schemaErrorMessage.innerHTML =
    "Invalid CPE Applicability block, does not conform to cpeApplicability CVE 5.0 schema:<br>" +
    errorMessage.replace(/\n/g, "<br>");
  schemaErrorMessage.style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
  docEditor.on("ready", function () {
    docEditor.watch("root.containers.cna.affected", function () {
      // Only update derived CPE Applicability if manual input is not present or nodes is empty
      const jsonTextInput = document.getElementById("jsonTextInput");
      let nodesIsEmpty = true;
      if (jsonTextInput && jsonTextInput.value.trim().length > 0) {
        try {
          const parsed = JSON.parse(jsonTextInput.value);
          // If the root is an array, check the first element for nodes
          if (
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            Array.isArray(parsed[0].nodes)
          ) {
            nodesIsEmpty = parsed[0].nodes.length === 0;
          }
          // If the root is an object with cpeApplicability array
          else if (
            parsed &&
            Array.isArray(parsed.cpeApplicability) &&
            parsed.cpeApplicability.length > 0 &&
            Array.isArray(parsed.cpeApplicability[0].nodes)
          ) {
            nodesIsEmpty = parsed.cpeApplicability[0].nodes.length === 0;
          }
        } catch (e) {
          // Invalid JSON, treat as empty nodes (allow overwrite)
          nodesIsEmpty = true;
        }
      }
      if (nodesIsEmpty) {
        setTimeout(setCpeApplicability, 0);
      }
    });
  });
});

function setCpeApplicability() {
  const affected = docEditor.getValue().containers.cna.affected;
  const cpeApplicability = generateCpeApplicability(affected);
  docEditor
    .getEditor("root.containers.cna.cpeApplicability")
    .setValue(cpeApplicability);
}

function generateCpeApplicability(affected) {
    let cpeApplicabilityNodes = [];

    for (const affectedProduct of affected) {
        const cpeApplicabilityNode = generateCpeApplicabilityNode(affectedProduct);
        if (cpeApplicabilityNode) {
            cpeApplicabilityNodes.push(cpeApplicabilityNode);
        }
    }

    return [{
        "operator": "OR",
        "nodes": cpeApplicabilityNodes
    }];
}
function normalizeCPEtoken(x) {
    return x.trim().toLowerCase().replaceAll(/[\s:]+/g,'_').replaceAll(/([*?])/g,'\$1');
}

function generateCpeApplicabilityNode(affectedProduct) {
    let cpeMatch = [];

    if (!affectedProduct.vendor || !affectedProduct.product) {
        return null;
    }

    if (affectedProduct.versions && affectedProduct.versions.length > 0) {
        for (const v of affectedProduct.versions) {
            if (v.status === "unaffected") {
                continue;
            }
            if (v.lessThan) {
                cpeMatch.push({
                    "vulnerable": true,
                    "criteria": `cpe:2.3:a:${normalizeCPEtoken(affectedProduct.vendor)}:${normalizeCPEtoken(affectedProduct.product)}:*:*:*:*:*:*:*:*`,
                    "versionStartIncluding": normalizeCPEtoken(v.version),
                    "versionEndExcluding": normalizeCPEtoken(v.lessThan)
                });
            }
            else if (v.lessThanOrEqual) {
                cpeMatch.push({
                    "vulnerable": true,
                    "criteria": `cpe:2.3:a:${normalizeCPEtoken(affectedProduct.vendor)}:${normalizeCPEtoken(affectedProduct.product)}:*:*:*:*:*:*:*:${v.version}`,
                    "versionStartIncluding": normalizeCPEtoken(v.version),
                    "versionEndIncluding": normalizeCPEtoken(v.lessThanOrEqual)
                });
            }
        }
    }
    if (cpeMatch.length > 0) {
        let cpeApplicabilityNode = {
            "operator": "OR",
            "negate": false,
            "cpeMatch": cpeMatch
        };

        return cpeApplicabilityNode;
    } else {
        return null;
    }
}
