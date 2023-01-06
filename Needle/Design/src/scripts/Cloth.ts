import { Behaviour, getComponent, serializeable } from "@needle-tools/engine";
import { Vec3 } from "@needle-tools/engine/engine/engine_types";
import { MeshHandler } from "./MeshHandler";
import * as THREE from "three";
import { Vector2, Vector3 } from "three"
import { FixedUpdate } from "./FixedUpdate";

type Parent = { seg: Segment, offset: number } | null;
type Connected = { left: Segment | undefined, top: Segment | undefined, right: Segment | undefined, down: Segment | undefined };

export class Segment {
    static gravity: Vector3 = new Vector3(0, -9.81, 0);
    previous: Vector3;
    uv: Vector2;
    draw = true;
    active = true;
    connected: Connected = { left: undefined, top: undefined, right: undefined, down: undefined };
    constructor(public position: Vector3, public top: Parent, public left: Parent, public fixed = false) {
        this.previous = position;
        this.uv = new Vector2(position.x, position.y);
    }
    get diagonal() {
        return this.left?.seg.top;
    }
    integrate(delta: number) {
        if(this.fixed || !this.active) return;

        const f = Segment.gravity.clone();
        let v = this.position.clone().sub(this.previous);
        v.add(f.multiplyScalar(delta));

        this.previous = this.position.clone();
        this.position.add(v);
    }

    constrain() {
        if(this.fixed || !this.active) return;

        [this.top, this.left].forEach(parent => {
            if(parent && parent.seg.active) {
                const dist = this.position.distanceTo(parent.seg.position);
                const error = parent.offset - dist;

                const dir = parent.seg.position.clone().sub(this.position);
                dir.normalize().multiplyScalar(error * 0.5);
                this.position.sub(dir);
                if(!parent.seg.fixed)
                    parent.seg.position.add(dir);
            }
        });
    }

    randomize(amount: number = 1) {
        if(this.fixed) return;
        this.position.z += (Math.random() - .5) * amount
    }
}

export class Cloth extends Behaviour {
    private handler?: MeshHandler;
    segments: Segment[] = [];
    subdivisions = 20;
    integrationSteps = 10;
    simulationSpeed = .1;
    public cutting = false;
    public drawing = false;

    awake() {
        this.handler = getComponent(this.gameObject, MeshHandler);
    }

    start() {
        window.addEventListener("fullyLoaded", () => {
            this.setup();
        });
        
        window.addEventListener("fixedUpdate", () => {
            this.frame++;
            this.simulate();
            this.mouse();
        });

        window.addEventListener("pointerup", () => {
            this.lastUv = undefined;
            window.parent?.postMessage({stopSpray: true}, "*");
            window.parent?.postMessage({stopCut: true}, "*");
        });
    }

    private frame = 0;

    setup() {
        this.segments = [];
        
        let sub = this.subdivisions;
        let d = 1 / (sub - 1);
        let top = -sub;
        for (let x = 0; x < sub; x++) {
            let left = -1;
            for (let y = 0; y < sub; y++) {
                let parents: Parent[] = [];
                let topParent = top >= 0 ? { seg: this.segments[top], offset: d } : null;
                let leftParent = left >= 0 ? { seg: this.segments[left + x * sub], offset: d } : null;
                parents.push();
                parents.push();

                let seg = new Segment(new Vector3(-y * d, -x * d, 0), topParent, leftParent, x == 0);
                
                this.segments.push(seg);

                top++;
                left++;
            }
        }

        this.segments.forEach(seg => {
            seg.randomize(.001);
            seg.connected.left = seg.left?.seg;
            seg.connected.top = seg.top?.seg;
            let rightIndex = this.segments.indexOf(seg) + 1;
            if(rightIndex % sub != 0)
            seg.connected.right = this.segments[rightIndex];
            let downIndex = this.segments.indexOf(seg) + sub;
            if(downIndex < this.segments.length)
            seg.connected.down = this.segments[downIndex];
        });
    }

    simulate() {
        for (let i = 0; i < this.integrationSteps; i++) {
            this.segments.forEach(seg => {
                seg.integrate(this.simulationSpeed * FixedUpdate.delta / 100 / this.integrationSteps);
                seg.constrain();
            });
        }
    }
    
    lastUv?: Vector2;
    minUvDelta = .03;
    lastMousePos?: Vector2;
    
    mouse() {
        let uv = this.handler?.point?.uv;
        if(uv) {
            this.handleUvPosition(uv);

            let dist = this.lastUv?.distanceTo(uv);

            if(this.lastUv && dist && dist > this.minUvDelta) {
                let delta = uv.clone().sub(this.lastUv);
                let steps = Math.ceil(dist / this.minUvDelta);
                let step = delta.divideScalar(steps);
                for (let i = 0; i < steps; i++) {
                    let uv = this.lastUv?.clone().add(step.clone().multiplyScalar(i));
                    if(uv) {
                        this.handleUvPosition(uv);
                    }
                }
            }

            this.lastUv = uv;
        }
        else {
            this.lastUv = undefined;
        }
        // @ts-ignore
        this.lastMousePos = this.context.input.mousePosition.clone();
    }

    private handleUvPosition(uv: THREE.Vector2) {
        let sub = this.subdivisions;
        let x = -Math.ceil(uv.x * (sub - 1));
        let y = Math.ceil(uv.y * (sub - 1)) + sub;
        y = sub - y;
        let i = x + y * sub;

        // top left
        let s0 = this.segments[i];
        // top right
        let s1 = this.segments[i + 1];
        // bottom left
        let s2 = this.segments[i + sub];
        // bottom right
        let s3 = this.segments[i + sub + 1];

        if (this.cutting && this.context.input.mousePressed) {
            s0.draw = false;
            if (!s0.connected.top?.draw)
                s1.left = null;
            if (!s0.connected.left?.draw)
                s2.top = null;
            if (!s1.connected.right?.draw)
                s3.top = null;
            if (!s1.draw)
                s3.top = null;
            if (!s2.connected.down?.draw)
                s3.left = null;
            if (!s2.draw)
                s3.left = null;

            window.parent?.postMessage({startCut: true}, "*");
        }
        else if (this.drawing && this.context.input.mousePressed) {
            window.dispatchEvent(new CustomEvent("clothDraw", { detail: { uv } }));
            window.parent?.postMessage({startSpray: true}, "*");
        }
        else {
            if (!s0.fixed) {
                s0.position.z += .0003;
            }
        }
    }
}