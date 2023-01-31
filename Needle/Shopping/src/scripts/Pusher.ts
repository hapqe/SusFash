import { Behaviour } from '@needle-tools/engine';
import { ICollider } from '@needle-tools/engine/engine/engine_types';
import { PlayerController } from './PlayerController';

export class Pusher extends Behaviour {
    onTriggerEnter(col: ICollider) {
        if(col.gameObject.name == "Player") {
            window.parent.postMessage({loopconveyor: true}, "*");
            col.gameObject.getComponent(PlayerController)!.boosted = true;
        }
    }
    
    onTriggerExit(col: ICollider) {
        if(col.gameObject.name == "Player") {
            window.parent.postMessage({stopconveyor: true}, "*");
            col.gameObject.getComponent(PlayerController)!.boosted = false;
        }
    }
}