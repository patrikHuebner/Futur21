import * as THREE from 'three';
import { gsap, Sine, Back } from 'gsap';
import { random, hexToRgb, map } from '@/utils/utils.js';
import { useStore } from "vuex";
import Lights from './Lights.js';
import Character from './Character.js';
import Boxes from './Boxes.js';
import RayCaster from './RayCaster.js';
import AI from './AI.js';

export default class Sketch {

    constructor(args) {
        // VueX
        this.store = useStore();

        // ThreeManager
        this.three = args.threeManager;

        // Animation
        this.mixer = null;
        this.nextColor = null;
        this.cameraTimeout = null;
        this.triggerActive = false;
        this.autoMoveDelay = 20000;
        this.autoMoveTimer = null;


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
            position: new THREE.Vector3(0, 0, 0),
            userControlled: true,
        });
        // Setup character auto movement
        this.init_autoMove();


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

        // Init AI
        this.AI = new AI({
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

        if (this.boxes) {
            this.boxes.update();
        }

        if (this.lights) {
            this.lights.update();
        }

        if (this.rayCaster) {
            this.rayCaster.update();
        }

        if (this.AI) {
            this.AI.update();
        }
    }






    // METHODS ---------------------------------------------------------------------------------------------
    init_autoMove() {
        this.createAutoMoveTimer();
        this.autoKeyPresses = 0;
        document.addEventListener('keydown', (e) => this.autoMoveKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.autoMoveKeyUp(e), false);
    }
    createAutoMoveTimer() {
        this.autoMoveTimer = setTimeout(() => {
            if (this.character) {
                let loc = new THREE.Vector3(Math.random() * 400, 0, Math.random() * 400);
                this.character.locMesh.position.x = loc.x;
                this.character.locMesh.position.y = 10;
                this.character.locMesh.position.z = loc.z;
                this.character.walkTo(loc);
            }
        }, this.autoMoveDelay);
    }
    autoMoveKeyDown(e) {
        if (!e.repeat) {
            if (e.keyCode == 38 || e.keyCode == 87 || e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 40 || e.keyCode == 83 || e.keyCode == 39 || e.keyCode == 68) {
                this.autoKeyPresses++;
            }
        }

        if (this.character.autoMove) {
            this.character.input.keys.shift = false;
        }

        this.character.cameraTurnSpeed = 0.3;
        this.character.cameraOffset = new THREE.Vector3(-15, 20, -30);
        this.character.cameraLookat = new THREE.Vector3(0, 10, 50);
        clearTimeout(this.character.interactionTimeout);
        clearTimeout(this.character.motionTimeout);
        clearTimeout(this.autoMoveTimer);
        this.character.autoMove = false;
    }
    autoMoveKeyUp(e) {
        if (e.keyCode == 38 || e.keyCode == 87 || e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 40 || e.keyCode == 83 || e.keyCode == 39 || e.keyCode == 68) {
            this.autoKeyPresses--;
        }

        if (this.autoKeyPresses == 0) {
            this.character.input.keys.forward = false;
            this.character.input.keys.backward = false;
            this.character.input.keys.left = false;
            this.character.input.keys.right = false;
            this.createAutoMoveTimer();
        }
    }






    init_scene() {
        // Background
        this.three.scene.background = new THREE.Color(0xa0a0a0);

        // Fog
        this.three.scene.fog = new THREE.FogExp2(0xDFE9F3, 0.003); // 0xDFE9F3
    }





    reactToMouseMove(e) {
        if (this.character && !this.triggerActive) {
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
        this.triggerActive = true;

        // Move camera into front of character
        this.character.cameraOffset = new THREE.Vector3(2, 15, 30);
        this.character.cameraLookat = new THREE.Vector3(0, 10, 0);

        // Trigger interaction box animation
        this.boxes.interactionBoxAnimation();

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

            clearTimeout(this.cameraTimeout);
            this.cameraTimeout = setTimeout(() => {
                // Move camera back into position
                this.character.cameraOffset = new THREE.Vector3(-15, 20, -30);
                this.character.cameraLookat = new THREE.Vector3(0, 10, 50);
                this.triggerActive = false;
            }, 2000);

            // Update boxes
            this.boxes.updateBoxPositions();
        }, 6000);
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
            map: texture,
        });

        this.floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20000, 20000),
            floorMaterial
        );

        this.floor.rotation.x = - Math.PI / 2;
        this.floor.receiveShadow = true;
        this.three.scene.add(this.floor);
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
