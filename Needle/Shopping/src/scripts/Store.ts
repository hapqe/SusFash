import { addNewComponent, AssetReference, Behaviour, findObjectOfType, FrameEvent, GameObject, getComponent, MeshRenderer, ParticleSystem, removeComponent, serializable } from '@needle-tools/engine';
import { LuminanceFormat, MeshBasicMaterial, Texture, TextureLoader } from 'three';
import * as THREE from 'three';
import { ShoppingCloth } from './ShoppingCloth';
import { ICollider, IGameObject } from '@needle-tools/engine/engine/engine_types';
import { ShoppingHandler } from './ShoppingHandler';
import { PlayerController } from './PlayerController';
import { ShoppingParticles } from './ShoppingParticles';

export class Store extends Behaviour {
    handler?: ShoppingHandler;
    
    @serializable(MeshRenderer)
    clothRenderer?: MeshRenderer;

    designName: string = "";
    collected = false;

    @serializable(GameObject)
    specialObject?: GameObject;
    
    @serializable(GameObject)
    glowObject?: GameObject;

    @serializable(GameObject)
    checkObject?: GameObject;

    special = false;

    particles?: ShoppingParticles;

    map?: THREE.Texture;

    start() {
        this.particles = findObjectOfType(ShoppingParticles, this.context, false);
        
        const cloth = this.gameObject!.getComponentInChildren(ShoppingCloth);

        this.handler = findObjectOfType(ShoppingHandler, this.context, false) as ShoppingHandler;
        
        this.randomize();

        const specialChange = .3;

        if(Math.random() < specialChange) {
            this.special = true;
            this.specialObject!.activeSelf = true;
            this.glowObject!.activeSelf = true;
        }
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

                this.map = map;

                const mat = new THREE.MeshBasicMaterial({map, transparent: true, opacity: 0});

                // @ts-ignore
                this.clothRenderer!.sharedMaterial = mat;

                this.startCoroutine(this.show());
            }
        });
    }

    playPartices() {
        const prev = this.particles!.system.emission.rateOverTime.constant;

        this.particles!.system.emission.rateOverTime.constant = this.special ? 10000 : 1000;

        setTimeout(() => {
            this.particles!.system.emission.rateOverTime.constant = prev;
        }, 100);
    }
    
    collect(p: IGameObject) {
        if(!this.collected && this.designName != "") {
            const player = getComponent(p, PlayerController) as PlayerController;
            player.setTexture(this.map!);
            
            this.checkObject!.activeSelf = true;
            
            if(!this.special) 
                window.parent?.postMessage({flash: true}, "*");

            this.playPartices();

            this.collected = true;
            
            this.handler!.coolness += .2;
            
            window.parent?.postMessage({playcoin: true}, "*");
            window.parent?.postMessage({playmagic: true}, "*");

            if(this.special) {
                window.parent?.postMessage({playcollect: true}, "*");
                window.dispatchEvent(new CustomEvent("specialCollected"));
                
                this.glowObject!.activeSelf = false;
            }
            
            window.dispatchEvent(new CustomEvent("storeCollected"));
            
            let [id, date] = this.designName.split("_");
            date = date.slice(0, -4);
            window.parent?.postMessage({collectCloth: true, id: id, date: date}, "*");
        }
    }

    onTriggerEnter(col: ICollider) {
        if(col.gameObject.name == "Player") {
            this.collect(col.gameObject);
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