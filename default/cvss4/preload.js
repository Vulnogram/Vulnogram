
function cvssFromURL(text) {
  if (!text) return null;
  // Support "vector=" inside hash (e.g., #vector=CVSS:4.0/...)
  const m = text.match(/(CVSS:\d\.\d[A-Za-z\:\/]+)/i);
  if (m) {
    text = m[1];
  } else {
    return false;
  }
  var cvss = {
    "version": "4.0",
    "baseScore": 10,
    "baseSeverity": "CRITICAL",
    "vectorString": text
  };
  //console.log(hashText);
  // ----- Abbrev → schema enum maps (Base + Threat) -----
  const MAP = {
    AV: { N: "NETWORK", A: "ADJACENT", L: "LOCAL", P: "PHYSICAL" },
    AC: { L: "LOW", H: "HIGH" },
    AT: { N: "NONE", P: "PRESENT" },
    PR: { N: "NONE", L: "LOW", H: "HIGH" },
    UI: { N: "NONE", P: "PASSIVE", A: "ACTIVE" },

    VC: { H: "HIGH", L: "LOW", N: "NONE" },
    VI: { H: "HIGH", L: "LOW", N: "NONE" },
    VA: { H: "HIGH", L: "LOW", N: "NONE" },

    SC: { H: "HIGH", L: "LOW", N: "NONE" },
    SI: { H: "HIGH", L: "LOW", N: "NONE" },
    SA: { H: "HIGH", L: "LOW", N: "NONE" },

    // Threat (Exploit Maturity)
    E: { A: "ATTACKED", P: "PROOF_OF_CONCEPT", U: "UNREPORTED", X: "NOT_DEFINED" },

    // Safety (S) [X,N,P]
    S: { X: "NOT_DEFINED", N: "NEGLIGIBLE", P: "PRESENT" },

    // Automatable (AU) [X,N,Y]
    AU: { X: "NOT_DEFINED", N: "NO", Y: "YES" },

    // Recovery (R) [X,A,U,I]
    R: { X: "NOT_DEFINED", A: "AUTOMATIC", U: "USER", I: "IRRECOVERABLE" },

    // Value Density (V) [X,D,C]
    V: { X: "NOT_DEFINED", D: "DIFFUSE", C: "CONCENTRATED" },

    // Vulnerability Response Effort (RE) [X,L,M,H]
    RE: { X: "NOT_DEFINED", L: "LOW", M: "MODERATE", H: "HIGH" },

    // Provider Urgency (U) [X,Clear,Green,Amber,Red]
    // Vector uses words (e.g., U:Red). Accept both one-letter and word forms.
    U: {
      X: "NOT_DEFINED",
      C: "CLEAR", G: "GREEN", A: "AMBER", R: "RED",
      Clear: "CLEAR", Green: "GREEN", Amber: "AMBER", Red: "RED",
      CLEAR: "CLEAR", GREEN: "GREEN", AMBER: "AMBER", RED: "RED"
    }
  };

  // ----- Abbrev → JSON schema property name (Base + Threat) -----
  const PROP = {
    AV: "attackVector",
    AC: "attackComplexity",
    AT: "attackRequirements",
    PR: "privilegesRequired",
    UI: "userInteraction",

    VC: "vulnConfidentialityImpact",
    VI: "vulnIntegrityImpact",
    VA: "vulnAvailabilityImpact",

    SC: "subConfidentialityImpact",
    SI: "subIntegrityImpact",
    SA: "subAvailabilityImpact",

    E: "exploitMaturity",

    S: "Safety",
    AU: "Automatable",
    R: "Recovery",
    V: "valueDensity",
    RE: "vulnerabilityResponseEffort",
    U: "providerUrgency"
  };

  // ----- “Maximum severity” defaults when absent (Base + Threat) -----
  const DEFAULT = {
    AV: "NETWORK",
    AC: "LOW",
    AT: "NONE",
    PR: "NONE",
    UI: "NONE",
    VC: "HIGH",
    VI: "HIGH",
    VA: "HIGH",
    SC: "HIGH",
    SI: "HIGH",
    SA: "HIGH",
    E: "NOT_DEFINED",
    S: "NOT_DEFINED",
    AU: "NOT_DEFINED",
    R: "NOT_DEFINED",
    V: "NOT_DEFINED",
    RE: "NOT_DEFINED",
    U: "NOT_DEFINED"
  };


  // ----- Parse the vector into a dict like { AV:"N", AC:"L", ..., AU:"Y", U:"Red" } -----
  const vec = {};
  text.split("/").slice(1).forEach(p => {
    const i = p.indexOf(":");
    if (i === -1) return;
    const k = p.slice(0, i);
    const raw = p.slice(i + 1).trim();
    vec[k] = raw;
  });

  // ----- Base & Threat: set from vector or use MAX if key exists (or vector supplies it) -----
  function setMetric(abbrev) {
    const prop = PROP[abbrev];
    const map = MAP[abbrev];
    if (!prop || !map) return;

    if (abbrev in vec) {
      const code = vec[abbrev];
      const val = map[code];
      //console.log(prop +' = '+ code + '->' + val);
      if (!val) throw new Error(`Unknown value '${code}' for ${abbrev}`);
      cvss[prop] = val;
    } else {
      //console.log(prop +' = (default) '+DEFAULT[abbrev]);

      // Absent in vector; fill with maximum severity (per requirement)
      cvss[prop] = DEFAULT[abbrev];
    }
  }

  // Fill Base metrics (mandatory in the spec, but we still guard)
  ["AV", "AC", "AT", "PR", "UI", "VC", "VI", "VA", "SC", "SI", "SA", "E", "S", "AU", "R", "V", "RE", "U"].forEach(setMetric);
  cvss.baseScore = (new window.CVSS40(cvss.vectorString)).Score();
  return cvss;
}


var urgencyUI = {
  "NOT_DEFINED": ["Undefined", "NA"],
  "CLEAR": ["Info", "NA"],
  "GREEN": ["Reduced", "NONE"],
  "AMBER": ["Normal", "MEDIUM"],
  "RED": ["Highest", "CRITICAL"]
}

function setNeedle(s, u) {
  var sev = cvssjs.severityLevel(s);
  //document.getElementById('needle').setAttribute('transform', `rotate(${6.5 * s + (s > 0 ? 3 : 0)} 196.626 38.181)`);
  const needle = document.getElementById('needle');
  const angle = 6.5 * s + (s > 0 ? 3 : 0);
  //needle.setAttribute('transform-origin', '196.626px 38.181px');
  needle.animate([{
    rotate: `${angle}deg`// 196.626px 38.181px`
  }], {
    duration: 600,        // Animation speed in ms (e.g., 300ms)
    delay: 50,
    easing: 'ease-in-out',   // A nice, smooth easing
    fill: 'forwards'      // IMPORTANT: This makes the needle stay at its
    // final position after the animation finishes.
    // Without it, it would snap back to the start.
  });

  var iscore = document.getElementById('finalScore');
  iscore.innerText = s;
  iscore.setAttribute('class', 'CVSS ' + sev);
  var isev = document.getElementById('finalSeverity');
  isev.innerHTML = 'severity<br><b>' + sev + '</b>';
  isev.setAttribute('class', 'CVSS ' + sev);
  if (u) {
    var iUrgency = document.getElementById('finalUrgency');
    iUrgency.innerHTML = 'urgency<br><b>' + urgencyUI[u][0] + '</b>';
    iUrgency.setAttribute('class', 'CVSS ' + urgencyUI[u][1]);
  }
  document.getElementById('wig').animate({
    rotate: ['0deg', '7deg', '-4deg', '2deg', '0deg'],
  }, {
    duration: 700,
    delay: 650,
    easing: 'ease',
    iterations: 1,
    fill: 'forwards'
  });
  return false;
}

function loadVector(v, init = true) {
  if (v) {
    var cvssJSON = cvssFromURL(v);
    if (cvssJSON) {
      if (init) {
        initJSON = cvssJSON;
      } else {
        if (docEditor) {
          docEditor.setValue(cvssJSON)
        }
      }
    }
  }
}

function onCalcChange(vector, score) {
  const currentURLVector = getVectorFromURL();
  if (currentURLVector !== vector) {
    const newSearch = vector ? `?${vector}` : '';
    const newUrl = window.location.pathname + newSearch;
    history.pushState({ vector: vector }, '', newUrl);
  }
  setTimeout(() => {
    document.title = score + ' ' + vector;
  }, 100);
  return false;
}

function getVectorFromURL() {
    const rawSearch = window.location.search;
  if (rawSearch.length <= 1 || rawSearch[0] !== '?') {
    // If empty or doesn't start with '?', treat as no input.
    return;
  }
  // Get the string *without* the leading '?'
  let vectorFromURL='';
  try {
    //console.log(rawSearch);
    vectorFromURL = decodeURIComponent(rawSearch.substring(1)).trim();
  } catch (e) {
    return; 
  }
  return vectorFromURL;
}

function onURLChange(event,init = false) {
  let v = getVectorFromURL();
  if (v) {
    loadVector(v, init);
  }
}

window.addEventListener('popstate', onURLChange);
//initialize calc on load use the search text
onURLChange(null, true);