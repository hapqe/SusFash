import { Behaviour } from "@needle-tools/engine";
import { Context } from "@needle-tools/engine/engine/engine_setup";
import { ICollider } from "@needle-tools/engine/engine/engine_types";
import { Vector2, Vector3 } from "three";

export class ClickHandler extends Behaviour {
    drag = false;
    static readonly isOnMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    start() {
        
        document.addEventListener('mousedown', () => this.drag = false);
        document.addEventListener('mousemove', () => this.drag = true);
        document.addEventListener('mouseup', (e) => { if (!this.drag) this.click(e) });
        if (ClickHandler.isOnMobile)
            document.addEventListener('touchstart', (e) => { this.click(e, "PointerDown") });
        else
            document.addEventListener('pointerdown', (e) => { this.click(e, "PointerDown") });
    }

    click(e: any, name = "Click") {
        let screenPoint: Vector2 = ClickHandler.inputPoint(e, this.context);

        let ray = this.context.physics.raycastPhysicsFast(screenPoint);

        if (ray) {
            window.dispatchEvent(new CustomEvent("object" + name, { detail: { ...ray, name: ray.collider.gameObject.name } }));
        }
        else {
            window.dispatchEvent(new CustomEvent("background" + name));
        }
    }

    static inputPoint(e: any, c: Context) {
        let screenPoint: Vector2;
        if (e.touches) {
            let p = new Vector2(e.touches[0].clientX, e.touches[0].clientY);
            c.input.convertScreenspaceToRaycastSpace(p);
            screenPoint = p.clone();
        }
        else {
            let p = new Vector2(e.clientX, e.clientY);
            c.input.convertScreenspaceToRaycastSpace(p);
            screenPoint = p.clone();
        }
        return screenPoint;
    }
}