import { CGFobject } from "../lib/CGF.js";

export class MyCircle extends CGFobject {
    constructor(scene, slices = 32, deform = true) {
        super(scene);
        this.slices = slices;
        this.deform = deform;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        this.vertices.push(0, 0, 0); // centro
        this.normals.push(0, 0, 1);
        this.texCoords.push(0.5, 0.5);

        for (let i = 0; i <= this.slices; i++) {
            let angle = 2 * Math.PI * i / this.slices;
            let radius = 1;

            // Pequena deformação para parecer natural
            if (this.deform) {
                radius += 0.1 * Math.sin(5 * angle) + 0.05 * Math.cos(3 * angle);
            }

            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            this.vertices.push(x, y, 0);
            this.normals.push(0, 0, 1);
            this.texCoords.push(0.5 + x * 0.5, 0.5 - y * 0.5);

            if (i > 0) {
                this.indices.push(0, i, i + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
