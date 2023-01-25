import { Behaviour, GameObject, serializable } from '@needle-tools/engine';

export class Ship extends Behaviour {
    @serializable(GameObject)
    g?: GameObject;
    
    speed = 1;
    
    update(): void {
        this.gameObject.translateZ(this.speed * this.context.time.deltaTime);
    }
}