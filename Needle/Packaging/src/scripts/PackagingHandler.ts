import { AssetReference, Behaviour, serializable } from '@needle-tools/engine';
import { Euler, Object3D, Quaternion } from 'three';

export class PackagingHandler extends Behaviour {
    @serializable(AssetReference)
    packagePrefab?: AssetReference;

    @serializable(Object3D)
    spawnPosition?: Object3D;

    async awake() {
        await this.packagePrefab?.loadAssetAsync();
    }
    
    start(): void {
        this.startCoroutine(this.spawnPackage());
        // @ts-ignore

    }

    *spawnPackage() {
        const interval = 3;
        let t = this.context.time.time;
        const rot = new Quaternion().setFromEuler(new Euler(0, Math.random() * Math.PI * 2, 0));
        // @ts-ignore
        this.packagePrefab!.instantiate({parent: this.gameObject, position: this.spawnPosition!.position, rotation: rot});
        while(this.context.time.time - t < interval) {
            yield;
        }
        this.startCoroutine(this.spawnPackage());
    }
}