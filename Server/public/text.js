const text = document.querySelector('#text');

function showText(str, duration = 8000, position = 'top') {
    let html = '';
    // for every word append a span with a space
    let count = 0;
    str.split(' ').forEach((word, i) => {
        html += `<div>${word}</div>&nbsp`;
        count++;
    });
    text.innerHTML = html;
    setTimeout(() => {
        text.setAttribute('data-blur', false);
    }, 1000);
    setTimeout(() => {
        text.setAttribute('data-blur', true);
    }, duration);

    let height = text.parentElement.clientHeight - text.clientHeight * 2;
    
    // position using transform on y axis
    switch(position) {
        case 'top':
            text.style.transform = 'translateY(0)';
            break;
        case 'bottom':
            text.style.transform = 'translateY('+ (height - 30) + 'px)';
            break;
        default:
            text.style.transform = 'translateY('+ height / 2 + 'px)';
            break;
    }

    setTimeout(() => {
        playSound('starttyping');
    }, 1000);
    
    
    const typingDuration = count * 100 + 1500;

    setTimeout(() => {
        playSound('stoptyping');
    }, typingDuration);
}

window.addEventListener('resize', () => {
    console.log("JUST TESTING; REMOVE THIS LATER");
    showText('Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quaerat laudantium laborum maxime ipsum itaque, labore, eius rerum fugit, sint eos tenetur distinctio ut et soluta perspiciatis. Harum excepturi maxime distinctio!');
});