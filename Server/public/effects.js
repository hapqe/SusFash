window.addEventListener('message', (e) => {
    if(e.data.woosh) {
        woosh();
    }
    const k = Object.keys(e.data)[0];
    playSound(k);
    if(e.data.blink) {
        blink();
    }
});

function playSound(k) {
    audio[k]?.play();

    // if k starts with start, play audio
    if (k.startsWith('start')) {
        audio[k.slice(5).toLocaleLowerCase()]?.play();
    }
    // if k starts with stop, pause audio
    if (k.startsWith('stop')) {
        audio[k.slice(4).toLocaleLowerCase()]?.pause();
    }
}

function test() {
    frame.contentWindow.postMessage({test: true}, '*');
}

function blink() {
    // play animation
    document.querySelector('#blink').classList.add('blink');
}

const audio = {
    w: new Audio('./sounds/woosh.mp3'),
    click: new Audio('./sounds/click.mp3'),
    spray: new Audio('./sounds/spray.mp3'),
    splash: new Audio('./sounds/splash.mp3'),
    cut: new Audio('./sounds/cut.mp3'),
    music: new Audio('./sounds/music.mp3'),
    space: new Audio('./sounds/space.mp3'),
    collect: new Audio('./sounds/collect.mp3'),
    typing: new Audio('./sounds/typing.mp3'),
    bing: new Audio('./sounds/bing.mp3'),
    radar: new Audio('./sounds/radar.mp3'),
    shopping: new Audio('./sounds/shopping.mp3'),
    coin: new Audio('./sounds/coin.mp3'),
    magic: new Audio('./sounds/magic.mp3'),
}
audio.spray.loop = true;
audio.music.loop = true;
audio.space.loop = true;
audio.typing.loop = true;
audio.shopping.loop = true;

function woosh() {
    let woosh = document.getElementById('woosh');
    let translation = woosh.style.transform;
    if(translation == 'translateX(-100%)') {
        woosh.style.transform = 'translateX(100%)';
    }
    else {
        woosh.style.transform = 'translateX(-100%)';
    }

    audio.w.play();
}