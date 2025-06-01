import { CGFobject } from '../lib/CGF.js';
import { MyQuad } from "./MyQuad.js";

export class MyCube extends CGFobject {
    // appearanceInput -> array of CGFTextures or a single color [r, g, b, a] or an array of 6 [r,g,b,a] colors
    constructor(scene, appearanceInput, quadMaterial) {
        super(scene);
        this.quad = new MyQuad(scene);
        this.quadMaterial = quadMaterial;        
    
        if (Array.isArray(appearanceInput[0])) {
            // Array of colors (6 RGBA arrays)
            this.isColor = true;
            this.color = appearanceInput;
        } else if (typeof appearanceInput[0] === 'number' && appearanceInput.length === 4) {
            // Single color, replicate for all 6 faces
            this.isColor = true;
            this.color = Array(6).fill(appearanceInput);
        } else {
            // Array of textures
            this.isColor = false;
            this.textures = appearanceInput;
        }
    
        this.initBuffers();
    }

    applyFaceAppearance(index) {
        if (this.isColor) {
            this.quadMaterial.setTexture(null);
            const [r, g, b, a] = this.color[index] || [1, 1, 1, 1];
            this.quadMaterial.setAmbient(r, g, b, a);
            this.quadMaterial.setDiffuse(r, g, b, a);
            this.quadMaterial.setSpecular(0.1, 0.1, 0.1, a);
            this.quadMaterial.setShininess(1.0);
        } else {
            this.quadMaterial.setTexture(this.textures[index]);
        }
        this.quadMaterial.apply();
    }

    display() {
        const transforms = [
            () => { this.scene.rotate(-Math.PI / 2, 1, 0, 0); this.scene.translate(0, 0, 0.5); }, // top
            () => { this.scene.rotate(Math.PI / 2, 1, 0, 0); this.scene.translate(0, 0, 0.5); },  // bottom
            () => { this.scene.translate(0, 0, 0.5); },                                           // front
            () => { this.scene.rotate(Math.PI, 0, 1, 0); this.scene.translate(0, 0, 0.5); },      // back
            () => { this.scene.rotate(-Math.PI / 2, 0, 1, 0); this.scene.translate(0, 0, 0.5); }, // right
            () => { this.scene.rotate(Math.PI / 2, 0, 1, 0); this.scene.translate(0, 0, 0.5); },  // left
        ];

        for (let i = 0; i < 6; i++) {
            this.applyFaceAppearance(i);
            this.scene.pushMatrix();
            transforms[i]();
            this.quad.display();
            this.scene.popMatrix();
        }
    }
}
