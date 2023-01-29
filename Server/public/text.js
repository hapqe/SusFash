const text = document.querySelector('#text');

function showText(str, props = {}) {
    const duration = props.duration ?? 2500;
    const after = props.after ?? 500;
    const color = props.color ?? 'white';
    const position = props.position ??
        ['top', 'bottom', 'center'][Math.floor(Math.random() * 3)];

    let html = '';
    // for every word append a span with a space
    let count = 0;
    str.split(' ').forEach((word, i) => {
        html += `<div style="color: ${color}">${word}</div>&nbsp`;
        count++;
    });
    text.innerHTML = html;

    let d = count * 100 + duration;
    requestAnimationFrame(() => {
        text.setAttribute('data-blur', false);
    });

    setTimeout(() => {
        text.setAttribute('data-blur', true);
    }, d);

    let height = text.parentElement.clientHeight - text.clientHeight * 2;

    let a = 'center';
    switch (position) {
        case 'top':
        a = "start";
        break;
        case 'bottom':
        a = "end";
        break;
    }
    text.parentElement.style.alignItems = a;
        
    playSound('starttyping');

    const typingDuration = count * 100 + 500;

    setTimeout(() => {
        playSound('stoptyping');
    }, typingDuration);

    setTimeout(() => {
        playSound('bubble');
    }, typingDuration + duration - 500);

    return new Promise((resolve) => setTimeout(resolve, 2 * (count * 100) + duration + after));
}