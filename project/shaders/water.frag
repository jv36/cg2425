#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;     // Water texture
uniform sampler2D uSampler2;    // Water displacement map
uniform float timeFactor;

void main() {
	vec2 baseCoord = vTextureCoord * 4.0;
	
	// timebased
	vec2 movingCoord = baseCoord + timeFactor * 0.01;
	
	// map
	vec4 dispMap = texture2D(uSampler2, movingCoord * 0.5);
	
	vec2 distortedCoords = baseCoord;
	distortedCoords.x += dispMap.r * 0.1 * sin(timeFactor * 2.0);
	distortedCoords.y += dispMap.g * 0.1 * cos(timeFactor * 2.0);
	
	vec4 waterColor = texture2D(uSampler, distortedCoords);
	
	vec4 blueColor = vec4(0.2, 0.4, 0.8, 1.0);
	vec4 finalColor = mix(waterColor, blueColor, 0.7);
	
	float highlight = pow(dispMap.b, 2.0) * 0.2;
	finalColor.rgb += vec3(highlight);
	
	finalColor.a = 0.9;
	
	gl_FragColor = finalColor;
}