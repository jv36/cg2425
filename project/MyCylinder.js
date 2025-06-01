import { CGFobject } from '../lib/CGF.js';

export class MyCylinder extends CGFobject {
    constructor(scene, slices, height = 1) {
        super(scene);
        this.slices = slices;
        this.height = height;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const angInc = 2 * Math.PI / this.slices;

        for (let i = 0; i <= this.slices; i++) {
            const ang = i * angInc;
            const x = Math.cos(ang);
            const z = Math.sin(ang);

            // Vertice inferior
            this.vertices.push(x, 0, z);
            this.normals.push(x, 0, z);
            this.texCoords.push(i / this.slices, 1);

            // Vertice superior
            this.vertices.push(x, this.height, z);
            this.normals.push(x, 0, z);
            this.texCoords.push(i / this.slices, 0);
        }

        for (let i = 0; i < this.slices; i++) {
            const p1 = i * 2;
            const p2 = p1 + 1;
            const p3 = p1 + 2;
            const p4 = p1 + 3;

            // Triângulo 1
            this.indices.push(p1, p2, p4);
            // Triângulo 2
            this.indices.push(p1, p4, p3);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
