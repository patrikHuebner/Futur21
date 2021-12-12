uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform vec3 color1;
uniform vec3 colorM;
uniform vec3 color2;
uniform sampler2D gradient;
uniform bool colorMActive;
uniform vec2 resolution;
uniform float retina;

uniform sampler2D tex0;

void main(){
    if (!colorMActive) {
        vec4 color=texture2D(tDiffuse,vUv);
        
        float luma=.2126*color.r+.7152*color.g+.0722*color.b;
        float r=color2.x+luma*(color1.x-color2.x);
        float g=color2.y+luma*(color1.y-color2.y);
        float b=color2.z+luma*(color1.z-color2.z);

        vec4 resultingColor=vec4(r,g,b,1.);
        
        gl_FragColor=vec4(resultingColor.rgb,resultingColor.a);
    } else {
        vec4 color=texture2D(tDiffuse,vUv);
        
        // Gradient
        float y = gl_FragCoord.y / (resolution.y*retina);
        vec3 mixC;
        float step1 = 1.0; // 1.0
        float step2 = 0.5; // 0.7
        float step3 = 0.2; // 0.4
        float step4 = 0.0; // 0.0
        mixC = mix(color1, color1, smoothstep(step1, step2, y));
        mixC = mix(mixC, colorM, smoothstep(step2, step3, y));
        mixC = mix(mixC, color2, smoothstep(step3, step4, y));

        // Grayscale
        float gray = 0.2989 * color.r + 0.5870 * color.g + 0.1140 * color.b;

        vec4 resultingColor=vec4(color.r,color.g,color.b,1.);

        resultingColor.r=gray*mixC.r;
        resultingColor.g=gray*mixC.g;
        resultingColor.b=gray*mixC.b;

        if (resultingColor.r == 0.) resultingColor.r = 23./255.;
        if (resultingColor.g == 0.) resultingColor.g = 22./255.;
        if (resultingColor.b == 0.) resultingColor.b = 48./255.;

        gl_FragColor=vec4(resultingColor.rgb,resultingColor.a);
    }

}
