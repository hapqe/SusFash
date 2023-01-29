window.addEventListener('message', (e) => {
    const k = Object.keys(e.data)[0];
    playSound(k);
    
    if(e.data.woosh) {
        woosh();
    }

    if(e.data.blink) {
        blink();
    }

    if(e.data.clouds) {
        clouds();
    }

    if(e.data.transition) {
        transition();
    }
});

let playing = new Map();

function playSound(k) {
    console.log(k);
    
    audio[k]?.play();

    // if k starts with start, play audio
    if (k.startsWith('start')) {
        audio[k.slice(5).toLocaleLowerCase()]?.play();
    }
    // if k starts with stop, pause audio
    if (k.startsWith('stop')) {
        audio[k.slice(4).toLocaleLowerCase()]?.pause();
        audio[k.slice(4).toLocaleLowerCase() + 'Copy']?.pause();
    }
    // if k starts with loop, loop audio
    if (k.startsWith('fade')) {
        const s = k.slice(4).toLocaleLowerCase();
        audio[s]?.play();
        
        setTimeout(() => {
            audio[s + 'Copy'].play();
        }, audio[s].duration * 500);
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
    conveyor: new Audio('./sounds/conveyor.mp3'),
    haunted: new Audio('./sounds/haunted.mp3'),
    spring: new Audio('./sounds/spring.mp3'),
    score: new Audio('./sounds/score.mp3'),
    snap: new Audio('./sounds/snap.mp3'),
    mine: new Audio('./sounds/mine.mp3'),
    wind: new Audio('./sounds/wind.mp3'),
    complete: new Audio('./sounds/complete.mp3'),
    bubble: new Audio('./sounds/bubble.mp3'),
    tornado: new Audio('./sounds/tornado.mp3'),
    piano: new Audio('./sounds/piano.mp3'),
}
audio.spray.loop = true;
audio.music.loop = true;
audio.space.loop = true;
audio.typing.loop = true;
audio.shopping.loop = true;
audio.conveyor.loop = true;
audio.haunted.loop = true;
audio.mine.loop = true;
audio.wind.loop = true;
audio.piano.loop = true;

for (const key in audio) {
    audio[key + 'Copy'] = audio[key].cloneNode();
}

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

function transition() {
    audio.complete.play();
    
    let s = document.getElementById('star')
    s.style.animation = 'star 1s';
}

function hideTransition() {
    let s = document.getElementById('star')
    s.style.animation = 'none';
}

async function clouds() {
    playSound('tornado')
    let c = document.getElementById('clouds');
    c.classList.add('show');
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
}

function hideClouds() {
    let c = document.getElementById('clouds');
    c.classList.remove('show');
}

setTimeout(() => {
    clouds()
}, 2et0000);