import { CGFobject, CGFappearance, CGFshader } from '../lib/CGF.js';
import { MyPyramid } from './MyPyramid.js';

export class MyFire extends CGFobject {
    constructor(scene) {
        super(scene);

        // rounder
        this.pyramid = new MyPyramid(scene, 12, 1);

        // Fire state
        this.isExtinguished = false;
        this.extinguishProgress = 0; // 0 to 1, where 1 means fully extinguished
        this.startTime = Date.now();

        this.shader = new CGFshader(scene.gl, "shaders/fire.vert", "shaders/fire.frag");
        this.shader.setUniformsValues({ timeFactor: 0 });

        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(1.0, 0.4, 0.0, 1.0);
        this.appearance.setDiffuse(1.0, 0.3, 0.0, 1.0);
        this.appearance.setSpecular(1.0, 0.5, 0.0, 1.0);
        this.appearance.setEmission(1.0, 0.4, 0.0, 1.0);
        this.appearance.setShininess(20.0);

        this.extinguishedAppearance = new CGFappearance(scene);
        this.extinguishedAppearance.setAmbient(0.2, 0.2, 0.2, 1.0);
        this.extinguishedAppearance.setDiffuse(0.2, 0.2, 0.2, 1.0);
        this.extinguishedAppearance.setSpecular(0.2, 0.2, 0.2, 1.0);
        this.extinguishedAppearance.setEmission(0.0, 0.0, 0.0, 1.0);
        this.extinguishedAppearance.setShininess(10.0);

        this.baseScale = 0.5;
        this.pulseAmount = 0.1;
    }

    update(t) {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - this.startTime) / 1000.0;

        this.shader.setUniformsValues({ 
            timeFactor: elapsedTime * 1.05,
            pulseAmount: this.pulseAmount
        });
    }

    extinguish() {
        if (!this.isExtinguished) {
            this.extinguishProgress += 0.2;
            if (this.extinguishProgress >= 1) {
                this.isExtinguished = true;
                this.extinguishProgress = 1;
            }
        }
    }

    reset() {
        this.isExtinguished = false;
        this.extinguishProgress = 0;
        this.startTime = Date.now();
    }

    display() {
        this.scene.pushMatrix();
        
        if (!this.isExtinguished) {
            this.scene.setActiveShader(this.shader);
            this.appearance.apply();

            // pulsing scale based on time
            const pulseScale = 1.0 + Math.sin(Date.now() / 200) * 0.1;
            
            // Translate to ground level
            this.scene.translate(0, 0.5, 0);
            
            // Apply rounded scaling
            const baseWidth = this.baseScale * pulseScale;
            this.scene.scale(baseWidth, 1.2, baseWidth); // Slightly taller for flame shape
            
            // a slight rotation animation
            this.scene.rotate(Math.sin(Date.now() / 300) * 0.1, 0, 1, 0);
            
        } else {
            this.scene.setActiveShader(this.scene.defaultShader);
            this.extinguishedAppearance.apply();
            
            // extinguished state is slightly smaller
            this.scene.translate(0, 0.5, 0);
            this.scene.scale(this.baseScale * 0.8, 0.8, this.baseScale * 0.8);
        }

        this.pyramid.display();
        this.scene.setActiveShader(this.scene.defaultShader);
        this.scene.popMatrix();
    }
}