import { Behaviour, BoxCollider, Collider, DragControls, findObjectOfType, getComponent, MeshRenderer, Rigidbody, serializable } from '@needle-tools/engine';
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

    private dragLimit = .6;

    start(): void {
        this.rigidbody = this.gameObject.getComponent(Rigidbody)!;
        this.drag = this.gameObject.getComponent(DragAble)!;
        this.tree = findObjectOfType(Tree, this.context, true);
        this.bucket = findObjectOfType(Bucket, this.context, true);

        // @ts-ignore
        this.startPos = this.gameObject.position.clone();
        this.dragLimit = this.dragLimit * this.startPos!.y;
        
        this.drag.addEventListener('dragStart', (e: any) => {
            this.tree!.dragged = true;
            this.dragged = true;

            this.pickUp();
            this.tree?.setAttractionPoint(this.startPos!.clone());
            this.tree?.setDelta(this.startPos!.clone());
        });

        this.drag.addEventListener('drag', (e: any) => {
            let point = e.detail.point as Vector3;
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
           
        this.drag.addEventListener('dragEnd', (e: any) => {
            if(this.dragged && !this.free) {
                this.tree?.snap();
                this.dragged = false;
            }
            if(this.free) {
                this.drop();
            }
        });
    }

    update(): void {
        if(this.dragged || this.free) return;

        // set local position to start position
        let b = this.tree!.bend(this.startPos!.clone());
        // @ts-ignore
        this.gameObject.position.copy(b.clone());
    }

    private drop() {
        this.rigidbody!.setVelocity(0);
        this.rigidbody!.isKinematic = false;
    }

    private pickUp() {
        this.rigidbody!.isKinematic = true;
    }

    public disable() {
        this.rigidbody?.destroy()
        this.gameObject.getComponent(MeshRenderer)?.destroy();
        let col = this.gameObject.getComponent(BoxCollider);
        // @ts-ignore
        col!.size = new Vector3(0, 0, 0);
        col?.destroy();
        this.destroy();
    }
}