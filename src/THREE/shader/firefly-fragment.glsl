uniform sampler2D tDiffuse;
uniform float time;
varying vec2 vUv;
uniform vec2 resolution;

#define radius.003
#define sphere_Counts 50.

float N21(vec2 p){
    vec3 a=fract(vec3(p.xyx)*vec3(213.897,653.453,253.098));
    a+=dot(a,a.yzx+79.76);
    return fract((a.x+a.y)*a.z);
}

vec2 N22(vec2 p){
    float n=N21(p);
    return vec2(n,N21(n+p));
}

void main(){
    vec2 uv=vUv;
    uv.x*=resolution.x/resolution.y;
    
    vec3 pointLight;
    for(float i=0.;i<sphere_Counts;i+=1.)
    {
        vec2 rnd=N22(vec2(i,i*2.));
        vec2 point=vec2(cos(time*rnd.x+i)*1.,sin(time*rnd.y+i));
        float distanceToPoint=distance(uv,point);
        pointLight+=vec3(radius/distanceToPoint)*vec3(sin(time+i)/2.5+.7);
    }
    //pointLight*=vec3(.3,.3,1.);
    
    vec4 color=texture2D(tDiffuse,vUv);
    gl_FragColor.rgb=mix(pointLight,color.rgb,.95);
    // gl_FragColor=vec4(pointLight,1.);
    // gl_FragColor.rgb = vec4mix(color.rgb, pointLight, v_color.a);
    
    // pointLight*=color.xyz;
    //pointLight*=vec3(.3,.3,1.);
    
    // vec3 pointLight2;
    // for(float i=60.;i<80.;i+=1.)
    // {
        //     vec2 rnd=N22(vec2(i,i+2.));
        //     vec2 point=vec2(cos(time*rnd.x+i)*1.5,sin(time*rnd.y+i));
        //     float distanceToPoint=distance(uv,point);
        //     pointLight2+=vec3(radius/distanceToPoint)*vec3(clamp(sin(time+i)/2.+.6,.1,1.));
    // }
    // pointLight2*=vec3(.5,.8,.5);
    // pointLight+=pointLight2;
    
    //gl_FragColor=vec4(pointLight,1.);
}