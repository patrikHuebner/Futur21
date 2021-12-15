import * as THREE from 'three';
import { useStore } from "vuex";
import Stats from "@/utils/Stats";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import AnimationFrame from "@/utils/AnimationFrame.js";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import Sketch from '@/THREE/Sketch.js';
import PostProcessing from '@/THREE/PostProcessing.js';

export default class THREE_Manager {
    constructor(args) {
        // VueX
        this.store = useStore();

        // Arguments & global variables
        this.parentContainer = document.getElementById(args.parentContainer);
        this.animationHandler = null;
        this.animationFrame = null;
        this.clock = new THREE.Clock();
        this.start = Date.now();
        this.tabActive = true;

        // Triger THREE initialization
        this.init();
    }




    // INIT ---------------------------------------------------------------------------------------------
    init() {
        this.store.dispatch('console', { log: 'THREE_Manager: Initializing' });

        // Check if tab is active or passive
        this.tabVisibilityEvent();

        // Init THREE.js
        // this.modify_fog_shader();
        this.init_renderer();
        this.init_scene();
        this.init_camera();
        this.init_controls();
        this.init_stats();
        if (this.store.state.global.usePostProcessing) {
            this.postProcessing = new PostProcessing({ threeManager: this });
        }

        // Initialize the actual sketch
        this.sketch = new Sketch({ threeManager: this });

        // // Load HDRI file
        // this.loadHDRI_fromSingleFile('../HDRI/adams_place_bridge_4k.hdr');

        // Start the animation loop
        this.startAnimationLoop();

        // Add resize event
        window.addEventListener('resize', this.resize.bind(this));
    }



    // RENDERER ---------------------------------------------------------------------------------------------
    init_renderer() {
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.store.state.global.antialiasing,
            powerPreference: 'high-performance'
        });
        this.renderer.setClearColor(new THREE.Color(this.store.state.colors.background));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.id = 'threeWebGL';

        // this.renderer.toneMapping = THREE.LinearToneMapping;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = 1; // 4
        this.renderer.toneMappingExposure = 1;


        // Check and apply shadow settings
        if (this.store.state.global.shadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        // Check and apply retina settings
        if (this.store.state.global.retinaResolution) {
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.store.state.global.pixelRatio = window.devicePixelRatio;
        } else {
            this.renderer.setPixelRatio(1);
            this.store.state.global.pixelRatio = 1;
        }

        // Attach renderer to DOM
        this.parentContainer.appendChild(this.renderer.domElement);
    }



    // SCENE ---------------------------------------------------------------------------------------------
    init_scene() {
        this.scene = new THREE.Scene();
    }



    // CAMERA ---------------------------------------------------------------------------------------------
    init_camera() {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
        this.camera.position.set(this.store.state.camera.position.x, this.store.state.camera.position.y, this.store.state.camera.position.z);
        this.camera.rotation.set(this.store.state.camera.rotation.x, this.store.state.camera.rotation.y, this.store.state.camera.rotation.z);
        this.camera.fov = this.store.state.camera.position.fov;

        this.camera.updateProjectionMatrix();
    }



    // CONTROLS ---------------------------------------------------------------------------------------------
    init_controls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.enablePan = true;
        this.controls.dampingFactor = 0.2;
        this.controls.rotateSpeed = 0.7;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 1000;

        // Prevent controls from going beyond the ground
        if (this.store.state.camera.keepControlsAboveGround) {
            this.centerPosition = this.controls.target.clone();
            this.centerPosition.y = 0;
            this.groundPosition = this.camera.position.clone();
            this.groundPosition.y = 0;
            this.d = (this.centerPosition.distanceTo(this.groundPosition));
            this.origin = new THREE.Vector2(this.controls.target.y + 2, 0);
            this.remote = new THREE.Vector2(0, this.d); // replace 0 with raycasted ground altitude
            this.angleRadians = Math.atan2(this.remote.y - this.origin.y, this.remote.x - this.origin.x);
            this.controls.maxPolarAngle = this.angleRadians;
        }

        this.controls.target.x = this.store.state.camera.target.x;
        this.controls.target.y = this.store.state.camera.target.y;
        this.controls.target.z = this.store.state.camera.target.z;
        this.controls.update();
    }



    // STATISTICS ---------------------------------------------------------------------------------------------
    init_stats() {
        if (this.store.state.enableStats) {
            this.stats = new Stats();
            let statsContainer = document.createElement("div");
            statsContainer.setAttribute("id", "Stats-output");
            statsContainer.appendChild(this.stats.dom);
            this.stats.dom.style.cssText = 'position:absolute;top:20px;right:20px;';
            document.body.appendChild(statsContainer);
        }
    }



    // RESIZE ---------------------------------------------------------------------------------------------
    resize() {
        if (!this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.store.state.global.usePostProcessing) {
            this.postProcessing.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }



    // ANIMATION LOOP: START ---------------------------------------------------------------------------------------------
    startAnimationLoop() {
        if (this.store.state.global.capFramerate) {
            let animFrame = new AnimationFrame(this.store.state.global.cappedFramerate, this.animate, this);
            animFrame.start();
        } else {
            this.animationHandler = this.animate.bind(this);
            this.animate();
        }
    }
    // ANIMATION LOOP: STOP ---------------------------------------------------------------------------------------------
    stopAnimationLoop() {
        cancelAnimationFrame(this.animationFrame);
        this.animationHandler = null;
    }



    // ANIMATION HANDLER ---------------------------------------------------------------------------------------------
    animate(delta, reference) {
        if (reference == undefined) {
            this.render();
            this.animationFrame = requestAnimationFrame(this.animationHandler);
        } else {
            reference.render();
        }
    }



    // RENDER LOOP LOGIC ---------------------------------------------------------------------------------------------
    render() {
        this.update();
        this.draw();
    }



    // UPDATE LOGIC ---------------------------------------------------------------------------------------------
    update() {
        // Stats
        if (this.stats != null) this.stats.begin();


        // Controls
        if (this.controls) {
            this.controls.update();
        }

        // Sketch
        if (this.sketch) {
            this.sketch.update();
        }

        // Composer
        if (this.postProcessing) {
            this.postProcessing.update();
        }

        // FrameCount
        this.store.dispatch("animation_increaseFrameCount");
    }


    // DRAW LOGIC ---------------------------------------------------------------------------------------------
    draw() {
        // Render
        if (this.store.state.global.usePostProcessing) {
            this.postProcessing.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }

        // Stats
        if (this.stats != null) this.stats.end();
    }





    // CHECK IF TAB IS ACTIVE  ---------------------------------------------------------------------------------------------
    tabVisibilityEvent() {
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                this.tabActive = false;
                // console.log('Page is hidden from user view');
            } else {
                this.tabActive = true;
                // console.log('Page is in user view');
            }
        });
    }



    // LOAD HDR FROM A SINGLE FILE  ---------------------------------------------------------------------------------------------
    loadHDRI_fromSingleFile(hdrFile) {
        return new Promise(resolve => {
            this.envMap = null;
            let that = this;
            this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            this.pmremGenerator.compileEquirectangularShader();
            new RGBELoader()
                .setDataType(THREE.UnsignedByteType)
                .setPath('../HDRI/')
                .load(hdrFile, function (texture) {
                    var envMap = that.pmremGenerator.fromEquirectangular(texture).texture;

                    // that.scene.background = envMap;
                    that.scene.environment = envMap;
                    that.envMap = envMap;

                    texture.dispose();
                    that.pmremGenerator.dispose();

                    resolve('OK');
                });
            // this.pmremGenerator.compileEquirectangularShader();
        });
    }



    modify_fog_shader() {
        const _NOISE_GLSL = `
        //
        // Description : Array and textureless GLSL 2D/3D/4D simplex
        //               noise functions.
        //      Author : Ian McEwan, Ashima Arts.
        //  Maintainer : stegu
        //     Lastmod : 20201014 (stegu)
        //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
        //               Distributed under the MIT License. See LICENSE file.
        //               https://github.com/ashima/webgl-noise
        //               https://github.com/stegu/webgl-noise
        //
        vec3 mod289(vec3 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        vec4 mod289(vec4 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        vec4 permute(vec4 x) {
             return mod289(((x*34.0)+1.0)*x);
        }
        vec4 taylorInvSqrt(vec4 r)
        {
          return 1.79284291400159 - 0.85373472095314 * r;
        }
        float snoise(vec3 v)
        {
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        // First corner
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 =   v - i + dot(i, C.xxx) ;
        // Other corners
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          //   x0 = x0 - 0.0 + 0.0 * C.xxx;
          //   x1 = x0 - i1  + 1.0 * C.xxx;
          //   x2 = x0 - i2  + 2.0 * C.xxx;
          //   x3 = x0 - 1.0 + 3.0 * C.xxx;
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
          vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
        // Permutations
          i = mod289(i);
          vec4 p = permute( permute( permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
          float n_ = 0.142857142857; // 1.0/7.0
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
          //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
        //Normalise gradients
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
        // Mix final noise value
          vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                        dot(p2,x2), dot(p3,x3) ) );
        }
        float FBM(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 0.0;
          for (int i = 0; i < 6; ++i) {
            value += amplitude * snoise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }
        `;

        THREE.ShaderChunk.fog_fragment = `
        #ifdef USE_FOG
          vec3 fogOrigin = cameraPosition;
          vec3 fogDirection = normalize(vWorldPosition - fogOrigin);
          float fogDepth = distance(vWorldPosition, fogOrigin);
          // f(p) = fbm( p + fbm( p ) )
          vec3 noiseSampleCoord = vWorldPosition * 0.0025 + vec3(
              0.0, 0.0, fogTime * 0.025);
          float noiseSample = FBM(noiseSampleCoord + FBM(noiseSampleCoord)) * 0.5 + 0.5;
          fogDepth *= mix(noiseSample, 1.0, saturate((fogDepth - 5000.0) / 5000.0));
          fogDepth *= fogDepth;
          float heightFactor = 0.05;
          float fogFactor = heightFactor * exp(-fogOrigin.y * fogDensity) * (
              1.0 - exp(-fogDepth * fogDirection.y * fogDensity)) / fogDirection.y;
          fogFactor = saturate(fogFactor);
          gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
        #endif`;

        THREE.ShaderChunk.fog_pars_fragment = _NOISE_GLSL + `
        #ifdef USE_FOG
          uniform float fogTime;
          uniform vec3 fogColor;
          varying vec3 vWorldPosition;
          #ifdef FOG_EXP2
            uniform float fogDensity;
          #else
            uniform float fogNear;
            uniform float fogFar;
          #endif
        #endif`;

        THREE.ShaderChunk.fog_vertex = `
        #ifdef USE_FOG
          vWorldPosition = worldPosition.xyz;
        #endif`;

        THREE.ShaderChunk.fog_pars_vertex = `
        #ifdef USE_FOG
          varying vec3 vWorldPosition;
        #endif`;
    }

}