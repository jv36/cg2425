import { CGFobject } from '../lib/CGF.js';

/**
 * MySphere
 * @constructor
 * @param scene - Referência ao objeto MyScene
 * @param slices - Divisões horizontais (longitude)
 * @param stacks - Divisões verticais (latitude)
 */
export class MySphere extends CGFobject {
    constructor(scene, slices, stacks, inverted) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.inverted = inverted;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.texCoords = [];
        
        for (let stack = 0; stack <= this.stacks; ++stack) {
            let phi = Math.PI * stack / this.stacks; // de 0 a pi
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            for (let slice = 0; slice <= this.slices; ++slice) {
                let theta = 2 * Math.PI * slice / this.slices; // de 0 a 2pi
                let sinTheta = Math.sin(theta);
                let cosTheta = Math.cos(theta);

                let x = cosTheta * sinPhi;
                let y = sinTheta * sinPhi;
                let z = cosPhi;

                this.vertices.push(x, y, z);
                if (this.inverted == true) {
                    this.normals.push(-x, -y, -z);
                }
                else {
                    this.normals.push(x, y, z);
                }
                this.texCoords.push(slice / this.slices, stack / this.stacks);
            }
        }

        for (let stack = 0; stack < this.stacks; ++stack) {
            for (let slice = 0; slice < this.slices; ++slice) {
                let first = (stack * (this.slices + 1)) + slice;
                let second = first + this.slices + 1;
                
                if (this.inverted == true) {
                    this.indices.push(first + 1, second, first);
                    this.indices.push(first + 1, second + 1, second);
                }
                else {
                    this.indices.push(first, second, first + 1);
                    this.indices.push(second, second + 1, first + 1);
                }

            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
