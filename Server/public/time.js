let playerRunning = false;
const wrapper = document.querySelector('#time-wrapper');
wrapper.style.display = playerRunning ? 'flex' : 'none';

let active = false;

const element = document.querySelector('#time');

let last = Date.now();
let time = 0;

window.addEventListener('message', async (e) => {
    if(e.data.sceneLoaded) active = true;
    if(e.data.done) active = false;
});

function update() {
    const zeroPad = (num, places) => String(num).padStart(places, '0')
    
    const seconds = Math.floor(time / 1000);
    const minutes = Math.floor(seconds / 60);
    const millis = time % 1000;

    const s = zeroPad(seconds, 2);
    const m = zeroPad(minutes, 2);
    const ms = zeroPad(millis, 3);
    
    element.innerHTML = `${m}:${s}:${ms}`;

    const now = Date.now();
    const diff = now - last;

    if(active)
    time += diff;

    last = now;
    requestAnimationFrame(update);
}
requestAnimationFrame(update);