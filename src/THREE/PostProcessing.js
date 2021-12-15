const glsl = require('glslify');
import * as THREE from 'three';
import { useStore } from "vuex";

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


export default class PostProcessing {

    constructor(args) {
        // VueX
        this.store = useStore();

        // References
        this.three = args.threeManager;

        // Init
        this.init();
    }

    init() {
        this.init_composer();
    }


    init_composer() {
        this.composer = new EffectComposer(this.three.renderer);
        this.composer.addPass(new RenderPass(this.three.scene, this.three.camera));

        // Bloom
        this.composer.addPass(new UnrealBloomPass({ x: 1024, y: 1024 }, .5, 0.0, 0.98));


        // Gradient pass
        this.gradientShader = {
            uniforms: {
                'tDiffuse': { type: 't', value: null },
                'color1': { type: 'c', value: new THREE.Color(this.store.state.colors.gradientPass.start) },
                'colorM': { type: 'c', value: new THREE.Color(this.store.state.colors.gradientPass.middle) },
                'color2': { type: 'c', value: new THREE.Color(this.store.state.colors.gradientPass.stop) },
                'colorMActive': { type: 'b', value: false },
                'resolution': { type: 'vec2', value: new THREE.Vector2(window.innerWidth * this.store.state.global.pixelRatio, window.innerHeight * this.store.state.global.pixelRatio) },
                'retina': { type: 'f', value: this.store.state.global.pixelRatio },
            },
            vertexShader: glsl(require('./shader/gradient-vertex.glsl').default),
            fragmentShader: glsl(require('./shader/gradient-fragment.glsl').default)
        }
        this.gradientPass = new ShaderPass(this.gradientShader);
        this.composer.addPass(this.gradientPass);



        // // Firefly pass
        // this.fireflyShader = {
        //     uniforms: {
        //         'tDiffuse': { type: 't', value: null },
        //         'time': { value: null },
        //         'resolution': { value: new THREE.Vector2(window.innerWidth , window.innerHeight ) },
        //         'radius': { value: 0.2 },
        //         'sphereCount': { value: 20. },
        //     },
        //     vertexShader: glsl(require('./shader/firefly-vertex.glsl').default),
        //     fragmentShader: glsl(require('./shader/firefly-fragment.glsl').default)
        // }
        // this.fireflyPass = new ShaderPass(this.fireflyShader);
        // this.fireflyPass.material.blending = THREE.MultiplyBlending;
        // this.composer.addPass(this.fireflyPass);



        // Vignette pass
        this.vignetteShader = {
            uniforms: {
                'tDiffuse': { type: 't', value: null },
                'resolution': { value: new THREE.Vector2(window.innerWidth * this.store.state.global.pixelRatio, window.innerHeight * this.store.state.global.pixelRatio) },
                'horizontal': { value: false },
                'radius': { value: 1.1 },
                'softness': { value: .7 },
                'gain': { value: .9 },
            },
            vertexShader: glsl(require('./shader/vignette-vertex.glsl').default),
            fragmentShader: glsl(require('./shader/vignette-fragment.glsl').default)
        }
        this.vignettePass = new ShaderPass(this.vignetteShader);
        this.composer.addPass(this.vignettePass);

    }



    update() {
        const delta = this.three.clock.getDelta();

        if (this.fireflyPass) {
            this.fireflyPass.material.uniforms['time'].value = 0.005*this.store.state.frameCount;
        }
    }

}