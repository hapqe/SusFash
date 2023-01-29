import { Animator, AssetReference, Behaviour, findObjectOfType, ParticleSystem, serializable } from '@needle-tools/engine';
import { Euler, Object3D, Quaternion } from 'three';

export class PackagingHandler extends Behaviour {
    @serializable(AssetReference)
    packagePrefab?: AssetReference;

    @serializable(Object3D)
    spawnPosition?: Object3D;

    @serializable(Animator)
    effect?: Animator;

    private score = document.getElementById('score');
    private max = 12;
    private count = 0;

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

    public collect() {
        findObjectOfType(ParticleSystem, this.context, false)!.play();
        this.effect?.SetTrigger('collect');
        window.parent?.postMessage({magic: true}, "*");
        window.parent?.postMessage({coin: true}, "*");

        this.score!.innerText = `${Math.min(++this.count, this.max)}/${this.max}`;

        if(this.count == this.max) {
            console.log("NEXT");
        }
    }
}