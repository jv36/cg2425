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

        const baseVerts = [];

        // Criar vértices da lateral
        for (let i = 0; i <= this.slices; i++) {
            const ang = i * angInc;
            const x = Math.cos(ang);
            const z = Math.sin(ang);

            // Vértice inferior
            this.vertices.push(x, 0, z);
            this.normals.push(x, 0, z); // normal lateral
            this.texCoords.push(i / this.slices, 1);
            baseVerts.push(this.vertices.length / 3 - 1);

            // Vértice superior
            this.vertices.push(x, this.height, z);
            this.normals.push(x, 0, z); // normal lateral
            this.texCoords.push(i / this.slices, 0);
        }

        // Faces laterais
        for (let i = 0; i < this.slices; i++) {
            const p1 = i * 2;
            const p2 = p1 + 1;
            const p3 = p1 + 2;
            const p4 = p1 + 3;

            // Face exterior
            this.indices.push(p1, p2, p4);
            this.indices.push(p1, p4, p3);

            // Face interior (inverter a ordem)
            this.indices.push(p4, p2, p1);
            this.indices.push(p3, p4, p1);
        }

        // Centro da base inferior
        const baseCenterIndex = this.vertices.length / 3;
        this.vertices.push(0, 0, 0);
        this.normals.push(0, -1, 0);
        this.texCoords.push(0.5, 0.5);

        // Triângulos da base inferior visíveis de fora
        for (let i = 0; i < this.slices; i++) {
            const current = baseVerts[i];
            const next = baseVerts[(i + 1) % this.slices];
            this.indices.push(current, next, baseCenterIndex);
        }

        // Triângulos da base inferior visíveis de dentro (ordem invertida)
        for (let i = 0; i < this.slices; i++) {
            const current = baseVerts[i];
            const next = baseVerts[(i + 1) % this.slices];
            this.indices.push(baseCenterIndex, next, current);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
