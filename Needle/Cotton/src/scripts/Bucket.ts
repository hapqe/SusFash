import { Animator, Behaviour, Rigidbody } from '@needle-tools/engine';
import { ICollider } from '@needle-tools/engine/engine/engine_types';
import { CottonPiece } from './Piece';

export class Bucket extends Behaviour {
    count = 0;
    animator?: Animator;
    
    awake() {
        this.animator = this.gameObject.getComponent(Animator)!;
    }
    
    onTriggerEnter(col: ICollider) {
        let piece = col.gameObject.getComponent(CottonPiece);
        piece?.disable();
        this.count++;
        console.log("this.count: " + this.count);
        
        this.animator?.SetTrigger('effect');
        
    }
}