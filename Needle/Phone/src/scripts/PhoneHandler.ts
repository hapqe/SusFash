import { Animator, Behaviour, serializable } from '@needle-tools/engine';

export class PhoneHandler extends Behaviour {
    @serializable(Animator)
    phoneAnimator?: Animator;
    
    clicked = false;
    clickedPower = false;

    start(): void {
        window.addEventListener('fullyLoaded', () => {
            window.parent.postMessage({blink: true}, "*");
        })
        
        window.addEventListener('message', (e: any) => {
            if(e.data.beforeShopping != undefined) {
                const beforeShopping = e.data.beforeShopping;

                window.addEventListener('objectClick', (e: any) => {
                    if(!this.clicked && e.detail.name.toLowerCase() == "phone") {
                        window.parent?.postMessage({done: true}, "*");

                        if(beforeShopping) {
                            window.parent?.postMessage({loopstress: true}, "*");
                        }
                        
                        this.clicked = true;
                        this.phoneAnimator?.SetTrigger('start');
                        setTimeout(() => {
                            for (let i = 0; i < 8; i++) {
                                setTimeout(() => {
                                    window.parent?.postMessage({playbing: true}, "*");
                                }, i * 300);
                            }
                        }, 300);
        
                        setTimeout(() => {
                            if(beforeShopping) {
                                window.parent?.postMessage({shoppingScene: true}, "*");
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
        
                        window.parent?.postMessage({playradar: true}, "*");
        
                        setTimeout(() => {
                            window.parent?.postMessage({tradingScene: true}, "*");
                        }, 2000);
                    }
                })
            }
        })
    }
}