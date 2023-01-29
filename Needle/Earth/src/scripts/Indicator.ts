import { Behaviour, BoxCollider, EventList, MeshRenderer, ParticleSystem, serializable } from "@needle-tools/engine";
import { UserData } from "./UserData";


export class Indicator extends Behaviour {
    @serializable(EventList)
    onClick?: EventList;

    secret: string = "";

    start() {
        if (this.secret != "") {
            window.addEventListener("userData", (d: any) => {
                let data = d.detail;
                if (data[this.secret]) {
                    this.disable();
                }
            })
        }

        let partices = this.gameObject.getComponentInChildren(ParticleSystem);
        let collider = this.gameObject.getComponentInChildren(BoxCollider);

        partices?.stop();
        window.addEventListener("objectClick", (e: any) => {
            if (e.detail.collider.gameObject == this.gameObject) {
                collider!.enabled = false;
                
                window.parent?.postMessage({ collect: true }, "*");

                if (this.secret != "")
                    window.parent?.postMessage({ secret: this.secret }, "*");

                partices!.enabled = true;
                partices?.play();
                this.onClick?.invoke();

                this.disable();
            }
        });
    }

    private disable() {
        let renderer = this.gameObject.getComponent(MeshRenderer);
        this.enabled = false;
        renderer!.enabled = false;
    }
}