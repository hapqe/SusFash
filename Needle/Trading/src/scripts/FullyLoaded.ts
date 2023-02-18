import { Behaviour } from "@needle-tools/engine";

export class FullyLoaded extends Behaviour {
    frameCount = 0;
    onAfterRender() {
        this.frameCount++;
        if(this.frameCount == 5){
            window.dispatchEvent(new Event('fullyLoaded'));
            window.parent?.postMessage({sceneLoaded: true}, "*");
        }
    }
}