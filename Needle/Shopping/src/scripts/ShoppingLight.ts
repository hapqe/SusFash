import { Behaviour, Light, serializable, ShadowCatcher } from '@needle-tools/engine';
import { LightShadow, SpotLight, SpotLightShadow } from 'three';
import { PlayerController } from './PlayerController';
import * as THREE from 'three';

export class ShoppingLight extends Behaviour {
    @serializable(PlayerController)
    player?: PlayerController;

    light!: Light;

    awake(): void {
        this.light = this.gameObject.getComponent(Light)!;
    }
        
    
    update(): void {
        const dist = this.player?.worldPosition.distanceTo(this.worldPosition) ?? 0;
        
    }
}