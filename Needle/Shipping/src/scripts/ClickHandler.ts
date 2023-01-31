import { Behaviour } from "@needle-tools/engine";
import { ICollider } from "@needle-tools/engine/engine/engine_types";
import { Vector3 } from "three";

export class ClickHandler extends Behaviour {
    drag = false;
    
    start() {
        document.addEventListener('mousedown', () => this.drag = false);
        document.addEventListener('mousemove', () => this.drag = true);
        document.addEventListener('mouseup', () => { if(!this.drag) this.click() });
    }

    click() {
        let screenPoint = this.context.input.mousePosition;
        
        let ray = this.context.physics.raycastPhysicsFast(screenPoint);

        if(ray){
            window.dispatchEvent(new CustomEvent("objectClick", { detail: {...ray, name: ray.collider.gameObject.name} }));
        }
        else{
            window.dispatchEvent(new CustomEvent("backgroundClick"));
        }
    }
}