import { addNewComponent, AssetReference, Behaviour, findObjectOfType, FrameEvent, getComponent, MeshRenderer, ParticleSystem, removeComponent, serializable } from '@needle-tools/engine';
import { MeshBasicMaterial, Texture, TextureLoader } from 'three';
import * as THREE from 'three';
import { ShoppingCloth } from './ShoppingCloth';
import { ICollider } from '@needle-tools/engine/engine/engine_types';
import { ShoppingHandler } from './ShoppingHandler';

export class Store extends Behaviour {
    clothRenderer?: MeshRenderer;
    designName: string = "";
    collected = false;
        
    start() {
        const cloth = this.gameObject!.getComponentInChildren(ShoppingCloth);
        this.clothRenderer = cloth!.gameObject.getComponent(MeshRenderer)!;
        
        this.randomize();
    }

    randomize() {
        window.parent.postMessage({ fetchDesign: true}, "*");
        window.addEventListener('message', async (d: any) => {
            if(this.designName == "" && d.data.isDesign) {
                this.designName = d.data.stamp;
                
                const design = d.data.design;
                
                const loader = new TextureLoader();
                
                const map = await loader.loadAsync(design);
                map.rotation = Math.PI;
                map.offset.set(1, 1);
                map.needsUpdate = true;

                const mat = new THREE.MeshBasicMaterial({map, transparent: true, opacity: 0});

                // @ts-ignore
                this.clothRenderer!.sharedMaterial = mat;

                this.startCoroutine(this.show());
            }
        });
    }

    collect() {
        const particles = findObjectOfType(ParticleSystem, this.context, false) as ParticleSystem;
        particles.play();
        
        if(!this.collected && this.designName != "") {
            window.parent?.postMessage({coin: true}, "*");
            window.parent?.postMessage({magic: true}, "*");
            
            this.collected = true;
            
            let [id, date] = this.designName.split("_");
            date = date.slice(0, -4);
            window.parent?.postMessage({collectCloth: true, id: id, date: date}, "*");
        }
    }

    onTriggerEnter(col: ICollider) {
        if(col.gameObject.name == "Player") {
            this.collect();
        }
    }

    *show() {
        // @ts-ignore
        const mat = this.clothRenderer!.sharedMaterial as MeshBasicMaterial;
        for(let i = 0; i < 1; i += 0.03) {
            mat.opacity = i;
            yield;
        }
    }
}