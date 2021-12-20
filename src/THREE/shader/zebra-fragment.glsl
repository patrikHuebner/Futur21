uniform float time;
uniform float scale;
varying vec2 vUv;

void main(){
    vec2 uv=vUv;
    float t=time*.04;
    vec2 center=vec2(1000.);
    float g=2.1;
    center.x+=sin(uv.y*g+t+time*.01);
    center.y+=cos(uv.x*g+t);
    float d=distance(uv,center);
    float k=-sin(d*6.283*scale-t);
    float e=smoothstep(0.,fwidth(k)*1.5,k);
    gl_FragColor=vec4(sqrt(max(e,0.)));
}