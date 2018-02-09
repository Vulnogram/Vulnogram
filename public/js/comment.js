// Copyright (c) 2018 Chandan B N. All rights reserved.

async function sendComment(f) {
    var comment = {
        id: f.id.value,
        text: f.text.value
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

    }
    if (response.ok) {
        try {
            var json = await response.json();
            if (json.ok) {
                getComments(f.id.value);
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

function setCommentButton(t, b) {

    if (t.value.length == 0) {
        b.disabled = true;
    } else {
        b.disabled = false;
    }
}

async function getComments(id) {
    var json = await getSubDocs('comment', id);
    comments.innerHTML = pugRender({
        renderTemplate: 'comments',
        docs: json,
        id: id,
        username: userUsername
    });

    if (json && json.length > 0) {
        var cts = comments.getElementsByClassName('commentText');
        for (var i = 0; i < cts.length; i++) {
            //CONFIG: add other patterns here. Should be configurable.
            cts[i].innerHTML = cts[i].innerHTML.replace(/\b(CVE-[0-9]{4}-[0-9]{4,8})\b/g, '<a href="https://nvd.nist.gov/vuln/detail/$1">$1</a>');
            linkifyElement(cts[i], {}, document);
        }
    }
}

async function getChanges(id) {
    var json = await getSubDocs('log', id);
    changelog.innerHTML = pugRender({
        renderTemplate: 'changes',
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
        console.log('Error loading comments');
    }
}

function editPost(c) {
    var text = c.nextSibling; // the pre tag following dt tag
    var slug = text.nextSibling;
    var date = slug.nextSibling;
    var nc = document.getElementById("newComment").cloneNode(true); // new comment
    nc.removeAttribute('id');
    nf = nc.firstChild; // new form
    nf.text.value = text.textContent;
    nf.appendChild(slug);
    nf.appendChild(date);
    nf.button.textContent = "Update";
    var page = c.parentNode;
    page.parentNode.replaceChild(nc, page);

}