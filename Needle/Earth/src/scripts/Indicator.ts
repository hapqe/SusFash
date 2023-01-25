import { Behaviour, EventList, MeshRenderer, ParticleSystem, serializable } from "@needle-tools/engine";
import { UserData } from "./UserData";


export class Indicator extends Behaviour {
    @serializable(EventList)
    onClick? : EventList;

    secret: string = "";
    
    start() {
        if(this.secret != ""){
            window.addEventListener("userData", (d: any) => {
                let data = d.detail;
                if(data[this.secret]){
                    this.disable();
                }
            })
        }
        
        let partices = this.gameObject.getComponentInChildren(ParticleSystem);
        partices?.stop();
        window.addEventListener("objectClick", (e: any) => {
            if(e.detail.collider.gameObject == this.gameObject) {
                if(this.secret != "")
                window.parent?.postMessage({collect: true}, "*");
                window.parent?.postMessage({secret: this.secret}, "*");

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