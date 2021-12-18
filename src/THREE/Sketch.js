import * as THREE from 'three';
import { gsap, Sine, Back } from 'gsap';
import { random, hexToRgb, map } from '@/utils/utils.js';
import { useStore } from "vuex";
import Lights from './Lights.js';
import Character from './Character.js';
import Boxes from './Boxes.js';
import RayCaster from './RayCaster.js';

export default class Sketch {

    constructor(args) {
        // VueX
        this.store = useStore();

        // ThreeManager
        this.three = args.threeManager;

        // Animation
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.manualCameraAnimation = false;
        this.rotateCamera = false;
        this.nextColor = null;

        // Init
        this.init();
    }


    // INIT ---------------------------------------------------------------------------------------------

    init() {
        // Init scene
        this.init_scene();

        // Init lights
        this.lights = new Lights({
            threeManager: this.three,
            sketch: this,
        });

        // Init character
        this.character = new Character({
            threeManager: this.three,
            sketch: this,
        });

        // Init Boxes
        this.boxes = new Boxes({
            threeManager: this.three,
            sketch: this,
        });

        // Init RayCaster
        this.rayCaster = new RayCaster({
            threeManager: this.three,
            sketch: this,
        });

        // Add ground plane
        this.addGround();

        // Rect to mouse movement
        window.addEventListener('mousemove', e => { this.reactToMouseMove(e); });

        // Add touch controls for movement
        this.addMobileControls();
    }


    update() {
        if (this.character) {
            this.character.update();
        }

        if (this.lights) {
            this.lights.update();
        }

        if (this.rayCaster) {
            this.rayCaster.update();
        }

        // this.rotateScene();
    }






    // METHODS ---------------------------------------------------------------------------------------------
    init_scene() {
        // Background
        this.three.scene.background = new THREE.Color(0xa0a0a0);

        // Fog
        this.three.scene.fog = new THREE.FogExp2(0xDFE9F3, 0.003); // 0xDFE9F3
    }





    reactToMouseMove(e) {
        if (this.character) {
            let mouseCoord = {
                x: e.offsetX,
                y: e.offsetY
            }

            let sceneX = map(mouseCoord.x, 0, window.innerWidth, 15, -15);
            let sceneY = map(mouseCoord.y, window.innerHeight, 0, 20, 4);

            this.character.cameraOffset.x = sceneX;
            this.character.cameraOffset.y = sceneY;
        }
    }




    triggerInteractionEvent() {
        clearTimeout(this.interactionTimeout);
        this.interactionTimeout = setTimeout(() => {

            // Random color
            this.nextColor = this.store.state.colors.primary[Math.floor(random(0, this.store.state.colors.primary.length))];
            let newColor = hexToRgb(this.nextColor);

            // PostProcessing Color
            if (this.three.postProcessing) {
                gsap.to(this.three.postProcessing.gradientPass.uniforms.color1.value, {
                    r: newColor.r * 0.01,
                    g: newColor.g * 0.01,
                    b: newColor.b * 0.01,
                    duration: Math.random() * 6 + 3,
                    // ease: Sine.easeInOut,
                });
            }


            // Character color
            gsap.to(this.character.target.children[2].material.emissive, {
                r: newColor.r * 0.01,
                g: newColor.g * 0.01,
                b: newColor.b * 0.01,
                duration: Math.random() * 6 + 3,
                // ease: Sine.easeInOut,
            });

            // Update boxes
            this.boxes.updateBoxPositions();
        }, 3000);
    }







    // SCENE: ROTATE ---------------------------------------------------------------------------------------------
    rotateScene() {
        if (this.rotateCamera) {
            let period = 5;
            let matrix = new THREE.Matrix4();
            matrix.set(this.three.camera.position.x * this.character.cameraOffset.x, this.three.camera.position.y * this.character.cameraOffset.y, this.three.camera.position.z * this.character.cameraOffset.z, 0)
            matrix.makeRotationY(this.clock.getDelta() * 1 * Math.PI / period);
            // Apply matrix like this to rotate the camera.
            this.three.camera.position.applyMatrix4(matrix);
            // Make camera look at the box.
            this.three.camera.lookAt(this.character.position.x + this.character.cameraLookat.x, this.character.position.y + this.character.cameraLookat.y, this.character.position.z);
        }
    }







    // GROUND PLANE ---------------------------------------------------------------------------------------------
    addGround() {
        let texture = new THREE.TextureLoader().load(
            'textures/floor-03.png',
            function (tex) {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(200, 200);
            }
        );



        const floorMaterial = new THREE.MeshPhongMaterial({
            color: 0x999999,
            depthWrite: true,
            map: texture
        });

        this.floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20000, 20000),
            floorMaterial
        );

        this.floor.rotation.x = - Math.PI / 2;
        this.floor.receiveShadow = true;
        this.three.scene.add(this.floor);

        // const grid = new THREE.GridHelper(20000, 200, 0xffffff, 0xffffff);
        // grid.material.opacity = 1;
        // grid.material.transparent = true;

        // this.three.scene.add(grid);
    }






    addMobileControls() {
        let that = this;

        let moveFowardButton = document.getElementById('OSC_top');
        moveFowardButton.addEventListener('touchstart', function () {
            that.character.input.keys.forward = true;
        }, false);
        moveFowardButton.addEventListener('touchend', function () {
            that.character.input.keys.forward = false;
        }, false);
        moveFowardButton.addEventListener('mousedown', function () {
            that.character.input.keys.forward = true;
        }, false);
        moveFowardButton.addEventListener('mouseup', function () {
            that.character.input.keys.forward = false;
        }, false);


        let moveBackButton = document.getElementById('OSC_bottom');
        moveBackButton.addEventListener('touchstart', function () {
            that.character.input.keys.backward = true;
        }, false);
        moveBackButton.addEventListener('touchend', function () {
            that.character.input.keys.backward = false;
        }, false);
        moveBackButton.addEventListener('mousedown', function () {
            that.character.input.keys.backward = true;
        }, false);
        moveBackButton.addEventListener('mouseup', function () {
            that.character.input.keys.backward = false;
        }, false);


        let moveLeftButton = document.getElementById('OSC_left');
        moveLeftButton.addEventListener('touchstart', function () {
            that.character.input.keys.left = true;
        }, false);
        moveLeftButton.addEventListener('touchend', function () {
            that.character.input.keys.left = false;
        }, false);
        moveLeftButton.addEventListener('mousedown', function () {
            that.character.input.keys.left = true;
        }, false);
        moveLeftButton.addEventListener('mouseup', function () {
            that.character.input.keys.left = false;
        }, false);


        let moveRightButton = document.getElementById('OSC_right');
        moveRightButton.addEventListener('touchstart', function () {
            that.character.input.keys.right = true;
        }, false);
        moveRightButton.addEventListener('touchend', function () {
            that.character.input.keys.right = false;
        }, false);
        moveRightButton.addEventListener('mousedown', function () {
            that.character.input.keys.right = true;
        }, false);
        moveRightButton.addEventListener('mouseup', function () {
            that.character.input.keys.right = false;
        }, false);


    }





}
