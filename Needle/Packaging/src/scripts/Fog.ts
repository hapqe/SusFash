import { Behaviour } from '@needle-tools/engine';
import * as THREE from 'three';

export class Fog extends Behaviour {
    start(): void {
        let renderer = this.context.renderer;
        let scene = this.context.scene;
        // @ts-ignore
        scene.fog = new THREE.FogExp2(0x808080, .2);
    }
}