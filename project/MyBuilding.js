import { CGFappearance, CGFobject, CGFshader } from '../lib/CGF.js';
import { MyCube } from './MyCube.js';
import { MyQuad } from "./MyQuad.js";
import { CGFtexture } from '../lib/CGF.js';
/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
export class MyBuilding extends CGFobject {
    constructor(scene, texturesOrColor, quadMaterial, numFloors = 2, windowsPerFloor = 3) {
        super(scene);
        this.quadMaterial = quadMaterial;
        this.texturesOrColor = texturesOrColor;
        this.numFloors = numFloors;
        this.windowsPerFloor = windowsPerFloor;

        this.helipadState = "normal"; // "normal", "blinkingUp", "blinkingDown"
        this.transitionStartTime = null;
        this.transitionDuration = 1000; // 1 second for transition
        
        this.smallCube = new MyCube(scene, texturesOrColor, quadMaterial);
        this.middleCube = new MyCube(scene, texturesOrColor, quadMaterial);
        this.window = new MyQuad(scene);
        this.heli = new MyQuad(scene);
        this.door = new MyQuad(scene);
        this.sign = new MyQuad(scene);
        this.helipadTexture = new CGFtexture(scene, "images/helipad.png");
        this.helipadUpTexture = new CGFtexture(scene, "images/helipad_up.png");
        this.helipadDownTexture = new CGFtexture(scene, "images/helipad_down.png");
        this.windowTexture = new CGFtexture(scene, "images/window.jpg");
        this.doorTexture = new CGFtexture(scene, "images/garagedoor.jpg");
        this.signTexture = new CGFtexture(scene, "images/firedept.jpg");
        
        // corner lights
        this.pulseFrequency = 2;
        this.minEmission = 0.5;
        this.maxEmission = 1;
        this.pulseColor = [0.5, 0, 0]; // vermelho 
                
        this.cornerLightMaterial = new CGFappearance(scene);
        this.cornerLightMaterial.setAmbient(0, 0, 0, 1);
        this.cornerLightMaterial.setDiffuse(0, 0, 0, 1);
        this.cornerLightMaterial.setSpecular(0, 0, 0, 1);
        this.cornerLightMaterial.setShininess(10);
        this.cornerLightMaterial.setEmission(0, 0, 0, 1);
        this.cornerLight = new MyCube(scene, [1, 1, 1, 1], this.cornerLightMaterial);

        this.helipadShader = new CGFshader(scene.gl, "shaders/helipad.vert", "shaders/helipad.frag");
        this.helipadShader.setUniformsValues({ 
            uSampler1: 1,  // First texture
            uSampler2: 2,  // Second texture
            uMixFactor: 0.0
        });

        // track current and target textures for transitions
        this.currentTexture = this.helipadTexture;
        this.targetTexture = this.helipadTexture;
    }
    

    initBuffers() {
    }


    updatePulse(t) {
        if (this.helipadState === "blinkingUp" || this.helipadState === "blinkingDown") {
            const pulseProgress = (t % (1000/this.pulseFrequency)) / (1000/this.pulseFrequency);
            const pulseValue = this.minEmission + 
                (this.maxEmission - this.minEmission) * 
                Math.sin(pulseProgress * Math.PI);
            
            this.cornerLightMaterial.setEmission(
                this.pulseColor[0] * pulseValue,
                this.pulseColor[1] * pulseValue,
                this.pulseColor[2] * pulseValue,
                1
            );
        } else {
            // não há manobra
            this.cornerLightMaterial.setEmission(0, 0, 0, 1);
        }
    }

    
    resetHelipad() {
        this.transitionStartTime = Date.now();
        this.helipadState = "normal";
        this.currentTexture = this.helipadUpTexture || this.helipadDownTexture;
        this.targetTexture = this.helipadTexture;
        this.cornerLightMaterial.setEmission(0, 0, 0, 1);
    }


    display() {
        let middleScale = 1.25;
        let sideScaleY = 1;
        let unitHeight = 1;
        let unitWidth = 1;
        let yOffset = -0.5;
    
        for (let floor = 0; floor < this.numFloors; floor++) {
            let leftY = floor * unitHeight * sideScaleY + (unitHeight * sideScaleY) / 2 + yOffset;
            let rightY = leftY;
    
            // bloco esquerda
            this.scene.pushMatrix();
            this.scene.translate(-1.1 * unitWidth, leftY, 0);
            this.scene.scale(1, sideScaleY, 1);
            this.smallCube.display();
            this.scene.popMatrix();
    
            // janelas esquerda
            this.scene.pushMatrix();
            this.displayWindows(floor, unitHeight * sideScaleY, 1, -1.1 * unitWidth);
            this.scene.popMatrix();
    
            // bloco direita
            this.scene.pushMatrix();
            this.scene.translate(1.1 * unitWidth, rightY, 0);
            this.scene.scale(1, sideScaleY, 1);
            this.smallCube.display();
            this.scene.popMatrix();
    
            // janelas direita
            this.scene.pushMatrix();
            this.displayWindows(floor, unitHeight * sideScaleY, 1, 1.1 * unitWidth);
            this.scene.popMatrix();
        }
    
        // bloco do meio
        for (let floor = 0; floor < this.numFloors + 1; floor++) {
            let middleY = floor * unitHeight + unitHeight / 2 + yOffset;
    
            this.scene.pushMatrix();
            this.scene.translate(0, middleY, 0);
            this.scene.scale(middleScale, 1, middleScale);
            this.middleCube.display();
            this.scene.popMatrix();
            this.scene.pushMatrix();
            this.scene.popMatrix();
            if (floor != 0) {
                this.scene.pushMatrix();
                this.displayWindows(floor, unitHeight, middleScale, 0);
                this.scene.popMatrix();
            }
        }

        this.scene.pushMatrix();
        this.displayHeli();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.displaySign();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.displayDoor();
        this.scene.popMatrix();
    }
    
    displayWindows(floorIndex, floorHeight, blockScaleX = 1, xOffset = 0) {
        const totalWidth = blockScaleX;
        const spacingX = totalWidth / (this.windowsPerFloor + 0.1);
        const baseY = floorIndex * floorHeight + floorHeight / 2 - 0.5;
        const rowSpacingY = 0.25;
        
        this.quadMaterial.setAmbient(1, 1, 1, 1);
        this.quadMaterial.setDiffuse(1, 1, 1, 1);
        this.quadMaterial.setSpecular(0, 0, 0, 1);
        this.quadMaterial.setTexture(this.windowTexture);
        this.quadMaterial.apply();
    
        for (let row = 0; row < 2; row++) {
            let y = baseY + (row === 0 ? rowSpacingY : -rowSpacingY);
            for (let i = 1; i <= this.windowsPerFloor; i++) {
                let x = (i - (this.windowsPerFloor + 1) / 2) * spacingX;
    
                this.scene.pushMatrix();
                this.scene.translate(xOffset + x, y, 0.51 * blockScaleX);
                this.scene.scale(0.2, 0.2, 0.2);
                this.window.display();
                this.scene.popMatrix();
            }
        }
    }

    startHelipadBlinking(state) {
        this.transitionStartTime = Date.now();
        
        if (state === "up") {
            this.helipadState = "blinkingUp";
            this.currentTexture = this.helipadTexture;
            this.targetTexture = this.helipadUpTexture;
        } else if (state === "down") {
            this.helipadState = "blinkingDown";
            this.currentTexture = this.helipadTexture;
            this.targetTexture = this.helipadDownTexture;
        }
    }

    

    displayHeli() {
        const middleHeight = (this.numFloors + 1);
        const yOffset = -0.5;
        const yPosition = middleHeight + yOffset + 0.01;

        // corner
        const cornerSize = 0.15;
        const cornerOffset = 0.6
        this.updatePulse(Date.now());
        this.cornerLightMaterial.apply();

        // topleft corner
        this.scene.pushMatrix();
        this.scene.translate(-cornerOffset, yPosition + 0.02, -cornerOffset);
        this.scene.scale(cornerSize, cornerSize, cornerSize);
        this.cornerLight.display();
        this.scene.popMatrix();

        // topright corner
        this.scene.pushMatrix();
        this.scene.translate(cornerOffset, yPosition + 0.02, -cornerOffset);
        this.scene.scale(cornerSize, cornerSize, cornerSize);
        this.cornerLight.display();
        this.scene.popMatrix();

        // bottomleft corner
        this.scene.pushMatrix();
        this.scene.translate(-cornerOffset, yPosition + 0.02, cornerOffset);
        this.scene.scale(cornerSize, cornerSize, cornerSize);
        this.cornerLight.display();
        this.scene.popMatrix();

        // bottomright corner
        this.scene.pushMatrix();
        this.scene.translate(cornerOffset, yPosition + 0.02, cornerOffset);
        this.scene.scale(cornerSize, cornerSize, cornerSize);
        this.cornerLight.display();
        this.scene.popMatrix();

        // cálculo da transição
        let mixFactor = 0;
        if (this.transitionStartTime !== null) {
            const elapsed = Date.now() - this.transitionStartTime;
            mixFactor = Math.min(elapsed / this.transitionDuration, 1.0);
            
            if (mixFactor >= 1.0) {
                this.currentTexture = this.targetTexture;
                this.transitionStartTime = null;
            }
        }

        this.scene.setActiveShader(this.helipadShader);
        this.helipadShader.setUniformsValues({ uMixFactor: mixFactor });

        this.currentTexture.bind(1);
        this.targetTexture.bind(2);

        // Display helipad
        this.scene.pushMatrix();
        this.scene.translate(0, yPosition, 0);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(1.25, 1.25, 1.25);
        this.quadMaterial.apply();
        this.heli.display();
        this.scene.popMatrix();
        
        this.scene.setActiveShader(this.scene.defaultShader);
    }


    displaySign() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0.3, 0.51 * 1.25); // front face of middle cube
        this.scene.scale(1, 0.2, 1); // scale to a reasonable size
        this.quadMaterial.setAmbient(1, 1, 1, 1);
        this.quadMaterial.setDiffuse(1, 1, 1, 1);
        this.quadMaterial.setSpecular(0, 0, 0, 1);
        this.quadMaterial.setTexture(this.signTexture);
        this.quadMaterial.apply();
        this.sign.display();
        this.scene.popMatrix();
    }
    
    displayDoor() {
        this.scene.pushMatrix();
        this.scene.translate(0, -0.25, 0.51 * 1.25); // just below sign
        this.scene.scale(0.8, 0.6, 1); // door size
        this.quadMaterial.setAmbient(1, 1, 1, 1);
        this.quadMaterial.setDiffuse(1, 1, 1, 1);
        this.quadMaterial.setSpecular(0, 0, 0, 1);
        this.quadMaterial.setTexture(this.doorTexture);
        this.quadMaterial.apply();
        this.door.display();
        this.scene.popMatrix();
    }
    
    

    
    
    
}