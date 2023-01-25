import { Behaviour, GameObject, getComponent, Rigidbody, serializable } from '@needle-tools/engine';
import { Transform } from '@needle-tools/engine/engine-schemes/transform';
import { Physics } from '@needle-tools/engine/engine/engine_physics';
import { CollisionDetectionMode } from '@needle-tools/engine/engine/engine_physics.types';
import { Vector2, Vector3 } from 'three';

export class PlayerController extends Behaviour {
    speed = .8;

    rigidbody!: Rigidbody;

    startPos = {x: 0, y: 0};
    velocity = new Vector3();
    click = false;
    joy = document.getElementById('joy')!;
    
    awake(): void {
        this.rigidbody = this.gameObject.getComponent(Rigidbody)!;

        
        window.addEventListener('pointerdown', (e) => {
            this.click = true;
            this.joy.hidden = false;
            const s = this.joy.clientWidth;
            this.joy.hidden = true;
            
            const { x, y } = this.pos(e);

            this.joy.style.left = `${x - s! / 2}px`;
            this.joy.style.top = `${y - s! / 2}px`;

            this.startPos = {x, y};
        });

        const isOnMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if(!isOnMobile)
        window.addEventListener('pointermove', (e) => {
            this.move(e);
        });
        else
        window.addEventListener('touchmove', (e) => {
            this.move(e.touches[0]);
        });
            

        window.addEventListener('pointerup', (e) => {
            this.endMove();
        });

        window.addEventListener('touchend', (e) => {
            this.endMove();
        });

        document.body.addEventListener('touchstart', function(e){ e.preventDefault(); });
    }

    pos(e: any, m = 100) {
        const x = Math.max(m, Math.min(window.innerWidth - m, e.clientX));
        const y = Math.max(m, Math.min(window.innerHeight - m, e.clientY));
        return { x, y };
    }

    move(e: any) {
        if(!this.click) return;
            
        this.joy.hidden = false;
        const sensitivity = 0.001;
        
        const { x, y } = this.pos(e, 0);
        const delta = {x: x - this.startPos.x, y: y - this.startPos.y};
        let mag = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
        mag *= sensitivity;
        mag = 1 + mag;
        mag = Math.min(1.2, mag);

        const r = Vector2.prototype.angle.call(delta);
        
        this.joy.style.transform = `rotate(${r}rad) scaleX(${mag})`;

        this.velocity = new Vector3(delta.x, 0, delta.y);
        this.velocity.normalize();
        this.velocity.multiplyScalar(this.speed);
        this.velocity.negate();
    }

    endMove() {
        this.click = false;
        this.joy.hidden = true;
        this.joy.style.transform = `rotate(0rad) scaleX(1) translateX(0px)`;
        this.velocity = new Vector3(0, 0, 0);
    }

    update(): void {
        let v = this.velocity.clone().multiplyScalar(this.context.time.deltaTime * 100);

        // @ts-ignore
        this.rigidbody.setVelocity(v);
    }
}