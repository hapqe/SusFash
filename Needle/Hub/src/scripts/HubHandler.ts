import { Behaviour } from '@needle-tools/engine';

export class HubHandler extends Behaviour {
    awake(): void {
        window.addEventListener('objectClick', (e: any) => {
            if (e.detail.name == "Design") {
                window.parent.postMessage({
                    showPanel: 'designs',
                    title: 'Deine Designs',
                    left: 'scissors',
                    right: 'shirt',
                    padding: '2em',
                }, '*');
            }
            if (e.detail.name == "Replay") {
                window.parent.postMessage({
                    showPanel: 'replay',
                    title: 'Replay',
                    icon: 'post',
                }, '*');
            }
            if (e.detail.name == "Trophy") {
                window.parent.postMessage({
                    showPanel: 'rankings',
                    title: 'Rangliste',
                    icon: 'trophy',
                }, '*');
            }
        });
    }
}