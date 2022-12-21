window.addEventListener('message', (e) => {
    if(e.data.woosh) {
        woosh();
    }
});

function woosh() {
    let woosh = document.getElementById('woosh');
    let translation = woosh.style.transform;
    if(translation == 'translateX(-100%)') {
        woosh.style.transform = 'translateX(100%)';
    }
    else {
        woosh.style.transform = 'translateX(-100%)';
    }
}