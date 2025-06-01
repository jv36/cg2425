import {CGFobject} from '../lib/CGF.js';
/**
* MyPyramid
* @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of divisions around the Y axis
 * @param stacks - number of divisions along the Y axis
*/
export class MyPyramid extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var ang = 0;
        var alphaAng = 2*Math.PI/this.slices;

        // Add top vertex first (will be referenced by all triangles)
        this.vertices.push(0, 1, 0);
        this.normals.push(0, 1, 0);
        this.texCoords.push(0.5, 0);

        // Generate vertices for the base and side faces
        for(var i = 0; i < this.slices; i++) {
            // Base vertices
            const x = Math.cos(ang);
            const z = -Math.sin(ang);
            
            // Add base vertex
            this.vertices.push(x, 0, z);
            
            // Calculate normal for the side face
            // This creates a normal that's angled upward for better shading
            const normalX = x * 0.8;  // Scale factor to adjust normal angle
            const normalY = 0.6;      // Upward component
            const normalZ = z * 0.8;
            // Normalize the normal vector
            const length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
            this.normals.push(normalX/length, normalY/length, normalZ/length);
            
            // Texture coordinates
            this.texCoords.push(i/this.slices, 1);
            
            // Create indices for the side face triangle
            if (i < this.slices - 1) {
                this.indices.push(0, i + 1, i + 2);
            } else {
                this.indices.push(0, i + 1, 1);
            }
            
            ang += alphaAng;
        }

        // Add center of base
        const baseCenter = this.vertices.length/3;
        this.vertices.push(0, 0, 0);
        this.normals.push(0, -1, 0);
        this.texCoords.push(0.5, 0.5);

        // Create the base triangles
        for(var i = 0; i < this.slices; i++) {
            if (i < this.slices - 1) {
                this.indices.push(i + 1, i + 2, baseCenter);
            } else {
                this.indices.push(i + 1, 1, baseCenter);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Called when user interacts with GUI to change object's complexity.
     * @param {integer} complexity - changes number of slices
     */
    updateBuffers(complexity){
        this.slices = 3 + Math.round(9 * complexity); //complexity varies 0-1, so slices varies 3-12
        this.initBuffers();
        this.initNormalVizBuffers();
    }
    
}


