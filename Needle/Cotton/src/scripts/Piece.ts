import { AudioSource, Behaviour, BoxCollider, Collider, Collision, DragControls, findObjectOfType, getComponent, MeshRenderer, Rigidbody, serializable } from '@needle-tools/engine';
import { Material, Vector2, Vector3 } from 'three';
import { Bucket } from './Bucket';
import { DragAble } from './Dragable';
import { Tree } from './Tree';

export class CottonPiece extends Behaviour {
    private rigidbody?: Rigidbody;
    private drag?: DragAble;
    private bucket?: Bucket;

    private tree?: Tree;

    private startPos?: Vector3;

    private dragged = false;
    private free = false;

    private dragLimit = .5;

    private static dragStrenght = 1;

    private initial?: { pos: Vector3, rot: Vector3 };
    
    start(): void {
        this.initial = {
            // @ts-ignore
            pos: this.gameObject.position.clone(),
            // @ts-ignore
            rot: this.gameObject.rotation.clone()
        };
        
        this.rigidbody = this.gameObject.getComponent(Rigidbody)!;
        this.drag = this.gameObject.getComponent(DragAble)!;
        this.tree = findObjectOfType(Tree, this.context, true);
        this.bucket = findObjectOfType(Bucket, this.context, true);

        // @ts-ignore
        this.startPos = this.gameObject.position.clone();
        this.dragLimit = this.dragLimit * this.startPos!.y + .2;
        
        this.drag.addEventListener('dragStart', () => {
            this.tree!.dragged = true;
            this.dragged = true;

            this.pickUp();
            this.tree?.setAttractionPoint(this.startPos!.clone());
            this.tree?.setDelta(this.startPos!.clone());
        });

        this.drag.addEventListener('drag', (e: any) => {
            let delta = e.detail.delta as Vector3;

            if(!this.free) {
                this.tree!.angle = -delta.x * 2;
                let pos = this.gameObject.position.clone();
                
                // @ts-ignore
                this.tree!.setDelta(pos.clone());
    
                if(delta.length() > this.dragLimit) {
                    this.free = true;
                    this.tree?.snap();
                }

                CottonPiece.dragStrenght = 1;
            }
            else{
                let bucketZ = this.bucket!.gameObject.position.z
                // move towards bucket
                let pieceZ = this.gameObject.position.z;
                let dir = bucketZ - pieceZ;
                // @ts-ignore
                let newPos = this.gameObject.position.clone();
                newPos.z += dir * .1;
                // @ts-ignore
                this.gameObject.position.z = bucketZ;
            }
        });

        this.drag.addEventListener('dragEnd', () => {
            if(this.dragged && !this.free) {
                this.tree?.snap();
                this.dragged = false;
            }
            if(this.free) {
                this.drop();
            }
        });

        window.addEventListener('reset', () => {
            this.reset();
        });
    }

    reset() {
        this.free = false;
        this.dragged = false;
        
        // @ts-ignore
        this.gameObject.position.copy(this.initial!.pos);
        // @ts-ignore
        this.gameObject.rotation.copy(this.initial!.rot);

        this.rigidbody!.isKinematic = true;

        this.gameObject.activeSelf = true;
    }

    update(): void {
        if(this.dragged || this.free) return;

        // set local position to start position
        let b = this.tree!.bend(this.startPos!.clone());
        // @ts-ignore
        this.gameObject.position.copy(b.clone());

        CottonPiece.dragStrenght -= this.context.time.deltaTime * 5.0;
        
        // log delta
        // console.log(this.lastPoint?.distanceTo(this.point!));

        // this.lastPoint = this.point?.clone();
    }

    private drop() {
        this.rigidbody!.setVelocity(0);
        this.rigidbody!.isKinematic = false;
    }

    private pickUp() {
        this.rigidbody!.isKinematic = true;
    }

    public disable() {
        this.gameObject.activeSelf = false;
    }
}