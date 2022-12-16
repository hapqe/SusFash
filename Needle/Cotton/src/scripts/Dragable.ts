import { Behaviour, DropListener, serializable } from '@needle-tools/engine';
import { Object3D, Plane, Raycaster, Vector2, Vector3 } from 'three';
import { ClickHandler } from './ClickHandler';

export class DragAble extends Behaviour {
    private point?: Vector3;

    start(): void {
        let d = (e) => this.drag(e);
        
        window.addEventListener('objectPointerDown', (e: any) => {
            if(e.detail.collider.gameObject == this.gameObject){
                // @ts-ignore
                this.point = this.worldPosition;
                this.dispatchEvent(new CustomEvent("dragStart", {detail: {point: this.point}}));
                window.addEventListener(ClickHandler.isOnMobile ? 'touchmove' : 'pointermove', d);
            }
        });

        window.addEventListener(ClickHandler.isOnMobile ? 'touchend' : 'pointerup', () => {
            window.removeEventListener(ClickHandler.isOnMobile ? 'touchmove' : 'pointermove', d);
            this.dispatchEvent(new CustomEvent("dragEnd", {detail: {point: this.intersect}}));
        });
    }

    intersect?: Vector3;

    drag(ev: PointerEvent) {
        let pos = ClickHandler.inputPoint(ev, this.context);

        let cam = this.context.mainCamera!;
        // @ts-ignore
        let fwd = new Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
        
        let caster = new Raycaster();
        // @ts-ignore
        caster.setFromCamera(pos, cam);

        var plane = new Plane(fwd);
        plane.constant = -this.point!.dot(fwd);

        let intersect = caster.ray.intersectPlane(plane, new Vector3());
        if(intersect){
            // @ts-ignore
            this.worldPosition = intersect;
            this.dispatchEvent(new CustomEvent("drag", {detail: {point: intersect, delta: intersect.clone().sub(this.point!)}}));
            this.intersect = intersect;
        }
    }
}