import { AudioSource, Behaviour } from '@needle-tools/engine';

export class PlaySoundOnAwake extends Behaviour {
    audio: string = "";
    fade: boolean = false;
    
    awake(): void {
        if(this.audio == "") return;

        AudioSource.registerWaitForAllowAudio(() => {
            const o = {};
            o[(this.fade ? 'fade' : '') + this.audio] = true;
            window.parent?.postMessage(o, "*");
        })
    }
}