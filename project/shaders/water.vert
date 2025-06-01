attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform float timeFactor;

varying vec2 vTextureCoord;

void main() {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	
	// animar
	vec2 moveDirection = vec2(1.0, 0.5);  // Diagonal movement
	float moveSpeed = 0.05;
	
	vTextureCoord = aTextureCoord + timeFactor * moveSpeed * moveDirection;
}