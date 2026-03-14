const sanitizeHtml = require('sanitize-html');

const allowedInlineImagePattern = /^data:image\/(?:gif|png|jpeg)(?:;[^,]*)?,/i;

const richHtmlSanitizeOptions = {
    allowedTags: [
        'b', 'strong', 'i', 'em', 'u',
        'p', 'div', 'br', 'span', 'dd',
        'h1', 'h2', 'h3', 'blockquote',
        'ul', 'ol', 'li',
        'a', 'img',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
        'code', 'pre'
    ],
    allowedAttributes: {
        'a': ['href', 'target', 'title', 'rel'],
        'img': ['src', 'alt', 'width', 'height'],
        'td': ['colspan', 'rowspan'],
        'th': ['colspan', 'rowspan']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
        'img': ['http', 'https', 'data']
    },
    transformTags: {
        'img': function (tagName, attribs) {
            if (attribs.src && attribs.src.trim().toLowerCase().startsWith('data:') &&
                !allowedInlineImagePattern.test(attribs.src.trim())) {
                delete attribs.src;
            }
            return {
                tagName: tagName,
                attribs: attribs
            };
        }
    },
    exclusiveFilter: function (frame) {
        return frame.tag === 'img' && !frame.attribs.src;
    },
    allowProtocolRelative: false
};

function sanitizeRichHtml(dirty) {
    return sanitizeHtml(dirty || '', richHtmlSanitizeOptions);
}

module.exports = {
    sanitizeRichHtml,
    richHtmlSanitizeOptions
};
