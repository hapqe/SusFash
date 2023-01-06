window.addEventListener('message', (e) => {
    if(e.data.woosh) {
        woosh();
    }
    const k = Object.keys(e.data)[0];
    audio[k]?.play();

    // if k starts with start, play audio
    if(k.startsWith('start')) {
        audio[k.slice(5).toLocaleLowerCase()]?.play();
    }
    // if k starts with stop, pause audio
    if(k.startsWith('stop')) {
        audio[k.slice(4).toLocaleLowerCase()]?.pause();
    }
});

function test() {
    woosh();
}

const audio = {
    w: new Audio('./sounds/woosh.mp3'),
    click: new Audio('./sounds/click.mp3'),
    spray: new Audio('./sounds/spray.mp3'),
    splash: new Audio('./sounds/splash.mp3'),
    cut: new Audio('./sounds/cut.mp3'),
    music: new Audio('./sounds/music.mp3'),
}
audio.spray.loop = true;

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