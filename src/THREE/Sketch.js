import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { gsap, Sine } from 'gsap';
import { generateRandomColor, radians, random } from '@/utils/utils.js';


export default class Sketch {

    constructor(args) {
        this.three = args.threeManager;

        this.mixer = null;
        this.clock = new THREE.Clock();
        this.animation_waitBeforeNextLoop = 3000;

        this.boxSize = 20;
        this.boxes = [];
        this.loopIteration = 0;

        this.animateCamera = false;

        this.init();
    }


    // INIT ---------------------------------------------------------------------------------------------

    init() {
        this.initLights();
        this.addGround();
        this.loadFBX();
        this.addBoxes();
    }


    animate() {
        this.animateFBX();
        this.rotateScene();
    }






    // METHODS ---------------------------------------------------------------------------------------------



    // BOXES: INIT ---------------------------------------------------------------------------------------------
    addBoxes() {
        const boxGeometry = new THREE.BoxGeometry(this.boxSize, this.boxSize, this.boxSize).toNonIndexed();
        this.boxMaterial = new THREE.MeshPhysicalMaterial({
            clearcoat: 0.5,
            metalness: 0,
            color: 0xffffff,
            normalScale: new THREE.Vector2(0.15, 0.15),
            clearcoatNormalScale: new THREE.Vector2(2.0, - 2.0)
        });

        for (let i = 0; i < 200; i++) {
            // Generate box and random position
            const box = new THREE.Mesh(boxGeometry, this.boxMaterial);
            // box.castShadow = true;
            box.receiveShadow = true;
            box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
            box.position.y = Math.floor(Math.random() * 20) * 10 + 10;
            box.position.z = Math.floor(Math.random() * 20 - 10) * 20;

            // Make sure the box is not in the exact center and obscures our guy
            if (box.position.x > -20 && box.position.x < -20) {
                box.position.x = 30;
            }

            // Add box to array and scene
            this.three.scene.add(box);
            this.boxes.push(box);
        }
    }



    // BOXES: UPDATE ---------------------------------------------------------------------------------------------
    updateBoxPositions() {
        for (let index in this.boxes) {
            let child = this.boxes[index];

            let newPos = new THREE.Vector3(
                Math.floor(Math.random() * 20 - 10) * 20,
                Math.floor(Math.random() * 20) * 20 + 10,
                Math.floor(Math.random() * 20 - 10) * 20
            );

            // Make sure the box is not in the exact center and obscures our guy
            if (newPos.x > -20 && newPos.x < 20) {
                newPos.x = 30;
            }

            gsap.to(child.scale, {
                y: random(1, 3),
                duration: Math.random() * 4 + 1,
                ease: Sine.easeInOut,
            });

            gsap.to(child.position, {
                x: newPos.x,
                y: newPos.y,
                z: newPos.z,
                duration: Math.random() * 4 + 1,
                ease: Sine.easeInOut,
            });

            gsap.to(child.rotation, {
                z: radians(this.loopIteration * 180),
                // y: newPos.y,
                // z: newPos.z,
                duration: Math.random() * 4 + 1,
                ease: Sine.easeInOut,
            });


        }
    }




    // LOOP ---------------------------------------------------------------------------------------------
    objectTimer() {
        setTimeout(() => {
            this.loopIteration++;

            // Update box positions
            this.updateBoxPositions();

            //
            let hexColor = generateRandomColor();
            this.colorMaterial.color = new THREE.Color(hexColor);

            // // Random color
            // let hexColor = this.generateRandomColor();
            // this.three.renderer.setClearColor(new THREE.Color(hexColor));
            // this.floor.material.color = new THREE.Color(hexColor);
            // this.dirLight.color = new THREE.Color(hexColor);

            // Camera
            if (this.animateCamera) {
                gsap.to(this.three.camera.rotation, {
                    z: radians(random(-10, 10)),
                    duration: Math.random() * 4 + 1,
                    ease: Sine.easeInOut,
                });
                gsap.to(this.three.camera.position, {
                    z: random(5, 50),
                    duration: random(3, 7),
                    ease: Sine.easeInOut,
                });
            }

        }, 2850);
    }




    // SCENE: ROTATE ---------------------------------------------------------------------------------------------
    rotateScene() {
        if (this.animateCamera) {
            this.three.scene.rotation.y -= 0.001;
        }
    }




    // CHARACTER: ANIMATE ---------------------------------------------------------------------------------------------
    animateFBX() {
        const delta = this.clock.getDelta();
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }





    // CHARACTER: LOAD ---------------------------------------------------------------------------------------------
    loadFBX() {
        let that = this;

        this.colorMaterial = new THREE.MeshPhysicalMaterial({
            clearcoat: 1.0,
            metalness: 0.5,
        });


        // model
        const loader = new FBXLoader();
        loader.load('models/Button_Pushing.fbx', function (object) {

            // Create mixer and action
            that.mixer = new THREE.AnimationMixer(object);
            const action = that.mixer.clipAction(object.animations[0]);

            // Handle manually repeating the action
            action.setLoop(THREE.LoopOnce);
            action.clampWhenFinished = true;
            that.mixer.addEventListener('finished', () => {
                setTimeout(() => {
                    that.mixer.time = 0;
                    action.reset();
                    action.play();
                    that.objectTimer();
                }, that.animation_waitBeforeNextLoop);
            });

            // Trigger initial animation
            action.play();

            // 
            that.objectTimer();

            // Traverse to set shadows, scale and apply material
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    child.material = that.colorMaterial;

                    // child.material = that.shaderMaterial;
                }

                let scale = 0.05;
                object.scale.set(scale, scale, scale);
            });

            // Add to scene
            that.three.scene.add(object);
        });

    }



    // GROUND PLANE ---------------------------------------------------------------------------------------------
    addGround() {
        const floorMaterial = new THREE.MeshPhongMaterial({
            color: 0x999999,
            depthWrite: true
        });

        this.floor = new THREE.Mesh(
            new THREE.PlaneGeometry(2000, 2000),
            floorMaterial
        );

        this.floor.rotation.x = - Math.PI / 2;
        this.floor.receiveShadow = true;
        this.three.scene.add(this.floor);

        const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
        grid.material.opacity = 1;
        grid.material.transparent = true;
        this.three.scene.add(grid);
    }




    // LIGHTS ---------------------------------------------------------------------------------------------
    initLights() {
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
        hemiLight.position.set(0, 200, 0);
        this.three.scene.add(hemiLight);

        this.dirLight = new THREE.DirectionalLight(0xffffff);
        this.dirLight.position.set(0, 200, 100);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.camera.top = 180;
        this.dirLight.shadow.camera.bottom = - 100;
        this.dirLight.shadow.camera.left = - 120;
        this.dirLight.shadow.camera.right = 120;
        this.dirLight.shadow.mapSize.width = 512;
        this.dirLight.shadow.mapSize.height = 512;
        this.three.scene.add(this.dirLight);
    }




}
