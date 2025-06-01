import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MyBuilding } from "./MyBuilding.js";
import { MyPanorama } from "./MyPanorama.js";
import { MyPlane } from "./MyPlane.js";
import { MyFire } from './MyFire.js';
import { MyLake } from "./MyLake.js";
import { MyHeli } from "./MyHeli.js";
import { MyForest } from "./MyForest.js";
import { MyGrass } from "./MyGrass.js";
import { MyFirePlace } from "./MyFirePlace.js";

/**
 * MySphene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
  }
  init(application) {
    super.init(application);

    this.initCameras();
    this.initLights();

    //Background color
    this.gl.clearColor(0, 0, 0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.enableTextures(true);

    this.setUpdatePeriod(50);

    //Initialize scene objects
    this.axis = new CGFaxis(this, 20, 1);
    this.panorama = new MyPanorama(this, "images/panorama_rural.jpg")
    this.plane = new MyPlane(this, 64);

    this.defaultMaterial = new CGFappearance(this);
    this.defaultMaterial.setAmbient(0.2, 0.2, 0.2, 1);
    this.defaultMaterial.setDiffuse(0.8, 0.8, 0.8, 1);
    this.defaultMaterial.setSpecular(0.1, 0.1, 0.1, 1);
    this.defaultMaterial.setShininess(10.0);


    // Aparência da Terra (material com textura)
    this.earth_appearance = new CGFappearance(this);
    this.earth_appearance.setAmbient(0.3, 0.3, 0.3, 1.0);
    this.earth_appearance.setDiffuse(0.7, 0.7, 0.7, 1.0);
    this.earth_appearance.setSpecular(0.0, 0.0, 0.0, 1.0);
    this.earth_appearance.setShininess(120.0);
    this.earthTexture = new CGFtexture(this, "images/panorama_rural.jpg");
    this.earth_appearance.setTexture(this.earthTexture);

    // grass 
    this.grassMaterial = new CGFappearance(this);
    this.grassMaterial.setAmbient(0.3, 0.3, 0.3, 1.0);
    this.grassMaterial.setDiffuse(0.7, 0.7, 0.7, 1.0);
    this.grassMaterial.setSpecular(0.0, 0.0, 0.0, 1.0);
    this.grassMaterial.setShininess(10.0);
    this.grassTexture = new CGFtexture(this, "images/grass2.jpg");
    this.grassMaterial.setTexture(this.grassTexture);
    this.grassMaterial.setTextureWrap('REPEAT', 'REPEAT');

    /*
    this.grassBladeMaterial = new CGFappearance(this);
    this.grassBladeMaterial.setAmbient(0.2, 0.8, 0.2, 1.0);
    this.grassBladeMaterial.setDiffuse(0.2, 0.8, 0.2, 1.0);
    this.grassBladeMaterial.setSpecular(0.0, 0.0, 0.0, 1.0);
    this.grassBladeMaterial.setShininess(10.0);

    this.grassPatches = [];
    this.grassPositions = [];
    const numPatches = 400;

  
    const gridSize = 20;
    const spacing = 140.0 / gridSize;
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Base position on grid
            const baseX = (col - gridSize/2) * spacing;
            const baseZ = (row - gridSize/2) * spacing;
            
            // Add some randomness to the position
            const offsetX = (Math.random() - 0.5) * spacing * 0.5;
            const offsetZ = (Math.random() - 0.5) * spacing * 0.5;
            
            this.grassPatches.push(new MyGrass(this, 1));
            this.grassPositions.push({
                x: baseX + offsetX,
                z: baseZ + offsetZ
            });
        }
    }
    */

    this.quadMaterial = new CGFappearance(this);
    this.quadMaterial.setAmbient(0.1, 0.1, 0.1, 1);
    this.quadMaterial.setDiffuse(0.9, 0.9, 0.9, 1);
    this.quadMaterial.setSpecular(0.1, 0.1, 0.1, 1);
    this.quadMaterial.setShininess(10.0);
    this.quadMaterial.setTextureWrap('REPEAT', 'REPEAT');
    
    this.building = new MyBuilding(this, [0.98, 0.98, 0.98, 1], this.quadMaterial);
    
    let colors = [
      [1, 0, 0, 1], // top
      [0, 1, 0, 1], // bottom
      [0, 0, 1, 1], // front
      [1, 1, 0, 1], // back
      [1, 0, 1, 1], // right
      [0, 1, 1, 1], // left
    ];
    
    this.heli = new MyHeli(this, colors, this.defaultMaterial);
    
    //this.tree = new MyTree(this, 6, 10, [0, 0.4, 0.12, 1]);
    this.lake = new MyLake(this, -6, 2, 6); 
    this.forest = new MyForest(this, 4, 4); // por exemplo
    this.firePlace = new MyFirePlace(this, this.forest, 0.6); // densidade ajustável
    //this.bucketAscendTarget = 13; // altura desejada após encher o balde
    this.speedFactor = 1; // valor inicial
    this.displayAxis = false;
  }

  initLights() {
    this.lights[0].setPosition(200, 200, 200, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
  }

  initCameras() {
    this.camera = new CGFcamera(
      0.8,
      0.1,
      1000,
      vec3.fromValues(100, 100, 100),
      vec3.fromValues(0, 0, 0)
    );
  }
  checkKeys() {
    const speed = this.speedFactor;

    if (this.gui.isKeyPressed("KeyW")) this.heli.accelerate(0.05 * speed);
    if (this.gui.isKeyPressed("KeyS")) this.heli.accelerate(-0.05 * speed);
    if (this.gui.isKeyPressed("KeyA")) this.heli.turn(0.05 * speed);
    if (this.gui.isKeyPressed("KeyD")) this.heli.turn(-0.05 * speed);
    if (this.gui.isKeyPressed("KeyR")) this.heli.reset();
    if (this.gui.isKeyPressed("KeyL")) {
      if (this.heli.isOverLake(this.lake)) {
          this.building?.resetHelipad(); // ← força o heliporto a mostrar "H"
    
          if (!this.heli.bucketFilled) {
          this.heli.descend();
      } else {
              this.heli.ascend();
          }
      }  
    } else if (this.gui.isKeyPressed("KeyP")) {
      this.heli.ascend(); // sobe normalmente (sem limite)
  } else {
      this.heli.neutralVertical();
  }
  

    // Handle water release with 'O' key
    if (this.gui.isKeyPressed("KeyO")) {
      this.heli.releaseWater();
    } else {
      this.heli.stopWaterRelease();
      }
  }

  update(t) {
    this.heli.update(t - this.lastTime || 0, this.speedFactor);
    this.firePlace.updateFires(t);
    this.lake.update();

    const firePositions = this.firePlace.getFirePositions();
    for (const firePosition of firePositions) {
      if (this.heli.isWaterOverFire(firePosition)) {
        console.log("Water hit fire at position:", firePosition);
        this.firePlace.extinguishFire(firePosition);
        break; // Only extinguish one fire at a time
      }
    }
    
    this.lastTime = t;
    this.checkKeys();
  }

  setDefaultAppearance() {
    this.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setShininess(10.0);
  }
  display() {
    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();
    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.setDefaultAppearance();
    // Draw axis
    if (this.displayAxis) {
      this.axis.display();
    }

    this.pushMatrix();
    this.scale(3, 3, 3);
    this.heli.display();
    this.popMatrix();    

    this.pushMatrix();
    this.scale(150, 1, 150);
    this.rotate(-Math.PI / 2, 1, 0, 0);
    this.grassMaterial.apply();
    this.plane.display();
    this.popMatrix();

    /*
    // Display 3D grass patches (off for now - vic)

    this.grassBladeMaterial.apply();
    this.gl.disable(this.gl.CULL_FACE);
    for (let i = 0; i < this.grassPatches.length; i++) {
        this.pushMatrix();
        const pos = this.grassPositions[i];
        this.translate(pos.x, 0.01, pos.z);
        this.scale(3, 3, 3);
        this.grassPatches[i].display();
        this.popMatrix();
    }
    */

    this.gl.enable(this.gl.CULL_FACE);

    this.pushMatrix();
    this.scale(10, 10, 10);
    this.translate(0, 0.5, -5.5)
    this.building.display();
    this.popMatrix();

    let treeTransl = 0.5
    this.pushMatrix();
    this.scale(10, 10, 10);
    this.translate(0, treeTransl, 0);
    this.pushMatrix();
    this.translate(2, -0.5, -1);
    this.lake.display();
    this.popMatrix();

    this.forest.display();
    this.firePlace.display();

    this.popMatrix();

    this.pushMatrix();
    this.panorama.display();
    this.popMatrix();


  }
}
