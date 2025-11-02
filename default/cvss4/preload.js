
/**
 * Fill a CVSS v4.0 JSON object from its vectorString.
 * - Base + Threat: if a metric is missing from the vector, fill with MAX severity.
 * - Supplemental: if a metric is missing from the vector, set to `undefined`.
 *
 * Property names & enum values align with FIRST's CVSS v4.0 schema.
 * Spec references for Supplemental metrics and vector forms:
 *  - S, AU, U, R, V, RE abbreviations & values (Tables 16–21, 23). 
 *
 * @param {object} cvss - e.g. { version:"4.0", vectorString:"CVSS:4.0/AV:N/AC:L/...", ... }
 * @returns {object} the same object reference, mutated
 */
/*
window.addEventListener('hashchange', function(event) {
        console.log('Hash changed!');
        console.log('Old URL:', event.oldURL);
        console.log('New URL:', event.newURL);
        console.log('Current hash:', window.location.hash);
        var cvss = cvssFromHash(window.location.hash);
        if(cvss) {
            console.log(cvss);
            docEditor.setValue(cvss);
        }
        // Perform actions based on the new hash
        // For example, update content or navigate to a new section
});
*/
function cvssFromHash(hashText) {
    if (!hashText) return null;
    // Support "vector=" inside hash (e.g., #vector=CVSS:4.0/...)
    const m = hashText.match(/(CVSS:\d\.\d[A-Za-z\:\/]+)/i);
    if (m) {
        hashText = m[1];
    } else {
        return false;
    }
    var cvss={
        "version": "4.0",
        "baseScore": 10,
        "baseSeverity": "CRITICAL",
        "vectorString": hashText
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
    E:  { A: "ATTACKED", P: "PROOF_OF_CONCEPT", U: "UNREPORTED", X: "NOT_DEFINED" },

        // Safety (S) [X,N,P]
    S:  { X: "NOT_DEFINED", N: "NEGLIGIBLE", P: "PRESENT" },

    // Automatable (AU) [X,N,Y]
    AU: { X: "NOT_DEFINED", N: "NO", Y: "YES" },

    // Recovery (R) [X,A,U,I]
    R:  { X: "NOT_DEFINED", A: "AUTOMATIC", U: "USER", I: "IRRECOVERABLE" },

    // Value Density (V) [X,D,C]
    V:  { X: "NOT_DEFINED", D: "DIFFUSE", C: "CONCENTRATED" },

    // Vulnerability Response Effort (RE) [X,L,M,H]
    RE: { X: "NOT_DEFINED", L: "LOW", M: "MODERATE", H: "HIGH" },

    // Provider Urgency (U) [X,Clear,Green,Amber,Red]
    // Vector uses words (e.g., U:Red). Accept both one-letter and word forms.
    U:  {
      X: "NOT_DEFINED",
      C: "CLEAR",   G: "GREEN",  A: "AMBER",   R: "RED",
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

    E:  "exploitMaturity",

    S:  "Safety",
    AU: "Automatable",
    R:  "Recovery",
    V:  "valueDensity",
    RE: "vulnerabilityResponseEffort",
    U:  "providerUrgency"
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
    E:  "ATTACKED",
    S: "NOT_DEFINED",
    AU: "NOT_DEFINED",
    R:  "NOT_DEFINED",
    V: "NOT_DEFINED",
    RE: "NOT_DEFINED",
    U:  "NOT_DEFINED"
  };


  // ----- Parse the vector into a dict like { AV:"N", AC:"L", ..., AU:"Y", U:"Red" } -----
  const vec = {};
  hashText.split("/").slice(1).forEach(p => {
    const i = p.indexOf(":");
    if (i === -1) return;
    const k = p.slice(0, i);
    const raw = p.slice(i + 1).trim();
    vec[k] = raw;
  });

  // ----- Base & Threat: set from vector or use MAX if key exists (or vector supplies it) -----
  function setMetric(abbrev) {
    const prop = PROP[abbrev];
    const map  = MAP[abbrev];
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
  ["AV","AC","AT","PR","UI","VC","VI","VA","SC","SI","SA", "E","S","AU","R","V","RE","U"].forEach(setMetric);
  cvss.baseScore = (new window.CVSS40(cvss.vectorString)).Score();
  return cvss;
}

function setHash(v) {    
window.location.hash = v;
return false;
}
var urgencyUI = {
  "NOT_DEFINED" : ["Undefined","NA"],
  "CLEAR": ["Informational", "NONE"],
  "GREEN":["Reduced","NONE"],
  "AMBER": ["Moderate", "MEDIUM"],
  "RED":["Highest","CRITICAL"]
}
function setNeedle(s,u) {
    var sev = cvssjs.severityLevel(s);
    document.getElementById('needle').setAttribute('transform', `rotate(${6.5*s} 196.626 38.181)`);
    var iscore = document.getElementById('finalScore');
    iscore.innerText = s;
    iscore.setAttribute('class','CVSS '+sev);
    var isev = document.getElementById('finalSeverity');
    isev.innerHTML = 'severity<br><b>'+sev+'</b>';
    isev.setAttribute('class', 'CVSS '+sev);
    if (u) {
      var iUrgency = document.getElementById('finalUrgency');
      iUrgency.innerHTML = 'urgency<br><b>'+urgencyUI[u][0]+'</b>';
      iUrgency.setAttribute('class', 'CVSS '+urgencyUI[u][1]);
    }
    document.getElementById('wig').animate({
      rotate: ['4deg', '-3deg', '2deg', '-1deg']
    }, {
  duration: 300,
  iterations: 1,
});
    return false;
}

function loadVector(v,init=true) {
  if(v) {
    var cvssJSON = cvssFromHash(v);
    if(cvssJSON){
      if (init) {
        initJSON = cvssJSON;
      } else {
        if (docEditor){
          docEditor.setValue(cvssJSON)
        }
      }
    }
  }
}

if(window.location.hash) {
  loadVector(window.location.hash);
}