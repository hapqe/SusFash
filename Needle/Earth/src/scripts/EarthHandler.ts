import { Behaviour, GameObject, OrbitControls, serializable } from "@needle-tools/engine";
import { Object3D, Vector3 } from "three";
import { Indicator } from "./Indicator";

export class EarthHandler extends Behaviour {
    @serializable(GameObject)
    camera?: GameObject;

    @serializable(Indicator)
    earthIndicator?: Indicator;
    
    start() {
        this.earthIndicator?.onClick?.addEventListener(() => {
            this.zoomIn();

            window.parent?.postMessage({ cottonScene: true }, "*");
            window.parent?.postMessage({ done: true }, "*");
        });
    }

    @serializable(Object3D)
    target?: Object3D;

    private lerpToTarget = false;

    private zoomIn() {
        this.lerpToTarget = true;
        
        let orbit = this.camera!.getComponent(OrbitControls)!;
        orbit.autoRotate = false;
        orbit.enableKeys = false;
        orbit.enablePan = false;
        orbit.enableZoom = false;
        orbit.middleClickToFocus = false;
        orbit.doubleClickToFocus = false;
    }

    update(): void {
        if (this.lerpToTarget) {
            const pos = this.camera!.position;
            // @ts-ignore
            pos.lerp(this.target?.position, this.context.time.deltaTime * 2);
        }
    }
}