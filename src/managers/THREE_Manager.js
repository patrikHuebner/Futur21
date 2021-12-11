import { useStore } from "vuex";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import AnimationFrame from "@/utils/AnimationFrame.js";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import Sketch from '@/THREE/Sketch.js';

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
        this.init_renderer();
        this.init_scene();
        this.init_camera();
        this.init_controls();

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
        } else {
            this.renderer.setPixelRatio(1);
        }

        // Attach renderer to DOM
        this.parentContainer.appendChild(this.renderer.domElement);
    }



    // SCENE ---------------------------------------------------------------------------------------------
    init_scene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa0a0a0);
        this.scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);
    }



    // CAMERA ---------------------------------------------------------------------------------------------
    init_camera() {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
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



    // RESIZE ---------------------------------------------------------------------------------------------
    resize() {
        if (!this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
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
        if (window.stats != null) window.stats.begin();

        if (this.controls) {
            this.controls.update();
        }

        // Sketch
        if (this.sketch) {
            this.sketch.animate();
        }

        // FrameCount
        this.store.dispatch("animation_increaseFrameCount");
    }


    // DRAW LOGIC ---------------------------------------------------------------------------------------------
    draw() {
        // Render
        this.renderer.render(this.scene, this.camera);

        // Stats
        if (window.stats != null) window.stats.end();
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

}