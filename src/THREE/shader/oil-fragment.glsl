uniform float time;
varying vec2 vUv;

#define M_PI 3.14159265359

vec3 mod289(vec3 x){
    return x-floor(x*(1./289.))*289.;
}

vec4 mod289(vec4 x){
    return x-floor(x*(1./289.))*289.;
}

vec4 permute(vec4 x){
    return mod289(((x*34.)+1.)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159-.85373472095314*r;
}

float snoise(vec3 v)
{
    const vec2 C=vec2(1./6.,1./3.);
    const vec4 D=vec4(0.,.5,1.,2.);
    
    // First corner
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    
    // Other corners
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    
    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
    //   x1 = x0 - i1  + 1.0 * C.xxx;
    //   x2 = x0 - i2  + 2.0 * C.xxx;
    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;// 2.0*C.x = 1/3 = C.y
    vec3 x3=x0-D.yyy;// -1.0+3.0*C.x = -0.5 = -D.y
    
    // Permutations
    i=mod289(i);
    vec4 p=
    permute
    (
        permute
        (
            permute
            (
                i.z+vec4(0.,i1.z,i2.z,1.)
            )
            +i.y+vec4(0.,i1.y,i2.y,1.)
        )
        +i.x+vec4(0.,i1.x,i2.x,1.)
    );
    
    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_=.142857142857;// 1.0/7.0
    vec3 ns=n_*D.wyz-D.xzx;
    
    vec4 j=p-49.*floor(p*ns.z*ns.z);//  mod(p,7*7)
    
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.*x_);// mod(j,N)
    
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.-abs(x)-abs(y);
    
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    
    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
    vec4 s0=floor(b0)*2.+1.;
    vec4 s1=floor(b1)*2.+1.;
    vec4 sh=-step(h,vec4(0.));
    
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    
    //Normalise gradients
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;
    p1*=norm.y;
    p2*=norm.z;
    p3*=norm.w;
    
    // Mix final noise value
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

// p: position
// o: how many layers
// f: frequency
// lac: how fast frequency changes between layers
// r: how fast amplitude changes between layers
float fbm4(vec3 p,float theta,float f,float lac,float r)
{
    mat3 mtx=mat3(
        cos(theta),-sin(theta),0.,
        sin(theta),cos(theta),0.,
    0.,0.,1.);
    
    float frequency=f;
    float lacunarity=lac;
    float roughness=r;
    float amp=1.;
    float total_amp=0.;
    
    float accum=0.;
    vec3 X=p*frequency;
    for(int i=0;i<4;i++)
    {
        accum+=amp*snoise(X);
        X*=(lacunarity+(snoise(X)+.1)*.006);
        X=mtx*X;
        
        total_amp+=amp;
        amp*=roughness;
    }
    
    return accum/total_amp;
}

float fbm8(vec3 p,float theta,float f,float lac,float r)
{
    mat3 mtx=mat3(
        cos(theta),-sin(theta),0.,
        sin(theta),cos(theta),0.,
    0.,0.,1.);
    
    float frequency=f;
    float lacunarity=lac;
    float roughness=r;
    float amp=1.;
    float total_amp=0.;
    
    float accum=0.;
    vec3 X=p*frequency;
    for(int i=0;i<8;i++)
    {
        accum+=amp*snoise(X);
        X*=(lacunarity+(snoise(X)+.1)*.006);
        X=mtx*X;
        
        total_amp+=amp;
        amp*=roughness;
    }
    
    return accum/total_amp;
}

float turbulence(float val)
{
    float n=1.-abs(val);
    return n*n;
}

float pattern(in vec3 p,inout vec3 q,inout vec3 r)
{
    q.x=fbm4(p+0.,0.,1.,2.,.33);
    q.y=fbm4(p+6.,0.,1.,2.,.33);
    
    r.x=fbm8(p+q-2.4,0.,1.,3.,.5);
    r.y=fbm8(p+q+8.2,0.,1.,3.,.5);
    
    q.x=turbulence(q.x);
    q.y=turbulence(q.y);
    
    float f=fbm4(p+(1.*r),0.,1.,2.,.5);
    
    return f;
}

void main(){
    vec2 uv=vUv;
    
    float t=time*.05;
    
    vec3 spectrum[4];
    spectrum[0]=vec3(.94,.02,.03);
    spectrum[1]=vec3(.04,.04,.22);
    spectrum[2]=vec3(1.,.80,1.);
    spectrum[3]=vec3(.20,.40,.50);
    
    uv-=.5;
    uv*=3.5;
    
    vec3 p=vec3(uv.x,uv.y,t);
    vec3 q=vec3(0.);
    vec3 r=vec3(0.);
    float f=pattern(p,q,r);
    
    vec3 color=vec3(0.);
    color=mix(spectrum[1],spectrum[3],pow(length(q),4.));
    color=mix(color,spectrum[0],pow(length(r),1.4));
    color=mix(color,spectrum[2],f);
    
    color=pow(color,vec3(2.));
    

    gl_FragColor=vec4(color,1.);
}