import { Behaviour, Collision, findObjectOfType, ParticleSystem, Rigidbody } from '@needle-tools/engine';
import { ICollider } from '@needle-tools/engine/engine/engine_types';

export class Package extends Behaviour {
    private rigidBody?: Rigidbody;
    
    awake(): void {
        this.rigidBody = this.gameObject.getComponent(Rigidbody)!;
    }

    
    onTriggerStay(col: ICollider) {
        const speed = -40;
        
        if (col.gameObject.name === 'ConveyorBelt') {
            if(!this.rigidBody?.isKinematic) {
                const p = this.rigidBody?.getVelocity();
                
                this.rigidBody?.setVelocity(speed * this.context.time.deltaTime, p?.x, p?.y);
            }
        }

    }
    
    onTriggerEnter(col: ICollider) {
        if (col.gameObject.name === 'Truck') {
            findObjectOfType(ParticleSystem, this.context, false)!.play();
            this.destroy();
            window.parent?.postMessage({magic: true}, "*");
        }
    }
}