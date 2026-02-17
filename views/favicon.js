(function () {
if (!iconClass || !document || !document.head) return;
var vgiClass = '';
var parts = iconClass.split(/\s+/);
for (var i = 0; i < parts.length; i++) {
    if (parts[i].indexOf('vgi-') === 0) {
    vgiClass = parts[i];
    break;
    }
}
if (!vgiClass) return;
function setFaviconFromVgi() {
    if (!document.body) return;
    var probe = document.createElement('span');
    probe.className = vgiClass;
    probe.style.position = 'absolute';
    probe.style.width = '0';
    probe.style.height = '0';
    probe.style.overflow = 'hidden';
    probe.style.visibility = 'hidden';
    document.body.appendChild(probe);
    var bg = '';
    try {
    bg = window.getComputedStyle(probe, '::before').getPropertyValue('background-image');
    } catch (e) {}
    probe.parentNode.removeChild(probe);
    if (!bg || bg === 'none') return;
    var match = bg.match(/url\(["']?(.*?)["']?\)/);
    console.log(bg, 'URL pattern=', match);
    if (!match || !match[1]) return;

    var href = match[1];
    var link = document.getElementById('favicon');
    if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    document.head.appendChild(link);
    }
    console.log('setting '+href);
    link.setAttribute('href', href);
    if (href.indexOf('image/svg+xml') !== -1) {
    link.setAttribute('type', 'image/svg+xml');
    link.setAttribute('sizes', 'any');
    }
}
if (document.readyState === 'complete') setFaviconFromVgi();
else window.addEventListener('load', setFaviconFromVgi);
})();