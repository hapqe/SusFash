import { Animator, Behaviour, DropListener, findObjectOfType, MeshRenderer, ParticleSystem, serializable, SkinnedMeshRenderer } from '@needle-tools/engine';
import { ICollider } from '@needle-tools/engine/engine/engine_types';
import { TextureLoader } from 'three';
import { PlayerController } from './PlayerController';
import * as THREE from 'three';
import { ClothPicker } from './Cloth';

export class Npc extends Behaviour {
    picker?: ClothPicker;
    
    player?: PlayerController;

    map?: THREE.Texture;

    @serializable(SkinnedMeshRenderer)
    cloth?: SkinnedMeshRenderer;

    @serializable(SkinnedMeshRenderer)
    body?: SkinnedMeshRenderer;

    @serializable(ParticleSystem)
    particles?: ParticleSystem;

    open = false;
    traded = false;
    design: any;

    @serializable()
    stand: boolean = false;

    awake() {
        const possibleColors = ['#ff4646', '#57ff57', '#6e6eff', '#c069ff'];
        const color = possibleColors[Math.floor(Math.random() * possibleColors.length)];

        // clone body material and assign color
        // @ts-ignore
        this.body!.sharedMaterial = this.body!.sharedMaterial.clone();
        // @ts-ignore
        this.body!.sharedMaterial.color = new THREE.Color(color);
        
        this.player = findObjectOfType(PlayerController, this.context, false) as PlayerController;
        this.picker = this.gameObject.getComponent(ClothPicker)!;

        window.addEventListener('message', (d: any) => {
            if(this.traded) return;
            if(d.data.trade && this.open) {
                this.traded = true;
                this.particles?.play();
                this.player?.particles.play();

                window.parent?.postMessage({playmagic: true}, '*');

                // @ts-ignore
                let old = this.cloth!.sharedMaterial.map;
                // @ts-ignore
                this.cloth!.sharedMaterial.map = this.player?.shirt?.sharedMaterial.map;

                // @ts-ignore
                this.player!.shirt!.sharedMaterial.map = old;
                this.player?.setDesign(this.design);
                this.player?.trade();

                if(this.picker?.stamp) {
                    let [id, date] = this.picker.stamp.split("_");
                    date = date.slice(0, -4);
                    window.parent?.postMessage({ tradeCloth: true, id: id, date: date }, "*");
                }
            }
        });

        let animator = this.gameObject.getComponent(Animator);
        animator?.SetBool('stand', this.stand);
    }

    onTriggerEnter(col: ICollider) {
        if (!this.traded && col.gameObject == this.player!.gameObject) {
            const design = this.picker?.design;
            if (design) {
                window.postMessage({showTrade: true, design}, '*');
                this.open = true;
                this.design = design;
            }
        }
    }


    onTriggerExit(col: ICollider) {
        if (col.gameObject == this.player!.gameObject) {
            window.postMessage({hideTrade: true}, '*');
            this.open = false;
        }
    }
}