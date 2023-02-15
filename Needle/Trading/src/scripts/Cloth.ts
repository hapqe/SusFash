import { Behaviour, serializable, SkinnedMeshRenderer } from '@needle-tools/engine';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { PlayerController } from './PlayerController';

export class ClothPicker extends Behaviour {
    @serializable()
    getSavedDesign : boolean = false;
    
    map?: THREE.Texture;

    @serializable(SkinnedMeshRenderer)
    clothRenderer?: SkinnedMeshRenderer;
    design: any;

    awake() {
        const time = Date.now();
        window.parent.postMessage({ fetchDesign: true, notFromUser: !this.getSavedDesign, savedDesign: this.getSavedDesign, time }, "*");
        window.addEventListener('message', async (d: any) => {
            if (d.data.isDesign && d.data.time == time) {
                this.design = d.data.design;

                const loader = new TextureLoader();

                const map = await loader.loadAsync(this.design);
                map.rotation = Math.PI;
                map.offset.set(1, 1);
                map.needsUpdate = true;

                this.map = map;

                const mat = new THREE.MeshBasicMaterial({ map, transparent: true, opacity: 0 });

                // @ts-ignore
                this.clothRenderer!.sharedMaterial = mat;
                this.startCoroutine(this.show());

                // getcomponent
                this.gameObject.getComponent(PlayerController)?.setDesign(this.design);
            }
        });
    }

    *show() {
        // @ts-ignore
        const mat = this.clothRenderer!.sharedMaterial as MeshBasicMaterial;
        for (let i = 0; i < 1; i += 0.03) {
            mat.opacity = i;
            yield;
        }
    }
}