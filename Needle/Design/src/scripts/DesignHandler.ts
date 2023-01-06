import { Behaviour, LookAtConstraint, MeshRenderer, OrbitControls, ParticleSystem, serializable, SkinnedMeshRenderer } from "@needle-tools/engine";
import { lerp } from "three/src/math/MathUtils";
import { Cloth } from "./Cloth";
import * as THREE from "three";
import { MeshHandler } from "./MeshHandler";

export enum SelectedTool {
    Camera,
    Scissors,
    Spray,
}

export class DesignHandler extends Behaviour {
    toolElement: HTMLImageElement | null = null;
    selectedTool = SelectedTool.Camera;

    @serializable(Cloth)
    cloth?: Cloth;

    @serializable(MeshHandler)
    meshHandler?: MeshHandler;

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
            this.submit();
        })
        window.addEventListener("resetCloth", () => {
            this.cloth?.setup();
            this.resetEffect?.play();
            window.parent?.postMessage({woosh: true}, "*");
        })

        this.updateTool();
    }

    private submit() {
        let submitCanvas = document.getElementById('submitCanvas') as HTMLCanvasElement;

        let renderer = new THREE.WebGLRenderer({ canvas: submitCanvas, antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.set(0, 0, 4);
        let light = new THREE.DirectionalLight(0xeeeeff, .8);
        light.position.set(0, 0, 1);
        scene.add(light);
        let clothMesh = this.meshHandler?.renderer?.sharedMesh;
        // @ts-ignore   
        let cloth = new THREE.Mesh(clothMesh?.geometry, clothMesh?.material);
        cloth.position.set(-1.5, 1.5, 0);
        cloth.scale.x = -1;
        cloth.scale.multiplyScalar(3);
        scene.add(cloth);
        renderer.render(scene, camera);
        
        let data = submitCanvas.toDataURL("image/png");
        window.parent?.postMessage({ design: data }, "*");
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

        window.parent?.postMessage({click: true}, "*");
    }
}