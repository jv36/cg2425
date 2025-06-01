import { CGFobject } from '../lib/CGF.js';
import { MyQuad } from "./MyQuad.js";

export class MyGrass extends CGFobject {
    constructor(scene, numBlades = 5) {
        super(scene);
        this.numBlades = numBlades;
        this.quad = new MyQuad(scene);
        
        // Generate fixed positions and properties for each blade
        this.blades = [];
        for (let i = 0; i < numBlades; i++) {
            this.blades.push({
                x: (Math.random() - 0.5) * 0.4,  // Slightly wider spread
                z: (Math.random() - 0.5) * 0.4,  // Slightly wider spread
                height: 0.4 + Math.random() * 0.6,  // Taller grass
                width: 0.08 + Math.random() * 0.08,  // Wider blades
                rotation: Math.random() * Math.PI * 2,
                tiltX: (Math.random() - 0.5) * 0.1,
                tiltZ: (Math.random() - 0.5) * 0.1
            });
        }
        
        this.initBuffers();
    }

    initBuffers() {
        // No need for buffers as we're using MyQuad
    }

    display() {
        // Display each blade using its stored properties
        for (let blade of this.blades) {
            // First blade
            this.scene.pushMatrix();
            this.scene.translate(blade.x, 0, blade.z);
            this.scene.rotate(blade.rotation, 0, 1, 0);
            this.scene.rotate(blade.tiltX, 1, 0, 0);
            this.scene.rotate(blade.tiltZ, 0, 0, 1);
            this.scene.scale(blade.width, blade.height, 1);
            this.quad.display();
            this.scene.popMatrix();

            // Second blade
            this.scene.pushMatrix();
            this.scene.translate(blade.x + 0.04, 0, blade.z + 0.04);
            this.scene.rotate(blade.rotation + Math.PI/3, 0, 1, 0);
            this.scene.rotate(blade.tiltX, 1, 0, 0);
            this.scene.rotate(blade.tiltZ, 0, 0, 1);
            this.scene.scale(blade.width, blade.height * 0.9, 1);
            this.quad.display();
            this.scene.popMatrix();

            // Third blade
            this.scene.pushMatrix();
            this.scene.translate(blade.x - 0.03, 0, blade.z + 0.03);
            this.scene.rotate(blade.rotation - Math.PI/3, 0, 1, 0);
            this.scene.rotate(blade.tiltX, 1, 0, 0);
            this.scene.rotate(blade.tiltZ, 0, 0, 1);
            this.scene.scale(blade.width, blade.height * 0.8, 1);
            this.quad.display();
            this.scene.popMatrix();

            // Fourth blade for more density
            this.scene.pushMatrix();
            this.scene.translate(blade.x + 0.02, 0, blade.z - 0.03);
            this.scene.rotate(blade.rotation + Math.PI/4, 0, 1, 0);
            this.scene.rotate(blade.tiltX, 1, 0, 0);
            this.scene.rotate(blade.tiltZ, 0, 0, 1);
            this.scene.scale(blade.width, blade.height * 0.85, 1);
            this.quad.display();
            this.scene.popMatrix();
        }
    }
} 