import { CGFobject } from "../lib/CGF.js";
import { MyTree } from "./MyTree.js";

export class MyForest extends CGFobject {
    constructor(scene, rows, cols) {
        super(scene);
        this.rows = rows;
        this.cols = cols;
        this.trees = [];

        this.spacing = 2.0;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const stacks = Math.floor(2 + Math.random() * 5); // 2 a 6
                const radius = 0.15 + Math.random() * 0.2;         // 0.15 a 0.35
                const treeColor = [
                    0.05 + Math.random() * 0.25,
                    0.4 + Math.random() * 0.5,
                    0.05 + Math.random() * 0.25,
                    1.0
                ];

                const xOffset = (Math.random() - 0.5) * 1.0; // ±1
                const zOffset = (Math.random() - 0.5) * 1.0;

                const x = j * this.spacing + xOffset;
                const z = i * this.spacing + zOffset;

                const sides = Math.floor(4 + Math.random() * 4); // 3 a 8 lados

                const tree = new MyTree(scene, stacks, radius, treeColor, sides);

                this.trees.push({ tree, x, z });
            }
        }
    }

    display() {
        for (let t of this.trees) {
            this.scene.pushMatrix();
            this.scene.translate(t.x, 0, t.z);
            t.tree.display();
            this.scene.popMatrix();
        }
    }
}
