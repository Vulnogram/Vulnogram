var querymen = require('querymen');
function phraseSplit(searchString) {
        var s1 = searchString.match(/\\?.|^$/g).reduce((p, c) => {
        if(c === '"'){
            p.quote ^= 1;
        }else if(!p.quote && c === ' '){
            p.a.push('');
        }else{
            p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
        }
        return  p;
    }, {a: ['']}).a;
        return(s1);
}

    /*qSchema.formatter('escape', function (escape, value, param) {
        var r = [];
        if (escape) {
            if(typeof value == 'string') {
                r = phraseSplit(value);
            } else if (Array.isArray(value)) {
                for(v in value) {
                    r.push(v.phraseSplit(value));
                }
            }
        }
        var terms = "";
        for(var term of r) {
            terms = terms + ' "' + term + '" ';
        }
        return terms;
    });*/
/*    qSchema.formatter('nullify', function(escape, value, param){
        console.log("NULLIFY CALLED!");
        if (value === "null") {
            return {$exists:false};
        }
    });
    if(opts.facet.severity) {
        qSchema.param('severity').option('nullify', true);
    }*/

module.exports = function(facet) {
    var queryDef = {
        q: {
            normalize: false,
            type: String,
            default: null,
            //escape: true,
            paths: ["$text"],
            operator: "$search",
            /*formatter: function (txt, v, p) {
                return v.replace(/([A-Z]+-[0-9A-Za-z-]+)/g, "\"$1\"");
            }*/

        },
        sort: {
            default: 'ID'
        },
        limit: {
            default: 100,
            max: 22000
        }
    };  
    for (key in facet) {
        var options = facet[key];
        queryDef[key] = {
            type: [String],
            paths: [options.path]
        }
        if (options.type) {
            queryDef[key].type = options.type;
        }
        if (options.hasOwnProperty('default')) {
            queryDef[key].default = options.default;
        }
        if (options.queryOperator) {
            queryDef[key].operator = options.queryOperator;
        }
        if(options.sortDefault) {
            queryDef.sort.default = options.sortDefault;
        }
    }
    return querymen.middleware(new querymen.Schema(queryDef));
}