import { Behaviour, DropListener, findObjectOfType, MeshRenderer, ParticleSystem, serializable, SkinnedMeshRenderer } from '@needle-tools/engine';
import { ICollider } from '@needle-tools/engine/engine/engine_types';
import { TextureLoader } from 'three';
import { PlayerController } from './PlayerController';
import * as THREE from 'three';
import { ClothPicker } from './Cloth';

export class Npc extends Behaviour {
    player?: PlayerController;

    map?: THREE.Texture;

    @serializable(SkinnedMeshRenderer)
    clothRenderer?: SkinnedMeshRenderer;

    @serializable(ParticleSystem)
    particles?: ParticleSystem;

    open = false;
    traded = false;

    awake() {
        this.player = findObjectOfType(PlayerController, this.context, false) as PlayerController;

        window.addEventListener('message', (d: any) => {
            if(d.data.trade && this.open) {
                this.traded = true;
                this.particles?.play();
            }
        });
    }

    onTriggerEnter(col: ICollider) {
        if (!this.traded && col.gameObject == this.player!.gameObject) {
            const design = this.gameObject.getComponent(ClothPicker)?.design;
            if (design) {
                // @ts-ignore  
                showTrade(design);
                this.open = true;
            }
        }
    }


    onTriggerExit(col: ICollider) {
        if (col.gameObject == this.player!.gameObject) {
            // @ts-ignore
            hideTrade();
            this.open = false;
        }
    }
}