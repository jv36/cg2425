import { CGFappearance, CGFobject, CGFtexture } from '../lib/CGF.js';
import { MyPyramid } from './MyPyramid.js';
import { MyCylinder } from './MyCylinder.js'

/**
 * MyPyramid
 * @param gl {WebGLRenderingContext}
 * @constructor
*/

export class MyTree extends CGFobject {
    constructor(scene, stacks, radius, treeColor, sides) {
        super(scene);
        this.stacks = stacks;
        this.radius = radius;

        this.pyramid = new MyPyramid(scene, sides, 1);
        this.trunkHeight = this.stacks * 0.25;
        this.treelog = new MyCylinder(scene, 8, this.trunkHeight);

        this.logmaterial = new CGFappearance(this.scene);
        this.logmaterial.setAmbient(0.9, 0.9, 0.9, 1.0);
        this.logmaterial.setDiffuse(0.9, 0.9, 0.9, 1.0);
        this.logmaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.logmaterial.setShininess(10.0);
        
        try {
            this.woodTexture = new CGFtexture(this.scene, 'images/wood.jpg');
            this.logmaterial.setTexture(this.woodTexture);
            this.logmaterial.setTextureWrap('REPEAT', 'REPEAT');
        } catch (error) {
            console.error('Failed to load wood texture:', error);
        }

        this.treematerial = new CGFappearance(this.scene);
        this.treematerial.setAmbient(treeColor[0] * 0.5, treeColor[1] * 0.5, treeColor[2] * 0.5, treeColor[3]);
        this.treematerial.setDiffuse(treeColor[0] * 1.2, treeColor[1] * 1.2, treeColor[2] * 1.2, treeColor[3]);
        this.treematerial.setSpecular(0.1, 0.1, 0.1, 1);
        this.treematerial.setShininess(20.0);

        this.randomRotations = [];
        for (let i = 0; i < this.stacks * 4; i++) {
            this.randomRotations.push(Math.random() * Math.PI * 2);
        }
    }

    display() {
        for (let s = 0; s < this.stacks; s++) {
            const yOffset = s * 0.25;
            const scale = 1 - s * 0.1;
            
            // 4 overlapping pyramids for fuller appearance
            for (let p = 0; p < 4; p++) {
                this.scene.pushMatrix();
                
                this.scene.translate(0, yOffset, 0);
                
                // random rotation for natural variation
                this.scene.rotate(this.randomRotations[s * 4 + p], 0, 1, 0);
                
                const offset = 0.1 * scale;
                const heightAdjust = 0.05 * scale;
                switch(p) {
                    case 0: this.scene.translate(offset, heightAdjust, 0); break;
                    case 1: this.scene.translate(-offset, heightAdjust, 0); break;
                    case 2: this.scene.translate(0, heightAdjust, offset); break;
                    case 3: this.scene.translate(0, heightAdjust, -offset); break;
                }
                
                this.scene.scale(scale * 0.8, scale, scale * 0.8);
                
                this.treematerial.apply();
                this.pyramid.display();
                
                this.scene.popMatrix();
            }
        }

        // Draw trunk
        this.scene.pushMatrix();
        this.scene.translate(0, -0.35, 0);
        this.scene.scale(this.radius, 0.7, this.radius);
        this.logmaterial.apply();
        this.treelog.display();
        this.scene.popMatrix();        
    }
}