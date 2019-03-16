//var logo = '';

function addSlide(ppt, n, title, btext) {
    var slide = ppt.addNewSlide('advisory');
     // heading
    slide.addText(title, {
        x: .5,
        y: 0,
        w: 9,
        h: 0.8,
        fontSize: 20,
        valign: 'bottom',
        color: '324257',
        fontFace: 'Arial'
    });

    slide.addText(btext, {
        x: 0.5,
        y: 1,
        w: 9,
        h: 4.25,
        valign:'top',
        fontFace:'Arial',
        fontSize: 16
    });
}


function newPPT() {
var pptx = new PptxGenJS();

    pptx.defineSlideMaster({
    title: 'advisory',
    bkgd: 'FFFFFF',
    margin:  [ 0.5, 0.25, 1.0, 0.25 ],
    objects: [
       // { 'image': { x:.45, y:5.18, w:1.13, h:.38, data: logo} },
        { 'line':  { x: .45, y:.9, w:9, line:'324257', lineSize:.5 } },
        { 'text':
            {
                options: {x:2, y:5.18, w:5.5, h:0.38, align:'c', valign:'m', color:'ee2222', fontFace:'Arial',fontSize:9},
                text: 'CONFIDENTIAL - INTERNAL USE ONLY'
            }
        }
    ],
    slideNumber: {  x: 0.00, y:5.17, w:.37, h:.31, color:'324257', fontFace:'Arial', fontSize:10 }
    });
    pptx.addSlidesForTable('indexTable', {
        master:'advisory',
        w: 9,
        h: "90%",
        fontFace:'Arial',
        fontSize: 16});
    
    var slides = document.querySelectorAll('.page');
    for(i=0; i< slides.length; i++) {
        var title = slides[i].querySelector('.slideTitle').innerText;
        var bullets = slides[i].querySelectorAll('.bullets > li');
        var btext = [];
        for(j=0; j< bullets.length; j++) {
            var term = bullets[j].querySelector('.term').innerText;
            var text = bullets[j].querySelector('.text').innerText;
            btext.push({
                text: term,
                options: {
                    bullet: false,
                    bold: true,
                    indentLevel: 0
                }
            });
            if(term in ['Problem:', 'Solution:', 'Problem: ', 'Solution: ']) {
            btext.push({
                text: text
            , options: {bullet: false, indentLevel:1, fontSize:14}});
            /*btext.push(
             { text:l[2], options: {bullet: false, indentLevel:1, fontSize:14}}
            );*/
                
            } else {
            btext.push({
                text: text
            });
            }
        }
        addSlide(pptx, i, title, btext);
    }
    pptx.save('Advisory-Slides');
}

