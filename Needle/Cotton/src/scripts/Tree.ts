import { AudioSource, Behaviour, MeshRenderer, Rigidbody } from '@needle-tools/engine';
import { Material, Vector3 } from 'three';
import { lerp } from 'three/src/math/MathUtils';

export class Tree extends Behaviour {
    private material?: Material;

    snapBackSpeed = 15;
    windSpeed = 1.0;
    windStrength = 0.05;

    private snapBackFactor = 10e6;
    dragged = false;
    private _angle = 0;
    private _bend = 0;

    private bendAudio?: AudioSource;
    private audio?: AudioSource;


    set angle(value: number) {
        this._angle = value;
        this.uniforms(value);
    }
    
    private uniforms(angle: number) {
        this._bend = angle;
        if(this.material)
        // @ts-ignore
        this.material.uniforms._Angle.value = angle;
    }

    get angle() {
        return this._angle;
    }
    
    awake(): void {
        // @ts-ignore
        this.material = this.gameObject.getComponent(MeshRenderer)?.sharedMaterial;
        [this.bendAudio, this.audio] = this.gameObject.getComponents(AudioSource);
        this.disableAttraction();
    }

    start(): void {
        this.bendAudio!.clip = 'sounds/tin.mp3';

        window.addEventListener('reset', () => {
            this.dragged = false;
            this.angle = 0;
        });
    }

    update(): void {
        this.bendAudio!.volume = this._bend;
        if(this.bendAudio?.Sound)
        this.bendAudio.Sound.detune = this._bend;
        
        if(this.dragged) return;

        let w = this.windStrength * Math.sin(this.context.time.time * this.windSpeed);
        let f = 0;
        if(this.snapBackFactor === 0){
            f = 1;
        }
        else {
            let u = Math.max(0, this.snapBackFactor - 10);
            u = Math.exp(u) + this.snapBackFactor - 1;
            f = Math.sin(this.snapBackFactor) / u;
        }
        let a = lerp(w, this.angle, f);

        this.uniforms(a);
        
        this.snapBackFactor += this.context.time.deltaTime * this.snapBackSpeed;
    }

    snap() {
        this.audio?.stop();
        this.audio!.volume = this._bend;
        this.audio?.play('sounds/spring.mp3');
        
        this.disableAttraction();
        this.dragged = false;
        this.snapBackFactor = 0;
    }

    setAttractionPoint(point: Vector3) {
        if(this.material)
        // @ts-ignore
        this.material.uniforms._Attraction.value = point;
    }

    setDelta(delta: Vector3) {
        if(this.material)
        // @ts-ignore
        this.material.uniforms._Delta.value = delta.sub(new Vector3(0, .06, 0));
    }
    
    disableAttraction() {
        if(this.material)
        // @ts-ignore
        this.material.uniforms._Attraction.value = new Vector3(0, 0, 1000);
    }
    
    set bendSound(value: boolean) {
        if(this.bendAudio) {
            if(value) {
                this.bendAudio.play();
            }
            else {
                this.bendAudio.stop();
            }
        }
    }
    
    bend(position: Vector3, angle?: number) {
        const eps = 1e-5;
    
        let a = angle??this._bend;
        if(Math.abs(a) < eps) {
            a = eps;
        }

        let pos = position;

        const r = 1 / Math.tan(a) + pos.x + a * .42;

        pos.x += (Math.cos(a * pos.y) - 1) * r;
        pos.y = Math.sin(a * pos.y) * r;

        return pos;
    }
}