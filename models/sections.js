const fs = require('fs');

module.exports = function () {
    var paths=["./default", "./custom"]
    var sections = {};
    if (Array.isArray(paths) && paths.length > 0) {
        for (p of paths) {
            if (fs.existsSync(p)) {
                var names = fs.readdirSync(p);
                for (n of names) {
                    if (!n.startsWith('.'))
                        sections[n] = true;
                }
            }
        }
    }
    return Object.keys(sections);
}
