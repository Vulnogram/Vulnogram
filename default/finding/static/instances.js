// Sorts and filters the instances table of a Finding page. Read-only pages allow no inline
// scripts, so this is served from the section's static folder.
(function () {
    var table = document.getElementById('instTable');
    var filter = document.getElementById('instFilter');
    if (!table || typeof Tablesort !== 'function') return;

    // Sort severity and status by rank, not alphabetically.
    var RANK = {
        severity: ['Critical', 'High', 'Medium', 'Low', 'Info'],
        status: ['New', 'Triaged', 'Confirmed', 'In remediation', 'Fixed', 'Verified', 'Closed',
            'False positive', 'Not affected', 'Accepted risk', 'Duplicate']
    };
    Object.keys(RANK).forEach(function (col) {
        table.querySelectorAll('td.' + col).forEach(function (td) {
            td.setAttribute('data-sort', String(RANK[col].indexOf(td.textContent.trim()) + 10));
        });
    });
    new Tablesort(table);

    // Show the rows that match a checked value in every chart that has one.
    if (!filter) return;
    function apply() {
        var want = {};
        filter.querySelectorAll('.bar input:checked').forEach(function (i) {
            (want[i.name] = want[i.name] || []).push(i.value);
        });
        table.querySelectorAll('tbody tr').forEach(function (tr) {
            tr.hidden = Object.keys(want).some(function (col) {
                var td = tr.querySelector('td.' + col);
                var vals = td ? Array.prototype.map.call(td.querySelectorAll('[title]'), function (s) { return s.title; }) : [];
                return !vals.some(function (v) { return want[col].indexOf(v) >= 0; });
            });
        });
    }
    filter.addEventListener('change', apply);
    document.getElementById('instReset').addEventListener('click', function () {
        filter.querySelectorAll('.bar input:checked').forEach(function (i) { i.checked = false; });
        apply();
    });
})();
