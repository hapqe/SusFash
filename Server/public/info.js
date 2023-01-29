let isInfoOpen = false;
const infoElement = document.getElementById('info');

function showAchievement(name, duration = 5000) {
    showInfo(`Errungenschaft "<r>${name}</r>" freigeschaltet!`, duration);
}

function showSecret(name, duration = 5000) {
    showInfo(`Geheimnis "<r>${name}</r>" gefunden!`, duration);
}

function showInfo(info, duration = 5000) {

    isInfoOpen = true;
    infoElement.querySelector('h5 t').innerHTML = info;
    infoElement.classList.remove("up");
    setTimeout(() => {
        infoElement.classList.add("up");
        isInfoOpen = false;
    }, duration);
}

window.addEventListener('fullyLoaded', () => {
    showInfo("Tippe auf Objekte in der Szene!", 10000);
})

function hideInfo() {
    document.getElementById('info').classList.add("up");
}