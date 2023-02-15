import { AssetReference, Behaviour, BoxCollider, DropListener, findObjectOfType, GameObject, instantiate, isActiveSelf, ParticleSystem, Renderer, Rigidbody, serializable, setActive } from '@needle-tools/engine';
import { Physics } from '@needle-tools/engine/engine/engine_physics';
import { Object3D, Vector2, Vector3 } from 'three';
import { Escalator } from './Escalator';
import { PlayerController } from './PlayerController';
import { Store } from './Store';

export class ShoppingHandler extends Behaviour {
    shirtCount = 0;

    over = false;
    
    gameover() {
        if(this.over) return;
        this.over = true;

        findObjectOfType(PlayerController, this.context, false)!.enabled = false;
        window.parent.postMessage({shirtCount: this.shirtCount || 5}, "*");
        window.parent.postMessage({done: true}, "*");
        window.parent.postMessage({phoneScene: true}, "*");
    }

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

    isSpeacial = false;
    
    coolnessDropping = false;
    _coolness = .2;

    secretPotential = 0;
    spawnedSecret = false;

    get coolness() {
        return this._coolness;
    }

    set coolness(v: number) {
        v = Math.max(0, Math.min(1, v));

        if(v === 0) this.gameover();
        
        if(v === 1) this.coolnessDropping = true;
        
        this._coolness = v;
        document.getElementById('meter')!.style.width = `calc(${v * 100}% - .25em)`;
    }

    awake(): void {
        this.store?.loadAssetAsync();
        
        window.addEventListener('message', async (d: any) => {
            if(d.data.test) {
                this.spawn();
            }
        });

        window.addEventListener('userData', (d: any) => {
            let data = d.detail;
            if(!data['Hairspray'])
                this.secretPotential = .3;
        })
    }

    start() {
        requestAnimationFrame(() => this.refresh());

        window.addEventListener('specialCollected', () => {
            const c = document.getElementById('meter')!.classList;
            c.add('rainbow');
            
            this.isSpeacial = true; 
            
            setTimeout(() => {
                this.isSpeacial = false;
                c.remove('rainbow');
            }, 3000);
        });

        window.addEventListener('storeCollected', () => {
            this.playerController?.particles.play();
            this.shirtCount++;
        });
            
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

    dropSpeed = .05;
    
    update(): void {
        this.setColliders();

        this.coolness -= this.context.time.deltaTime * (this.coolnessDropping && !this.isSpeacial ? this.dropSpeed : 0);

        if(this.coolnessDropping && !this.isSpeacial)
        this.dropSpeed += this.context.time.deltaTime * .001;
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
                if(!this.spawnedSecret && Math.random() < this.secretPotential) {
                    store.spawnSecret();
                    this.spawnedSecret = true;
                }
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