attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform float timeFactor;
uniform float pulseAmount;

varying vec3 position;
varying float vHeight;

void main() {
    // displ. vertical
    float heightFactor = aVertexPosition.y;
    vHeight = heightFactor;
    
    // sinusoide
    float wave1 = sin(timeFactor * 4.0 + heightFactor * 5.0) * 0.2;
    float wave2 = sin(timeFactor * 6.0 + heightFactor * 3.0) * 0.15;
    float wave3 = sin(timeFactor * 5.0 + heightFactor * 4.0) * 0.1;
    float wave = wave1 + wave2 + wave3;
    
    // mov. horizontal
    float horizontalWave1 = sin(timeFactor * 5.0 + aVertexPosition.x * 3.0) * 0.15;
    float horizontalWave2 = cos(timeFactor * 4.0 + aVertexPosition.z * 3.0) * 0.15;
    
    // ruido
    float noise = fract(sin(dot(vec2(aVertexPosition.x + timeFactor * 0.2, 
                                    aVertexPosition.z - timeFactor * 0.3), 
                                vec2(12.9898, 78.233))) * 43758.5453) * 0.15;
    
    vec3 newPosition = aVertexPosition;
    
    // offset
    float verticalOffset = sin(timeFactor * 6.0 + aVertexPosition.x * 2.0) * 0.2 * heightFactor;

    float topFactor = smoothstep(0.0, 1.0, heightFactor);
    float horizontalFalloff = pow(heightFactor, 1.5);
    newPosition.x += (wave + horizontalWave1) * horizontalFalloff + noise;
    newPosition.z += (wave + horizontalWave2) * horizontalFalloff + noise;
    

    newPosition.y += verticalOffset * topFactor + 
                    sin(timeFactor * 3.0) * 0.1 * heightFactor +
                    noise * heightFactor;
    
    // twisting
    float twist = sin(timeFactor * 2.0) * 3.14159 * 0.08 * topFactor;
    float newX = newPosition.x * cos(twist) - newPosition.z * sin(twist);
    float newZ = newPosition.x * sin(twist) + newPosition.z * cos(twist);
    newPosition.x = newX;
    newPosition.z = newZ;
    
    // tentar arredondar
    float radius = length(newPosition.xz);
    float curve = 1.0 - pow(heightFactor, 2.0) * 0.3;
    newPosition.x *= curve;
    newPosition.z *= curve;
    
    position = newPosition;
    
    gl_Position = uPMatrix * uMVMatrix * vec4(newPosition, 1.0);
} 