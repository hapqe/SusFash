import { AudioListener, Behaviour, findObjectOfType } from '@needle-tools/engine';

export class Mute extends Behaviour {
    isMute = true;
    listener?: AudioListener;
    awake() {
        this.listener = findObjectOfType(AudioListener, this.context, true);
        // this.listener?.listener.setMasterVolume(0);
        
        window.addEventListener('mute', () => {
            this.isMute = !this.isMute;
            // this.listener?.listener.setMasterVolume(this.isMute ? 0 : 1);
        });
    }
}