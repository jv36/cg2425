#ifdef GL_ES
precision highp float;
#endif

varying vec4 coords;
varying vec3 position;
uniform float timeFactor;

void main() {
    // cores do fogo
    vec3 baseColor = vec3(1.0, 0.2, 0.0);  // vermelho alaranjado
    vec3 midColor = vec3(1.0, 0.5, 0.0);   // laranja
    vec3 tipColor = vec3(1.0, 0.8, 0.0);   // amarelo
    
    // efeito de flicker, sinusoide
    float flicker1 = sin(timeFactor * 8.0) * 0.5 + 0.5;
    float flicker2 = sin(timeFactor * 12.0 + 1.3) * 0.5 + 0.5;
    float flicker3 = sin(timeFactor * 15.0 + 2.7) * 0.5 + 0.5;
    
    // combinar flickers
    float combinedFlicker = (flicker1 + flicker2 + flicker3) / 3.0;
    
    // gradiente cores
    float heightGradient = position.y + sin(timeFactor * 4.0 + position.x) * 0.2;

    vec3 color;
    if (heightGradient < 0.3) {
        color = mix(baseColor, midColor, heightGradient * 3.0);
    } else {
        color = mix(midColor, tipColor, (heightGradient - 0.3) * 1.5);
    }
    
    // efeito
    color *= 0.7 + combinedFlicker * 0.3;
    
    float horizontalVariation = sin(position.x * 5.0 + timeFactor * 3.0) * 0.1;
    color += vec3(horizontalVariation, horizontalVariation * 0.5, 0.0);
    
    gl_FragColor = vec4(color, 1.0);
} 