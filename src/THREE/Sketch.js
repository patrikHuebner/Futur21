import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { gsap, Sine, Back } from 'gsap';
import { hexToRgb, radians, random } from '@/utils/utils.js';
import { useStore } from "vuex";


export default class Sketch {

    constructor(args) {
        // VueX
        this.store = useStore();

        // ThreeManager
        this.three = args.threeManager;
        this.textureLoader = new THREE.TextureLoader();

        // Animation
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.animation_waitBeforeNextLoop = 3000;
        this.animateCamera = true;

        // Boxes
        this.boxSize = 20;
        this.boxes = [];
        this.smallBoxes = [];
        this.loopIteration = 0;
        this.nextColor = null;

        // Init
        this.init();
    }


    // INIT ---------------------------------------------------------------------------------------------

    init() {
        this.initLights();
        this.addGround();
        this.loadFBX();
        this.addBoxes();
        this.addSmallBoxes();
    }


    animate() {
        this.animateFBX();
        this.rotateScene();
    }






    // METHODS ---------------------------------------------------------------------------------------------
    addSmallBoxes() {
        let boxSize = 0.2;
        let boxGeometry = new THREE.SphereBufferGeometry(boxSize, 32).toNonIndexed();

        for (let i = 0; i < 3; i++) {
            let boxMaterial = new THREE.MeshPhongMaterial({
                specular: 0x111111,
                emissive: 0x000000,
                shininess: 30,
                reflectivity: 1,
            });

            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.x = -2 + i * 2;
            box.position.y = 5;
            box.position.z = 2.05;
            box.castShadow = true;
            box.receiveShadow = true;

            this.three.scene.add(box);
            this.smallBoxes.push(box);
        }
    }
    smallBoxes_animateIn(firstRun) {
        this.nextColor = this.store.state.colors.primary[Math.round(random(0, this.store.state.colors.primary.length))];
        let color2 = this.store.state.colors.primary[Math.round(random(0, this.store.state.colors.primary.length))];
        let color3 = this.store.state.colors.primary[Math.round(random(0, this.store.state.colors.primary.length))];
        let objectColors = [color2, this.nextColor, color3];

        for (let index in this.smallBoxes) {
            let box = this.smallBoxes[index];
            let duration = Math.random() * 3 + 1;
            if (firstRun) {
                duration = 0;
            }
            box.material.color = new THREE.Color(objectColors[index]);
            gsap.to(box.position, {
                y: 5,
                duration: duration,
                ease: Back.easeInOut,
            });
        }
    }
    smallBoxes_animateOut() {
        for (let index in this.smallBoxes) {
            let box = this.smallBoxes[index];
            gsap.to(box.position, {
                y: -2,
                duration: Math.random() * 2 + 1,
                ease: Sine.easeIn,
            });
        }
    }


    // BOXES: INIT ---------------------------------------------------------------------------------------------
    addBoxes() {
        let textureCount = 15;

        // Crate BoxBufferGeometry
        const boxGeometry = new THREE.BoxBufferGeometry(this.boxSize, this.boxSize, this.boxSize).toNonIndexed();
        // prepare geometry to use 2 materials
        boxGeometry.clearGroups();
        boxGeometry.addGroup(0, Infinity, 0);
        boxGeometry.addGroup(0, Infinity, 1);
        boxGeometry.addGroup(0, Infinity, 2);

        for (let i = 0; i < 30; i++) {
            // Material
            let texture = this.textureLoader.load('textures/' + i + '.png');
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            let boxMaterial_alpha = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x111111,
                emissive: 0x000000,
                shininess: 30,
                reflectivity: 1,
                map: texture,
                transparent: true,
                opacity: 1,
            });
            let boxMaterial_base = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x111111,
                emissive: 0x000000,
                shininess: 30,
                reflectivity: 1,
            });
            let boxMaterial_wireframe = new THREE.MeshBasicMaterial({
                wireframe: true,
                color: 0x000000
            })

            let boxMaterial = [boxMaterial_alpha, boxMaterial_wireframe, boxMaterial_base];



            // Generate box and random position
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            // box.castShadow = true;
            box.receiveShadow = true;
            box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
            box.position.y = Math.floor(Math.random() * 20) * 7 + 10;
            box.position.z = Math.floor(Math.random() * 20 - 10) * 20;

            // Make sure the box is not in the exact center and obscures our guy
            if (box.position.x > -20 && box.position.x < -20) {
                box.position.x = 30;
            }

            // Add box to array and scene
            this.three.scene.add(box);
            this.boxes.push(box);
        }




        for (let i = 0; i < 30; i++) {
            let boxMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x111111,
                emissive: 0x000000,
                shininess: 30,
                reflectivity: 1,
            });

            // Generate box and random position
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.castShadow = true;
            box.receiveShadow = true;
            box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
            box.position.y = Math.floor(Math.random() * 20) * 7 + 10;
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
                Math.floor(Math.random() * 20) * 7 + 10,
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
                z: radians(this.loopIteration * 360),
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

            // Random color
            let newColor = hexToRgb(this.nextColor);

            gsap.to(this.colorMaterial.color, {
                r: newColor.r * 0.01,
                g: newColor.g * 0.01,
                b: newColor.b * 0.01,
                duration: Math.random() * 3 + 1,
                // ease: Sine.easeInOut,
            });

            gsap.to(this.floor.material.color, {
                r: newColor.r * 0.01,
                g: newColor.g * 0.01,
                b: newColor.b * 0.01,
                duration: Math.random() * 3 + 1,
                // ease: Sine.easeInOut,
            });


            // this.colorMaterial.color = new THREE.Color(this.nextColor);
            // this.three.renderer.setClearColor(new THREE.Color(hexColor));
            // this.floor.material.color = new THREE.Color(this.nextColor);
            // this.dirLight.color = new THREE.Color(hexColor);

            // Move balls away
            this.smallBoxes_animateOut();

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

                setTimeout(() => {
                    that.smallBoxes_animateIn();
                }, that.animation_waitBeforeNextLoop - 2000)
            });

            // Trigger initial animation
            action.play();
            that.smallBoxes_animateIn(true);

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
        const ambientLight = new THREE.AmbientLight(0x000000);
        this.three.scene.add(ambientLight);

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
