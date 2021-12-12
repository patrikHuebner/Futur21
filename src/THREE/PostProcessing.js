import * as THREE from 'three';
import { useStore } from "vuex";

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
// import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js';

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

        // this.composer.addPass(new ShaderPass(LuminosityShader));
    }

}