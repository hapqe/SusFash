import { Behaviour, Camera, ControlTrackHandler, getComponent, Gizmos, MeshRenderer, Raycaster, serializeable } from "@needle-tools/engine";
import { Intersection, Mesh, Object3D, Ray, Vec2, Vector3 } from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils";
import * as THREE from "three";
import { Cloth } from "./Cloth";
import { Vec3 } from "@needle-tools/engine/engine/engine_types";
import { CircularBuffer } from "@needle-tools/engine/engine/engine_utils";
import { getWorldPosition } from "@needle-tools/engine/engine/engine_three_utils";

export class MeshHandler extends Behaviour {
    renderer?: MeshRenderer;
    private cloth?: Cloth;

    @serializeable(Object3D)
    positionTest?: Object3D;

    awake() {
        this.renderer = getComponent(this.gameObject, MeshRenderer);
        this.cloth = getComponent(this.gameObject, Cloth);
    }

    start() {
        window.addEventListener("fixedUpdate", () => {
            this.setMesh();
            this.rayCast();
        });
        window.addEventListener("pointerup", () => {
            this.mousePoint = undefined;
        });
        window.addEventListener("touchend", () => {
            this.mousePoint = undefined;
        });
    }

    private mousePoint?: Intersection;
    get point() {
        return this.mousePoint;
    }

    setMesh() {
        if (this.renderer && this.cloth) {
            let geometry = new THREE.BufferGeometry();

            let positions: Vec3[] = [];
            let uvs: Vec2[] = [];

            this.cloth.segments.forEach(seg => {
                let a = seg;
                let b = seg.top?.seg;
                let c = seg.left?.seg;
                let d = seg.diagonal?.seg;

                if (d?.draw && a && b && c && d){
                    positions.push(a.position, b.position, d.position, a.position, d.position, c.position);

                    uvs.push(a.uv, b.uv, d.uv, a.uv, d.uv, c.uv);
                }
            });

            const positionFloats = new Float32Array(positions.flatMap(p => [p.x, p.y, p.z]));
            const uvFloats = new Float32Array(uvs.flatMap(p => [p.x, p.y]));

            geometry.setAttribute('position', new THREE.BufferAttribute(positionFloats, 3));
            geometry.setAttribute('uv', new THREE.BufferAttribute(uvFloats, 2));
            // geometry = mergeVertices(geometry);
            geometry.computeVertexNormals();

            if (this.renderer.sharedMesh) {
                // @ts-ignore
                this.renderer.sharedMesh.geometry = geometry;
            }
        }
    }

    rayCast() {
        const mesh = this.renderer?.sharedMesh;
        if (mesh && this.context.input.mousePressed) {
            let size = new THREE.Vector2(this.context.domWidth, this.context.domHeight);
            let screenPoint = this.context.input.mousePosition.clone().
            // @ts-ignore
            divide(size).
            multiplyScalar(2).
            subScalar(1);
            screenPoint.y = -screenPoint.y;

            let rayCaster = new THREE.Raycaster();

            // @ts-ignore
            rayCaster.setFromCamera(screenPoint, this.context.mainCamera as THREE.Camera);

            let i: Intersection[] = [];
            // @ts-ignore
            mesh.raycast(rayCaster, i);
            this.mousePoint = i[0];
        }
    }
}