import { Behaviour, ParticleSystem } from '@needle-tools/engine';

export class ShoppingParticles extends Behaviour {
    system!: ParticleSystem;
    
    awake(): void {
        this.system = this.gameObject.getComponent(ParticleSystem)!;
    }
}