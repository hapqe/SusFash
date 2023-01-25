import { AssetReference, Behaviour, BoxCollider, GameObject, instantiate, isActiveSelf, ParticleSystem, Renderer, Rigidbody, serializable, setActive } from '@needle-tools/engine';
import { Physics } from '@needle-tools/engine/engine/engine_physics';
import { Object3D, Vector2, Vector3 } from 'three';
import { Escalator } from './Escalator';
import { PlayerController } from './PlayerController';
import { Store } from './Store';

export class ShoppingHandler extends Behaviour {
    @serializable(AssetReference)
    store?: AssetReference;

    @serializable(AssetReference)
    escalator?: AssetReference;

    @serializable(GameObject)
    storeColliders?: GameObject;
    
    @serializable(PlayerController)
    playerController?: PlayerController;

    private blocks: Map<string, Store | Escalator> = new Map();

    spawnRange: number = 0;
    escalatorChance: number = 0;

    awake(): void {
        this.store?.loadAssetAsync();
        
        window.addEventListener('message', async (d: any) => {
            if(d.data.test) {
                this.spawn();
            }
        })
    }

    start() {
        requestAnimationFrame(() => this.refresh());

        window.parent?.postMessage({shopping: true}, "*");
    }
    
    async refresh() {
        const p = this.playerController!.worldPosition;

        const r = this.spawnRange;
        for (let x = -r; x <= r; x++) {
            for (let y = -r; y <= r; y++) {
                // @ts-ignore
                const v = new Vector3(x, y, 0).add(p);

                await this.spawn(v);                
                await new Promise(r => setTimeout(r, 50));
            }
        }

        const e = 3;
        for (let x = -r - e; x <= r + e; x++) {
            for (let y = -r - e; y <= r + e; y++) {
                if((Math.abs(x) <= r + e - 1) && (Math.abs(y) <= r + e - 1)) 
                    continue;

                // @ts-ignore
                let v = new Vector3(x, y, 0).add(p);
                v = new Vector3(-Math.floor(v.x / 2 + .5), Math.floor(v.y), 0);

                const b = this.blocks.get(`${v.x},${v.y},${v.z}`);
                if(b) {
                    b.gameObject.getComponentsInChildren(Renderer)!.forEach(r => r.enabled = false);
                }
            }
        }

        requestAnimationFrame(() => this.refresh());
    }

    update(): void {
        this.setColliders();
    }

    private async spawn(pos: Vector3 = new Vector3(0, 0, 0)) {
        const p = new Vector3(-Math.floor(pos.x / 2 + .5), Math.floor(pos.y), 0);
        
        const stringify = (v = p) => `${v.x},${v.y},${v.z}`;
        const has = (v = p) => this.blocks.has(stringify(v));
        
        if(Math.random() <= this.escalatorChance) {
            const o = Math.floor(Math.random() * 3) - 2;
            if(!(
                has(new Vector3(p.x, p.y + o + 2, 0)) ||
                has(new Vector3(p.x, p.y + o + 1, 0)) ||
                has(new Vector3(p.x, p.y + o, 0))
            )) {
                // @ts-ignore
                const g = await this.escalator?.instantiate({ parent: this.gameObject, position: new Vector3(-p.x * 2 - 2.2, p.y + o + 2, 0) });
                const escalator = g?.getComponent(Escalator);
    
                if (escalator) {
                    this.blocks.set(stringify(new Vector3(p.x, p.y + o + 2, 0)), escalator);
                    this.blocks.set(stringify(new Vector3(p.x, p.y + o + 1, 0)), escalator);
                    this.blocks.set(stringify(new Vector3(p.x, p.y + o, 0)), escalator);

                    escalator.offset = o + p.y;
                }

                return;
            }
        }
        
        if (!has()) {
            // @ts-ignore
            const g = await this.store?.instantiate({ parent: this.gameObject, position: new Vector3(-p.x * 2, p.y, 0) });
            const store = g?.getComponent(Store);
    
            if (store) {
                this.blocks.set(stringify(), store);
            }
        }
        else {
            const b = this.blocks.get(stringify())!;
            b.gameObject.getComponentsInChildren(Renderer)!.forEach(r => r.enabled = true);
        }
        
    }

    setColliders() {
        const p = this.playerController;

        const pos = new Vector3(
            Math.floor((p!.worldPosition.x + 1) / 2) * 2,
            Math.floor(p!.worldPosition.y),
            0
        )

        const i = new Vector3(
            Math.floor(-(p!.worldPosition.x + 1) / 2) + 1,
            Math.floor(p!.worldPosition.y),
            0
        );
        
        const s = `${i.x},${i.y},${i.z}`;
        
        if(this.blocks.has(s)) {
            const b = this.blocks.get(s)!;
            if(b instanceof Escalator) {
                this.storeColliders!.position.z = -100;
            }
            else {
                // @ts-ignore
                this.storeColliders!.position.copy(pos);
            }
        }
    }
}