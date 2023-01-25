import { AudioListener, AudioSource, Behaviour, findObjectOfType } from '@needle-tools/engine';

export class Mute extends Behaviour {
    isMute = true;
    listener?: AudioListener;

    awake() {
        this.listener = findObjectOfType(AudioListener, this.context, true);
        this.listener?.listener.setMasterVolume(1);
        
        AudioSource.registerWaitForAllowAudio(() => {
            // play test audio
            const audio = this.context.mainCameraComponent?.gameObject.getComponent(AudioSource)
        });

        window.addEventListener('mute', () => {
            this.isMute = !this.isMute;
            console.log(this.isMute);
            // this.listener?.listener.setMasterVolume(this.isMute ? 0 : 1);
        });

    }

    update(): void {
        this.listener = findObjectOfType(AudioListener, this.context, true);

        this.listener?.listener.setMasterVolume(1);
    }
}