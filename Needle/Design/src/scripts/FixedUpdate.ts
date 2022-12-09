import { Behaviour } from "@needle-tools/engine";

export class FixedUpdate extends Behaviour {
    private lastTime = 0;
    private deltaTime = 0;

    update() {
        const time = performance.now();
        const delta = time - this.lastTime;
        this.deltaTime += delta;
        this.lastTime = time;
        if(this.deltaTime > 1000) {
            this.deltaTime = 0;
        }
        while(this.deltaTime > 16) {
            this.deltaTime -= 16;
            this.fixedUpdate();
        }
    }

    fixedUpdate() {
        window.dispatchEvent(new CustomEvent("fixedUpdate"));
    }

    static delta = 16 / 1000;
}
