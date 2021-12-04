varying vec2 vUv;
uniform float time;
uniform vec2 mouse;
uniform float speed;
uniform float scale;
uniform vec3 redChannel;
uniform vec3 greenChannel;
uniform vec3 blueChannel;
uniform int fluidType;
uniform vec2 horizontalMovement;
uniform vec2 verticalMovement;

void main() {

    vec2 p = vUv * scale;   


    if (fluidType == 0) {
        for(int i=1; i<2; i++){
            p.x+=horizontalMovement.x/float(i)*sin(float(i)*horizontalMovement.y*p.y+time*speed)+mouse.x/3000.;
            p.y+=verticalMovement.x/float(i)*cos(float(i)*verticalMovement.y*p.x+time*speed)+mouse.y/3000.;
        }
    }
    if (fluidType == 1) {
        for(int i=1; i<10; i++){
            p.x+=horizontalMovement.x/float(i)*sin(float(i)*horizontalMovement.y*p.y+time*speed)+mouse.x/3000.;
            p.y+=verticalMovement.x/float(i)*cos(float(i)*verticalMovement.y*p.x+time*speed)+mouse.y/3000.;
        }
    }
    if (fluidType == 2) {
        for(int i=1; i<30; i++){
            p.x+=horizontalMovement.x/float(i)*sin(float(i)*horizontalMovement.y*p.y+time*speed)+mouse.x/3000.;
            p.y+=verticalMovement.x/float(i)*cos(float(i)*verticalMovement.y*p.x+time*speed)+mouse.y/3000.;
        }
    }


    float r=cos(p.x+p.y+redChannel.z)*redChannel.x+redChannel.y;
    float g=sin(p.x+p.y+greenChannel.z)*greenChannel.x+greenChannel.y;
    float b=(sin(p.x+p.y)+cos(p.x+p.y))*blueChannel.x+blueChannel.y;


    vec3 color = vec3(r,g,b);

    gl_FragColor = vec4( color, 1. );
}




// uniform float time;
// varying vec2 vUv;

// void main(){
//     // Time varying pixel color
//     vec3 col = cos(time+vUv.xyx+vec3(0,2,4));
    
//     // Output to screen
//     gl_FragColor=vec4(col,1.);
// }