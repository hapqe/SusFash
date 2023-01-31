import { Behaviour, GameObject, serializable } from '@needle-tools/engine';

export class Ship extends Behaviour {
    
    update(): void {
        const speed = .4;
        this.gameObject.translateX(speed * this.context.time.deltaTime);
    }
}