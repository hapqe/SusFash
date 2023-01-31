import { Behaviour } from '@needle-tools/engine';

export class Step extends Behaviour {
    public step() {
        window.parent.postMessage({playstep: true}, '*');
    }
}