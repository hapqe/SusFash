import { Animator, Behaviour, GameObject, getComponent, MeshRenderer, ParticleSystem, Rigidbody, serializable, SkinnedMeshRenderer } from '@needle-tools/engine';
import { Transform } from '@needle-tools/engine/engine-schemes/transform';
import { Physics } from '@needle-tools/engine/engine/engine_physics';
import { CollisionDetectionMode } from '@needle-tools/engine/engine/engine_physics.types';
import { ICollider } from '@needle-tools/engine/engine/engine_types';
import { MeshBasicMaterial, Vector2, Vector3 } from 'three';
import * as THREE from 'three';

export class PlayerController extends Behaviour {
    setTexture(map: THREE.Texture) {
        // @ts-ignore  
        this.shirt.sharedMaterial.map = map;

        this.shirt.sharedMaterial.needsUpdate = true;
    }

    speed = .8;

    rigidbody!: Rigidbody;

    startPos = { x: 0, y: 0 };
    velocity = new Vector3();
    click = false;
    joy = document.getElementById('joy')!;

    @serializable(SkinnedMeshRenderer)
    body!: SkinnedMeshRenderer;
    @serializable(SkinnedMeshRenderer)
    shirt!: SkinnedMeshRenderer;

    @serializable(ParticleSystem)
    particles!: ParticleSystem;

    @serializable(Animator)
    animator!: Animator;

    boosted = false;

    awake(): void {
        const possibleColors = ['#ff4646', '#57ff57', '#6e6eff', '#c069ff'];
        const color = possibleColors[Math.floor(Math.random() * possibleColors.length)];

        // @ts-ignore
        this.body.sharedMaterial.color.set(color);

        this.rigidbody = this.gameObject.getComponent(Rigidbody)!;

        window.addEventListener('pointerdown', (e) => {
            this.click = true;
            this.joy.hidden = false;
            const s = this.joy.clientWidth;
            this.joy.hidden = true;

            const { x, y } = this.pos(e);

            this.joy.style.left = `${x - s! / 2}px`;
            this.joy.style.top = `${y - s! / 2}px`;

            this.startPos = { x, y };
        });

        const isOnMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (!isOnMobile)
            window.addEventListener('pointermove', (e) => {
                this.move(e);
            });
        else
            window.addEventListener('touchmove', (e) => {
                this.move(e.touches[0]);
            });


        window.addEventListener('pointerup', () => {
            this.endMove();
        });

        window.addEventListener('touchend', () => {
            this.endMove();
        });

        document.body.addEventListener('touchstart', function (e) { e.preventDefault(); });
    }

    pos(e: any, m = 100) {
        const x = Math.max(m, Math.min(window.innerWidth - m, e.clientX));
        const y = Math.max(m, Math.min(window.innerHeight - m, e.clientY));
        return { x, y };
    }

    move(e: any) {
        if (!this.click) return;

        this.joy.hidden = false;
        const sensitivity = 0.001;

        const { x, y } = this.pos(e, 0);
        const delta = { x: x - this.startPos.x, y: y - this.startPos.y };
        let mag = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
        mag *= sensitivity;
        mag = 1 + mag;
        mag = Math.min(1.2, mag);

        const r = Vector2.prototype.angle.call(delta);

        this.joy.style.transform = `rotate(${r}rad) scaleX(${mag})`;

        this.velocity = new Vector3(delta.x, 0, delta.y);
        this.velocity.normalize();
        this.velocity.multiplyScalar(this.speed);
        this.velocity.multiplyScalar(this.boosted ? 3 : 1);
        this.velocity.negate();
    }

    endMove() {
        this.click = false;
        this.joy.hidden = true;
        this.joy.style.transform = `rotate(0rad) scaleX(1) translateX(0px)`;
        this.velocity = new Vector3(0, 0, 0);
    }

    update(): void {
        let v = this.velocity.clone().multiplyScalar(this.context.time.deltaTime * 100);

        // @ts-ignore
        this.rigidbody.setVelocity(v);

        this.setDirection();
    }

    isRunning = false;
    stepped = false;

    setDirection() {
        const s = this.velocity.length();
        if (!this.isRunning && s > 0.1) {
            this.animator.SetTrigger('run');
        }

        if (this.isRunning && s < 0.1) {
            this.animator.SetTrigger('idle');
        }

        if(this.isRunning && !this.stepped) {
            window.parent.postMessage({playstep: true}, '*');
            setTimeout(() => {
                this.stepped = false;
            }, 500);
            this.stepped = true;
        }

        this.isRunning = false;

        if (s < 0.1) return;

        this.isRunning = true;

        const dir = this.velocity.clone();
        dir.y = 0;
        dir.normalize();
        const angle = Math.atan2(dir.x, dir.z);
        this.animator.gameObject.rotation.y = angle + Math.PI / 2;
    }
}