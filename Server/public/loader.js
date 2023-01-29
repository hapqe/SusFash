window.addEventListener('message', async (e) => {
    const k = Object.keys(e.data)[0].toLowerCase();

    if (k.endsWith('scene')) {
        const scene = k.slice(0, -5);

        if (scene === 'cotton') {
            playSound('stopspace');
            
            if(!playerRunning) {
                await wait(2000);
                playSound('piano');
                await clouds();
                await Promise.all([
                    showParagraphs('./text/earth_cotton.txt', { color: 'black' }),
                    setScene('https://192.168.8.105:3000/')
                ]);
                hideClouds();
            }
            else {
                playSound('piano');
                setScene('https://192.168.8.105:3000/')
            }
        }

        if(scene === 'design') {
            playSound('stopwind');

            if(!playerRunning) {
                
        }
    }
});

async function showParagraphs(file, props = {}) {
    const res = await fetch(file);
    let text = await res.text();

    text = text.replace('\n\n', '\n');
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        await showText(lines[i], props);
    }
}

async function setScene(scene) {
    const frame = document.querySelector('iframe');
    frame.src = scene;
    
    return new Promise((resolve) => {
        window.addEventListener('message', (e) => {
            if (e.data.sceneLoaded) {
                resolve();
            }
        });
    });
}

async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}