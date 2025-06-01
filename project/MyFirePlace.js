import { CGFobject } from "../lib/CGF.js";
import { MyFire } from "./MyFire.js";

export class MyFirePlace extends CGFobject {
    constructor(scene, forest, density = 0.2) {
        super(scene);
        this.fires = [];
        this.activeFireIndex = 0; // Track which fire is currently active

        const spacing = forest.spacing;
        const areaWidth = forest.cols * spacing;
        const areaDepth = forest.rows * spacing;

        const rows = forest.rows;
        const cols = forest.cols;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (Math.random() < density) {
                    const xOffset = (Math.random() - 0.5) * spacing;
                    const zOffset = (Math.random() - 0.5) * spacing;

                    const x = j * spacing + xOffset;
                    const z = i * spacing + zOffset;

                    const scaleX = 0.4 + Math.random();
                    const scaleY = 0.6 + Math.random();
                    const scaleZ = 0.4 + Math.random();

                    this.fires.push({
                        fire: new MyFire(scene),
                        x, z, scaleX, scaleY, scaleZ,
                        isExtinguished: false
                    });
                }
            }
        }
    }

    updateFires(t) {
        for (let f of this.fires) {
            f.fire.update(t);
        }
    }
    
    getFirePositions() {
        if (this.fires.length === 0) {
            return [];
        }
        return this.fires.map(fire => ({
            x: fire.x,
            z: fire.z
        }));
    }


    getFirePosition() {
        if (this.fires.length === 0) return { x: 0, z: 0 };
        const activeFire = this.fires[this.activeFireIndex];
        return { x: activeFire.x, z: activeFire.z };
    }

    // Extinguish
    extinguishFire() {
        if (this.fires.length === 0) return;
        
        const activeFire = this.fires[this.activeFireIndex];
        if (!activeFire.isExtinguished) {
            // Remove the fire completely
            this.fires.splice(this.activeFireIndex, 1);
            
            // If we removed the last fire, reset the index
            if (this.fires.length === 0) {
                this.activeFireIndex = 0;
            } else {
                // Otherwise, adjust the index to point to the next fire
                this.activeFireIndex = this.activeFireIndex % this.fires.length;
            }
        }
    }

    display() {
        for (let f of this.fires) {
            this.scene.pushMatrix();
            this.scene.translate(f.x, -1, f.z);
            this.scene.scale(f.scaleX, f.scaleY, f.scaleZ);
            f.fire.display();
            this.scene.popMatrix();
        }
    }
}
