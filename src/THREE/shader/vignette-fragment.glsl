uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float gain;
uniform float radius;
uniform float softness;
uniform bool horizontal;

varying vec2 vUv;

float rand(vec2 co){
    return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);
}

void main(){
    vec4 color=texture2D(tDiffuse,vUv);
    vec3 c=color.rgb;
    float noise=rand(gl_FragCoord.xy)*.05;
    
    // determine center
    vec2 position;
    if(horizontal){
        position=(vec2(0,gl_FragCoord.y)/resolution.xy)-vec2(.5);
        //"float len = 1.0 - length(position);
    }else{
        position=(gl_FragCoord.xy/resolution.xy)-vec2(.5);
        position*=resolution.x/resolution.y;
    }
    
    float len=length(position)*gain;
    
    float x=gl_FragCoord.x/resolution.x;
    gl_FragColor=vec4(c*vec3(smoothstep(radius,radius-softness,len)),1.);
}