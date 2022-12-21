let frame = document.querySelector('iframe');

window.addEventListener('message', (e) => {
    if(e.data.secret) {
        showSecret(e.data.secret)
        post({
            [e.data.secret]: true
        });
    }
    if(e.data.fetch) {
        userData();
    }
});

window.post = function (data, url = "/") {
    return fetch(url, { method: "post", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

const userData = async () => {
    let data = await fetch('/userData', { method: "get", headers: { 'Content-Type': 'application/json' } });
    data = await data.json()
    frame.contentWindow.postMessage(data, '*');
};

function deleteUser() {
    post({ delete: true });
}