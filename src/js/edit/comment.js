// Copyright (c) 2018 Chandan B N. All rights reserved.

async function sendComment(f) {
    var html = '';
    if (f.simpleHtml) {
        html = f.simpleHtml.getValue();
    } else if (f.commentarea) {
        html = f.commentarea.innerHTML;
    }
    var comment = {
        id: f.id.value,
        text: html
    };
    if (f.slug && f.slug.value) {
        comment.slug = f.slug.value;
    }
    if (f.date && f.date.value) {
        comment.date = f.date.value;
    }
    try {
        var response = await fetch('comment/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: JSON.stringify(comment),
        });
    } catch (e) {
        //console.log('fetch failed ' + e)
    }
    if (response.ok) {
        try {
            var json = await response.json();
            if (json.ok) {
                if (!f.slug && f.simpleHtml) {
                    f.simpleHtml.setValue('');
                    updateCommentButton(f);
                }
                setComments(f.id.value, json.ret);
            } else {
                alert('Error adding comment: ' + json.msg);
            }
        } catch (e) {
            alert('Error adding comment. Please reload the page and try again' + e + JSON.stringify(response));
        }
    } else {
        alert('Failed to add comment. Please reload the page and try again');
    }
}

async function setComments(id, cs) {
    //var json = await getSubDocs('comment', id);
    document.getElementById('comments').innerHTML = subdocRender({
        ctemplate: 'comments',
        docs: cs,
        id: id,
        username: userUsername
    });
}

async function getFiles() {
    var json = await getSubDocs('files', getDocID());
    document.getElementById('fileList').innerHTML = subdocRender({
        ctemplate: 'fileList',
        files: json,
        doc_id: getDocID()
    });
}
function fileDelete(m) {
    var fileLink = m.parentNode.parentNode.firstChild.firstChild;
    var url = fileLink.getAttribute('href');
    itemDelete(url, fileLink.textContent, getFiles);
}
function itemDelete(url, id, cb) {
    if (confirm('Delete this ' + id + '?')) {
        fetch(url, {
            method: 'DELETE',
            credentials: 'include',
            redirect: 'error',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'CSRF-Token': csrfToken
            },
        }).then(function (response) {
            if (response.status == 200) {
                infoMsg.textContent = "Deleted ";
                errMsg.textContent = "";
            } else {
                errMsg.textContent = "Error " + response.statusText;
                infoMsg.textContent = "";
            }
            cb();
        }).catch(function (error) {
            alert('Error Deleting file! Try reloading page!');
        });
    }
}

async function getChanges(id) {
    var json = await getSubDocs('log', id);
    changelog.innerHTML = subdocRender({
        ctemplate: 'changes',
        docs: json
    });
}

async function getSubDocs(docType, id) {
    try {
        var response = await fetch(docType + '/' + id, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        });
        if (response.ok) {
            var json = await response.json();
            return json;
        }
    } catch (e) {
        //console.log('Error loading comments');
    }
}

function hasSimpleHtmlContent(editor) {
    if (!editor || !editor.contentArea) return false;
    var text = (editor.contentArea.textContent || '').replace(/\u00a0/g, ' ').trim();
    if (text) return true;
    return !!editor.contentArea.querySelector('img,table,blockquote,code,pre,ul,ol,li');
}

function updateCommentButton(form) {
    if (!form || !form.simpleHtml || !form.button) return;
    form.button.disabled = !hasSimpleHtmlContent(form.simpleHtml);
}

function editPost(slugValue) {
    let post = document.getElementById(slugValue);
    let text = post.querySelector("div");
    let slug = post.querySelector("input[name='slug']");
    let date = post.querySelector("input[name='date']");

    var nf = newCommentBox(text);
    nf.appendChild(slug);
    nf.appendChild(date);
    nf.button.textContent = "Update";
    post.parentNode.replaceChild(nf, post);

}

function newCommentBox(div) {
    var nc = document.getElementById("commentTemplate").cloneNode(true); // new comment
    var nf = nc.firstElementChild;
    nf.commentarea = nc.getElementsByClassName('simplehtml-editor')[0];
    var initialHtml = '';
    if (div) {
        initialHtml = div.innerHTML;
        div.className = nf.commentarea.className;
        div.innerHTML = '';
        nf.replaceChild(div, nf.commentarea);
        nf.commentarea = div;
    }
    document.getElementById("commentTemplate").insertAdjacentElement('afterend', nf)
    nf.simpleHtml = new SimpleHtml(nf.commentarea, {
        content: initialHtml,
        placeholder: 'Add a comment...'
    });
    updateCommentButton(nf);
    nf.simpleHtml.contentArea.addEventListener('input', function () {
        updateCommentButton(nf);
    });
    nf.simpleHtml.sourceArea.addEventListener('input', function () {
        updateCommentButton(nf);
    });
    nf.simpleHtml.contentArea.addEventListener('blur', function () {
        updateCommentButton(nf);
    });
    nf.simpleHtml.sourceArea.addEventListener('blur', function () {
        updateCommentButton(nf);
    });
    return nf;
}

function preview(el, ev) {
    var files = [];
    for (var i = 0; i < el.files.length; i++) {
        files.push({
            'Selected File': el.files[i].name,
            size: el.files[i].size
        });
    }
    el.parentNode.lastChild.innerHTML = subdocRender({
        ctemplate: 'filePreview',
        docs: files,
        columns: ['Selected File', 'size']
    });
    el.nextSibling.nextSibling.className = "btn icn indent save sfe"
}

function attach(el, event) {
    event.preventDefault();
    var pgb = el.nextElementSibling;
    pgb.className = 'lbl';
    var file = el.form.file1;
    //console.log('Have'+JSON.stringify(file.files));
    if (file.files.length > 0) {
        el.setAttribute("disabled", "disabled");
        upload(self.path, el.form.file1.files, el.form.comment.value, {
            success: function (url) {
                //pgb.className = 'hid';
                //console.log('refresh file list');
                getFiles();
                el.removeAttribute("disabled");
                el.form.reset();
                el.form.lastChild.innerHTML = "";
            },
            failure: function (error) {
                pgb.className = 'hid';
                el.removeAttribute("disabled");
            },
            updateProgress: function (progress) {
                if (pgb) {
                    if (progress == 100) {
                        pgb.className = 'hid';
                    } else if (progress)
                        pgb.setAttribute('value', progress);
                    else
                        pgb.removeAttribute('value');
                }
            }
        });
    }
    return false;
};

function upload(type, files, comment, cbs) {

    var reader = new FileReader();
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    fd.append('comment', comment);
    for (var i = 0; i < files.length; i++) {
        fd.append('file1', files[i]);
    }
    this.xhr = xhr;
    var self = this;
    this.xhr.upload.addEventListener("loadstart", function (e) {
        cbs.updateProgress(0); //
    }, false);

    this.xhr.upload.addEventListener("progress", function (e) {
        if (e.lengthComputable) {
            var percentage = Math.round((e.loaded * 100) / e.total);
            cbs.updateProgress(percentage)
            //self.ctrl.update(percentage);
        }
    }, false);

    xhr.upload.addEventListener("load", function (e) {
        //self.ctrl.update(100);
        cbs.updateProgress(100);
        //var canvas = self.ctrl.ctx.canvas;
        //canvas.parentNode.removeChild(canvas);
    }, false);
    var uf = function (e) {
        cbs.failure('Upload failed:');
    };
    xhr.addEventListener("error", uf, false);
    xhr.addEventListener("abort", uf, false);

    xhr.upload.addEventListener("error", uf, false);
    xhr.upload.addEventListener("abort", uf, false);

    xhr.onreadystatechange = function (oEvent) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (xhr.response == '{"ok":"1"}') {
                    //console.log(xhr.responseText);
                    cbs.success();
                } else {
                    cbs.failure('Upload failed: ' + xhr.statusText);
                }
            } else if (xhr.status === 404) {
                cbs.failure('Upload failed: ID Not found. Try saving document first!');
            }
        }
    };

    xhr.open("POST", window.location.pathname + '/file');
    xhr.setRequestHeader('X-CSRF-Token', csrfToken)
    xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
    xhr.send(fd);
}
