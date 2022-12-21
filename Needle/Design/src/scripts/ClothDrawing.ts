import { Behaviour, MeshRenderer, serializable } from "@needle-tools/engine";
import { CanvasTexture, Color, CubeUVReflectionMapping, Mapping, Material, MeshStandardMaterial, RepeatWrapping, Texture, UVMapping, Vector2, Vector3, Wrapping } from "three";
import { SelectedTool } from "./DesignHandler";

export class ClothDrawing extends Behaviour {
    @serializable(MeshRenderer)
    sprayRenderer?: MeshRenderer;
    
    @serializable(MeshRenderer)
    renderer?: MeshRenderer;

    colorCanvas = document.getElementById("clothColor") as HTMLCanvasElement;
    ctx = this.colorCanvas.getContext("2d")!;
    
    private color: Vector3 = new Vector3(Math.random(), Math.random(), Math.random());
    
    lastUv?: Vector2;
    
    start() {
        this.clear();

        window.addEventListener("pointerup", () => {
            this.lastUv = undefined;
        });
        window.addEventListener("touchend", () => {
            this.lastUv = undefined;
        });

        window.addEventListener("clothDraw", (e) => {
            // @ts-ignore
            let uv = e.detail.uv as Vector2;
            
            let radius = .025;
            if(this.lastUv && this.context.input.mousePressed){
                this.drawLine(this.color, this.lastUv, uv, radius);
            }
            this.lastUv = uv;
        })
        window.addEventListener("resetCloth", () => {
            this.clear();
        })

        let map = new CanvasTexture(this.colorCanvas, UVMapping, RepeatWrapping, RepeatWrapping);
        map.flipY = false;
        // @ts-ignore
        this.renderer!.sharedMaterial.map = map;
        
        window.addEventListener("fixedUpdate", () => {
            // @ts-ignore
            this.renderer!.sharedMaterial.map.needsUpdate = true;
        });

        window.addEventListener("toolChanged", (e) => {
            // @ts-ignore
            if(e.detail == SelectedTool.Spray){
                this.setSprayColor(this.color);
            }   
        })
        
        window.addEventListener("sprayClick", () => {
            this.color = new Vector3(Math.random(), Math.random(), Math.random());
            this.setSprayColor(this.color);
        });

        this.setSprayColor(this.color);
    }

    setSprayColor(color: Vector3) {
        // @ts-ignore
        this.sprayRenderer!.sharedMaterial.color = new Color(color.x, color.y, color.z);
    }

    drawCircle(color: Vector3, uv: Vector2, radius: number) {
        let ctx = this.ctx;
        
        let x = (uv.x + 1) * this.colorCanvas.width;
        let y = (uv.y + 1) * this.colorCanvas.height;
        
        let r = radius * this.colorCanvas.width;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = `rgb(${color.x * 255}, ${color.y * 255}, ${color.z * 255})`;
        ctx.fill();
    }

    drawLine(color: Vector3, start: Vector2, end: Vector2, radius: number) {
        let ctx = this.ctx;
        
        let x1 = (start.x + 1) * this.colorCanvas.width;
        let y1 = (start.y + 1) * this.colorCanvas.height;
        let x2 = (end.x + 1) * this.colorCanvas.width;
        let y2 = (end.y + 1) * this.colorCanvas.height;
        
        let r = radius * this.colorCanvas.width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = r;
        ctx.strokeStyle = `rgb(${color.x * 255}, ${color.y * 255}, ${color.z * 255})`;
        ctx.stroke();
    }

    clear() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.colorCanvas.width, this.colorCanvas.height);
    }
}