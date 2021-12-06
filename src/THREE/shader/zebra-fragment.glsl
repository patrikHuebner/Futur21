uniform float time;
varying vec2 vUv;

void main(){
    vec2 uv = vUv;
    float t = time*.04;
    vec2 center = vec2(1000.0);
    float g = 3.1;
    center.x+=sin(uv.y*g+t+time*0.01);
    center.y+=cos(uv.x*g+t);
    float d = distance(uv,center);
	float k = -sin(d*6.283*10. - t);
	float e = smoothstep(0., fwidth(k)*1.5, k);
	gl_FragColor = vec4(sqrt(max(e, 0.)));


    // // Time varying pixel color
    // vec3 col = cos(time+vUv.xyx+vec3(0,2,4));
    
    // // Output to screen
    // gl_FragColor=vec4(col,1.);
}