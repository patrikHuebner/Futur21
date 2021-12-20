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
        if (this.postProcessing) {
            this.postProcessing.resize();
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
        this.delta = this.clock.getDelta();
    }



    // RENDER LOOP LOGIC ---------------------------------------------------------------------------------------------
    render() {
        //
        // if (this.delta < 500) {
        this.update();
        this.draw();
        // }
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
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.tabActive = false;
                this.clock.stop();
                // console.log('Page is hidden from user view');
            } else {
                this.tabActive = true;
                this.clock.start();
                // console.log('Page is in user view');
            }
        });
    }


}