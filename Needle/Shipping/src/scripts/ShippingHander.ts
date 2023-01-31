import { Behaviour } from '@needle-tools/engine';
import * as THREE from 'three';

export class ShippingHandler extends Behaviour {
    start(): void {
        const light = this.context.scene.getObjectByName('Light') as unknown as THREE.DirectionalLight;

        light.shadow.bias = 0.0001;
        
        light.shadow.updateMatrices(light);
    }
}