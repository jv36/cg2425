#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler1;     // First texture (current)
uniform sampler2D uSampler2;     // Second texture (target)
uniform float uMixFactor;        // Mix factor between 0 and 1

void main() {
    vec4 color1 = texture2D(uSampler1, vTextureCoord);
    vec4 color2 = texture2D(uSampler2, vTextureCoord);
    
    // transition
    gl_FragColor = mix(color1, color2, uMixFactor);
} 