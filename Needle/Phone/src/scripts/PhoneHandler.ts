import { Animator, Behaviour, serializable } from '@needle-tools/engine';

export class PhoneHandler extends Behaviour {
    @serializable(Animator)
    phoneAnimator?: Animator;
    
    clicked = false;
    clickedPower = false;

    start(): void {
        let beforeShopping = false;
        
        window.addEventListener('objectClick', (e: any) => {
            if(!this.clicked && e.detail.name.toLowerCase() == "phone") {
                this.clicked = true;
                this.phoneAnimator?.SetTrigger('start');
                setTimeout(() => {
                    for (let i = 0; i < 8; i++) {
                        setTimeout(() => {
                            window.parent?.postMessage({bing: true}, "*");
                        }, i * 300);
                    }
                }, 300);

                setTimeout(() => {
                    if(beforeShopping) {
                        console.log("SHOULD NOW LOAD SHOPPING");
                    }
                }, 8000);
                
                setTimeout(() => {
                    if(!beforeShopping) {
                        this.phoneAnimator?.SetTrigger('button');
                    }
                }, 4000);
            }

            if(!beforeShopping && this.clicked && !this.clickedPower && e.detail.name.toLowerCase() == "power") {
                this.clickedPower = true;
                this.phoneAnimator?.SetTrigger('off');

                window.parent?.postMessage({radar: true}, "*");

                setTimeout(() => {
                    console.log("SHOULD NOW LOAD TRADING");
                }, 2000);
            }
        })

        window.addEventListener('fullyLoaded', () => {
            window.parent.postMessage({blink: true}, "*");
        })
    }
}