import { Behaviour, LookAtConstraint, MeshRenderer, OrbitControls, ParticleSystem, serializable, SkinnedMeshRenderer } from "@needle-tools/engine";
import { lerp } from "three/src/math/MathUtils";
import { Cloth } from "./Cloth";

export enum SelectedTool {
    Camera,
    Scissors,
    Spray,
}

export class DesignHandler extends Behaviour {
    toolElement: HTMLImageElement | null = null;
    selectedTool = SelectedTool.Camera;
    wrapper = document.getElementById("wrapper") as HTMLDivElement;
    dim = document.getElementById("dim") as HTMLDivElement;

    @serializable(Cloth)
    cloth: Cloth | null = null;

    @serializable(OrbitControls)
    orbitControls: OrbitControls | null = null;

    @serializable(ParticleSystem)
    resetEffect: ParticleSystem | null = null;

    @serializable(MeshRenderer)
    scissorsIndicator: MeshRenderer | null = null;

    @serializable(MeshRenderer)
    sprayIndicator: MeshRenderer | null = null;
    
    start() {
        this.toolElement = document.getElementById("tool") as HTMLImageElement;
        
        window.addEventListener("objectClick", (e: any) => {
            let oldTool = this.selectedTool;
            let toolName = e.detail.name;
            if(toolName == "Scissors"){
                this.selectedTool = SelectedTool.Scissors;
            }
            else if(toolName == "Spray"){
                window.dispatchEvent(new CustomEvent("sprayClick"));
                this.selectedTool = SelectedTool.Spray;
            }
            else if(toolName == "Camera"){
                this.selectedTool = SelectedTool.Camera;
            }
            if(oldTool != this.selectedTool){
                window.dispatchEvent(new CustomEvent("toolChanged", { detail: this.selectedTool }));
                this.updateTool();
            }
        });
        window.addEventListener("backgroundClick", () => {
            this.selectedTool = SelectedTool.Camera;
            this.updateTool();
        })
        window.addEventListener("setTool", () => {
            this.selectedTool = (this.selectedTool + 1) % 3;
            this.updateTool();
        })
        window.addEventListener("submitCloth", () => {
            this.dim.style.opacity = '.8';
            this.dim.style.pointerEvents = 'all';
            fetch("./templates/test.html").then(res => res.text().then(text => { 
                this.wrapper.innerHTML = text;
                this.wrapper.querySelector("#back")!.addEventListener("click", () => {
                    this.wrapper.innerHTML = "";
                    this.dim.style.pointerEvents = 'none';
                    this.dim.style.opacity = '0';
                });
                // let img = this.wrapper.querySelector("#cloth") as HTMLImageElement;
                let allCanvases = document.querySelectorAll("canvas");
                let canvas: HTMLCanvasElement;
                for(let i = 0; i < allCanvases.length; i++){
                    if(allCanvases[i].id == ""){
                        canvas = allCanvases[i] as HTMLCanvasElement;
                        break;
                    }
                }
                // get canvas image and start download
                let img = canvas!.toDataURL("image/png", 1.0);
                let link = document.createElement('a');
                link.download = 'image.png';

                link.href = img;
                link.click();
            }));
        })
        window.addEventListener("resetCloth", () => {
            this.cloth?.setup();
            this.resetEffect?.play();
        })

        this.updateTool();
    }

    private updateTool() {
        if(this.orbitControls)
        this.orbitControls.enabled = this.selectedTool == SelectedTool.Camera;
        let cut = this.selectedTool == SelectedTool.Scissors;
        let draw = this.selectedTool == SelectedTool.Spray;
        if(this.cloth){
            this.cloth.cutting = cut;
            this.scissorsIndicator!.enabled = cut;
            this.cloth.drawing = draw;
            this.sprayIndicator!.enabled = draw;
        }

        this.toolElement!.src = `./svgs/${SelectedTool[this.selectedTool]}.svg`;
    }
}