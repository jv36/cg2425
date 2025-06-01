import { CGFobject, CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MyCircle } from "./MyCircle.js";

export class MyLake extends CGFobject {
    constructor(scene, x, z, radius = 5) {
        super(scene);
        this.scene = scene;
        this.position = { x, z };
        this.radius = radius;

        this.waterShader = new CGFshader(scene.gl, "shaders/water.vert", "shaders/water.frag");
        
        this.lakeMaterial = new CGFappearance(scene);
        this.lakeMaterial.setAmbient(0.2, 0.3, 0.5, 1);
        this.lakeMaterial.setDiffuse(0.5, 0.6, 0.8, 1);
        this.lakeMaterial.setSpecular(0.7, 0.8, 1, 1);
        this.lakeMaterial.setShininess(100);
        
        this.lakeTexture = new CGFtexture(scene, "images/waterTex.jpg");
        this.lakeMaterial.setTexture(this.lakeTexture);
        this.lakeMaterial.setTextureWrap('REPEAT', 'REPEAT');

        this.waterMap = new CGFtexture(scene, "texture/waterMap.jpg");

        this.circle = new MyCircle(scene, 64, true);

        this.startTime = Date.now();
    }

    update() {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - this.startTime) / 5000.0; // Convert to seconds
        this.waterShader.setUniformsValues({ timeFactor: elapsedTime });
    }

    display() {
        // Store current shader state
        const previousShader = this.scene.activeShader;
        
        this.scene.pushMatrix();
    
        this.scene.translate(this.position.x, 0.01, this.position.z);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.scene.scale(this.radius * 1, this.radius * 0.5, 1);

        this.scene.setActiveShader(this.waterShader);
        
        this.lakeMaterial.apply();
        this.lakeTexture.bind(0);
        this.waterMap.bind(1);
        this.circle.display();

        this.waterMap.unbind(1);
        this.lakeTexture.unbind(0);
        this.scene.setActiveShader(previousShader);
        
        this.scene.popMatrix();
    }
}