import { CGFobject } from '../lib/CGF.js';
import { MySphere } from './MySphere.js';
import { MyScene } from './MyScene.js';
import { CGFappearance, CGFtexture } from '../lib/CGF.js';

/**
 * MyPanorama
 * @constructor
 * @param scene - Referência ao objeto MyScene
 * @param texture - Textura do panorama
 *  */
export class MyPanorama extends CGFobject {
    constructor(scene, texture) {
        super(scene);
        this.texture = texture;
        this.initBuffers();
    }

    initBuffers() {
        this.sphere = new MySphere(this.scene, 300, 20, true);
        this.appearance = new CGFappearance(this.scene);
        this.appearance.setAmbient(0.3, 0.3, 0.3, 1.0);
        this.appearance.setDiffuse(0.7, 0.7, 0.7, 1.0);
        this.appearance.setSpecular(0.0, 0.0, 0.0, 1.0);
        this.appearance.setShininess(120.0);
        this.textureObj = new CGFtexture(this.scene, this.texture);
        this.appearance.setTexture(this.textureObj);
        this.appearance.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.scene.camera.position[0], this.scene.camera.position[1], this.scene.camera.position[2]);
        this.scene.scale(300, 300, 300);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.appearance.apply();
        this.sphere.display();
        this.scene.popMatrix();
    }
}