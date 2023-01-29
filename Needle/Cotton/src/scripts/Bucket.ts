import { Animator, AudioSource, Behaviour, ParticleSystem, Rigidbody } from '@needle-tools/engine';
import { ICollider } from '@needle-tools/engine/engine/engine_types';
import { CottonPiece } from './Piece';

export class Bucket extends Behaviour {
    count = 0;
    animator?: Animator;
    particles?: ParticleSystem;

    score = document.getElementById('score');
    max = 0;
    
    awake() {
        this.max = Number.parseInt(this.score?.innerText.charAt(2)!);
        
        this.animator = this.gameObject.getComponent(Animator)!;
        this.particles = this.gameObject.getComponentInChildren(ParticleSystem)!;
        this.particles.stop();

        window.addEventListener('reset', () => {
            window.parent?.postMessage({woosh: true}, "*");
            
            this.count = 0;
            this.score!.innerText = `0/${this.max}`;
        });
    }
    
    onTriggerEnter(col: ICollider) {
        let piece = col.gameObject.getComponent(CottonPiece);
        piece?.disable();
        this.score!.innerText = `${Math.min(++this.count, this.max)}/${this.max}`;

        if(this.count == this.max) {
            console.log("NEXT");
        }
        
        window.parent?.postMessage({score: true}, "*");
        
        this.animator?.SetTrigger('effect');
        this.particles?.play();
    }
}