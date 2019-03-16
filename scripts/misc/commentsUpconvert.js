const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

const async = require('async');
var fs = require( 'fs' )
var sanitizeHtml = require('sanitize-html');
var linkifyHtml = require('linkifyjs/html');
const conf = require('../config/conf');
var _ = require('lodash');
const he = require('he');
var mime = require('mime-types');

var borderRegex =  [/^([a-zA-Z0-9\.\#\s]+)*$/];
var widthRegex =     [/^(\d+(px|em|%|cm|in|pc|pt|mm|ex)?\s?)+$/];
var sopts = {
    allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
  'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
  'table', 'thead', 'cite','caption', 'small', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'font', 'u', 's', 'tt', 'dd', 'dt', 'sup', 'sub', 'span', 'img'],
    allowedAttributes: {
        '*': ['style'],
        'a': ['href', 'target'],
        'img': ['src']
    },
    allowedStyles: {
        '*': {
            'color': [/^\#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/, /^[\w-]+$/],
            'background': [/^\#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/, /^[\w-]+$/],
            'background-color': [/^\#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/, /^[\w-]+$/],
            'border': borderRegex,
            'border-left': borderRegex,
            'border-right': borderRegex,
            'border-top': borderRegex,
            'border-bottom': borderRegex,
            'border-width': borderRegex,
            'border-bottom-width': borderRegex,
            'padding':widthRegex,
            'padding-left':widthRegex,
            'padding-right':widthRegex,
            'padding-top':widthRegex,
            'padding-bottom':widthRegex,
            'margin': widthRegex,
            'margin-left': widthRegex,
            'margin-right': widthRegex,
            'margin-top': widthRegex,
            'margin-bottom': widthRegex
        }
    },
    allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'data'],
    allowedSchemesByTag: {
        'img':['http', 'https', 'ftp', 'mailto', 'data'],
        'a': ['http', 'https', 'ftp', 'mailto', 'data']
    },
    transformTags: {
        'a': function (tagName, attribs) {
            // My own custom magic goes here
            attribs.target = '_blank';
            if(attribs.href){
                return {
                    tagName: 'a',
                    attribs: attribs
                }
            }else {
                return {tagname: 'span'}
            };
        },
        'img': function (tagName, attribs) {
            // My own custom magic goes here
            if (attribs.src) {
                if (attribs.src.startsWith('data:image/')) {
                    return {
                        tagName: 'img',
                        attribs: {
                            style: 'max-width:100%',
                            src: attribs.src
                        }
                    }
                } else {
                    return {
                        tagName: 'small',
                        text: ' [ IMG ' + he.encode(attribs.src) + ' ] '
                    }
                }
            } else {
                return 'small';
            }
        }
    }
};

var cs = conf.sections;
var MongoClient = require('mongodb').MongoClient;
var db;

async function fixCVEComments(coll) {
    db = await MongoClient.connect(conf.database, { useNewUrlParser: true });
    for(cx of coll){
        var count = 0;
        var c=cx;
        console.log(c)
        var cl = db.collection(c);
        //var docs = await cl.find({'body.ID':process.argv[2]});
        var docs = await cl.find({'comments.0':{$exists:true}});
        var doc;
        while(1) {
            doc = await docs.nextObject();
            if(doc == null) {
                break;
            } else {
                var updset = {};
                var updunset = {};
                //console.log(' Old doc ' + JSON.stringify(doc,1,1,1));                
                if(doc.comments) {
                    for (cm of doc.comments) {
                        if (cm.createdAt == "desc") {
                            cm.createdAt = doc.createdAt;  
                            cm.updatedAt = doc.createdAt;
                        } else {
                            cm.createdAt = new Date(cm.createdAt);
                            cm.updatedAt = new Date(cm.updatedAt);
                        }
                        if (cm.html && (cm.createdAt.getTime() == cm.updatedAt.getTime()) || (cm.createdAt == null && cm.author == 'system')) {
                            cm.hypertext = remmultibr(DOMPurify.sanitize(linkifyHtml(sanitizeHtml(parafy(remAu(cm.html)), sopts))));
                            //console.log('Original html present' + cm.html)
                            //cm.html = linkifyHtml(sanitizeHtml(cm.html, sopts));
                        } else {
                            cm.hypertext = text2html(cm.body);
                        }
                        if (cm.createdAt == null || cm.createdAt.getTime() == 0) {
                            cm.createdAt = doc.createdAt;   
                        }
                        if (cm.updatedAt == null || cm.updatedAt.getTime() == 0) {
                            cm.updatedAt = doc.createdAt;   
                        }
                    }
                    doc.comments.sort((a,b)=> {return (b.createdAt -  a.createdAt)});
                    updset.comments = doc.comments;
                }
                if(doc.body.attachments) {
                    doc.files = [];
                    for(f of doc.body.attachments) {
                        if(f) {
                            var mimetype = mime.lookup(f);
                            var [ftype, fsubtype] = mimetype ? mimetype.split('/',2) : ['unknown','unknown'];
                            doc.files.push({name: f, type: ftype, subtype: fsubtype})
                        }
                    }
                    delete doc.body.attachments;
                    updset.files = doc.files;
                }
                console.log(' fixing doc '+doc._id + ' : '+count++);
                await cl.update({'_id':doc._id},
                                {$set: updset,'$unset':{'body.CNA_private.phase':""}})
            }
        }
    };
    db.close();
}


async function fixComments(coll) {
    db = await MongoClient.connect(conf.database, { useNewUrlParser: true });
    for(cx of [coll]){
        var c=cx;
        console.log(c)
        var cl = db.collection(c);
        //var docs = await cl.find({'body.ID':process.argv[2]});
        var docs = await cl.find({});
        var doc;
        while(1) {
            doc = await docs.nextObject();
            if(doc == null) {
                break;
            } else {
                //console.log(' Old doc ' + JSON.stringify(doc,1,1,1));                
                if(doc.body.description) {
                    for (i in doc.body.description) {
                        doc.body.description[i] = text2html(doc.body.description[i]);
                    }
                }
                if(doc.comments) {
                    for (cm of doc.comments) {
                        if (cm.createdAt == "desc") {
                            cm.createdAt = doc.createdAt;  
                            cm.updatedAt = doc.createdAt;
                        } else {
                            cm.createdAt = new Date(cm.createdAt);
                            cm.updatedAt = new Date(cm.updatedAt);
                        }
                        if (cm.html && (cm.createdAt.getTime() == cm.updatedAt.getTime()) || (cm.createdAt == null && cm.author == 'system')) {
                            cm.hypertext = remmultibr(DOMPurify.sanitize(linkifyHtml(sanitizeHtml(parafy(remAu(cm.html)), sopts))));
                            //console.log('Original html present' + cm.html)
                            //cm.html = linkifyHtml(sanitizeHtml(cm.html, sopts));
                        } else {
                            cm.hypertext = text2html(cm.body);
                        }
                        if (cm.createdAt == null || cm.createdAt.getTime() == 0) {
                            cm.createdAt = doc.createdAt;   
                        }
                        if (cm.updatedAt == null || cm.updatedAt.getTime() == 0) {
                            cm.updatedAt = doc.createdAt;   
                        }
                    }
                    doc.comments.sort((a,b)=> {return (b.createdAt -  a.createdAt)});
                }
                if(doc.body.attachments) {
                    doc.files = [];
                    for(f of doc.body.attachments) {
                        if(f) {
                            var mimetype = mime.lookup(f);
                            var [ftype, fsubtype] = mimetype ? mimetype.split('/',2) : ['unknown','unknown'];
                            doc.files.push({name: f, type: ftype, subtype: fsubtype})
                        }
                    }
                    delete doc.body.attachments;
                }
                //console.log(' new doc ' + JSON.stringify(doc,1,1,1));
                await cl.update({_id:doc._id},{$set: {comments: doc.comments, 'body.description': doc.body.description, files: doc.files},'$unset':{'body.attachments':""}})
            }
        }
    };
    db.close();
}

function remmultibr(t) {
    if(t) {
        return t
            .replace(/(<br>\n?){3,}/g, '<br><br>').replace(/<\/cite><br><br>[ \t]*&gt;<cite>/g, '</cite><br>&gt;<cite>').replace(/(<\/?t[dhr]>)[ \t]*<br[ \t]*\/?>[ \t]*(<\/?t[hrd]>)/g, '$1$2').replace(/<div>(<br>)+/g, '<div>');
    } else {
        return t;
    }
    
}
function parafy(t) {
    if(t) {
        return t.trim()
            .replace(/\r?\n/g, '\n')
            .trim() // normalize line endings
            .replace(/[ \t]+$/gm, '')
            .replace(/^[ \t]+$/gm, '')
            .trim() // trim empty line endings
            .replace(/\n\n+/gm, '<br/><br/>')
            .trim() // insert <p> to multiple linebreaks
            .replace(/\n/g, '<br/>')
    } else {
        return t;
    }
}
function remAu(t) {
    return t.replace(/^<html><body><div>[\s\n][A-Za-z0-9]+ - [0-9]{4}-[0-9]{2}-[0-9]{2}:\n\n/,'<html><body><div>').replace(/\n*<\/div>\n<\/body><\/html>/, '</div></body></html>');
}

function text2html(t) {
    if (t && t.length > 0){
        var encoded = linkifyHtml(he.encode(t, {useNamedReferences: true}));
        return (parafy(encoded));
    } else {
        return t;
    }
}

fixCVEComments(['cves']);