let frame = document.querySelector('iframe');

let design;

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
    if(e.data.design) {
        (async () => {
            const content = await fetch('/lib/publish.html')
            const text = await content.text();
            
            const info = setInfoPage({
                hideTitle: true,
                content: text,
            });
            info.querySelector('#show').src = e.data.design;
            design = e.data.design;
            showInfoPage();
        })();
        
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

function setScreenSize() {
    let s = document.querySelector(':root').style;
    s.setProperty('--screen-width', window.innerWidth + 'px');
    s.setProperty('--screen-height', window.innerHeight + 'px');
}

setScreenSize();

window.addEventListener('resize', setScreenSize);

function setInfoPage(params) {
    let content = document.getElementById('info-page-content');
    if(params.title) {
        document.getElementById('info-page-title-text').innerText = params.title;
    }
    if(params.hideTitle) {
        document.getElementById('info-page-title').style.display = 'none';
    }
    else {
        document.getElementById('info-page-title').style.display = 'block';
    }
    if(params.content) {
        content.innerHTML = params.content;
    }
    if(params.icon) {
        document.getElementById('info-page-icon-left').src = 'svgs/' + params.icon + '.svg';
        document.getElementById('info-page-icon-right').src = 'svgs/' + params.icon + '.svg';
    }
    if(params.left) {
        document.getElementById('info-page-icon-left').src = 'svgs/' + params.icon + '.svg';
    }
    if(params.right) {  
        document.getElementById('info-page-icon-right').src = 'svgs/' + params.icon + '.svg';
    }
    return content;
}

function showInfoPage() {
    document.getElementById('info-page').style.display = 'block';
    document.getElementById('info-page').style.opacity = '1';
}

function hideInfoPage() {
    document.getElementById('info-page').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('info-page').style.display = 'none';
    }, 500);
}