import * as THREE from 'three';
import { gsap, Sine, Back } from 'gsap';
import { map, radians, random } from '@/utils/utils.js';
import { useStore } from "vuex";
import Character from './Character.js';


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
        this.manualCameraAnimation = false;
        this.rotateCamera = false;

        // Boxes
        this.boxSize = 20;
        this.boxes = [];
        this.loopIteration = 0;
        this.nextColor = null;

        // Init
        this.init();
    }


    // INIT ---------------------------------------------------------------------------------------------

    init() {
        this.initLights();
        this.addGround();
        this.initCharacter();
        this.addBoxes();

        // Rect to mouse movement
        window.addEventListener('mousemove', e => { this.reactToMouseMove(e); });
    }


    animate() {
        if (this.character) {
            this.character.update();
            // this.dirLight.position.set(this.character.Position.x, 200, this.character.Position.z + 100);
        }

        this.rotateScene();
    }






    // METHODS ---------------------------------------------------------------------------------------------
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




    initCharacter() {
        this.character = new Character({
            threeManager: this.three,
            sketch: this,
        })
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




        for (let i = 0; i < 10; i++) {
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










    triggerInteractionEvent() {
        // this.rotateCamera = true;
        // this.manualCameraAnimation = true;

        clearTimeout(this.interactionTimeout);
        this.interactionTimeout = setTimeout(() => {
            this.updateBoxPositions();
        }, 3000);        
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

            newPos.x += this.character.Position.x;
            newPos.y += this.character.Position.y;
            newPos.z += this.character.Position.z;

            // // Make sure the box is not in the exact center and obscures our guy
            // if (newPos.x > -20 && newPos.x < 20) {
            //     newPos.x = 30;
            // }

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
                duration: Math.random() * 4 + 1,
                ease: Sine.easeInOut,
            });

            // let dummy = { x: 0 };
            // gsap.to(dummy, {
            //     x: 1,
            //     duration: 5,
            //     onComplete: () => {

            //         let idealPosition = this.character.thirdPersonCamera.calculateIdealOffset();
            //         let idealLookAt = this.character.thirdPersonCamera.calculateIdealLookat();
            //         gsap.to(this.three.camera.position, {
            //             x: idealPosition.x,
            //             y: idealPosition.y,
            //             z: idealPosition.z,
            //             duration: 3,
            //             onUpdate: () => {
            //                 this.three.camera.lookAt(idealLookAt);
            //                 this.three.camera.updateProjectionMatrix();
            //             },
            //             onComplete: () => {
            //                 this.rotateCamera = false;
            //                 this.manualCameraAnimation = false;
            //             }
            //         });

            //     }
            // });

        }
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
        const floorMaterial = new THREE.MeshPhongMaterial({
            color: 0x999999,
            depthWrite: true
        });

        this.floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20000, 20000),
            floorMaterial
        );

        this.floor.rotation.x = - Math.PI / 2;
        this.floor.receiveShadow = true;
        this.three.scene.add(this.floor);

        const grid = new THREE.GridHelper(20000, 200, 0x000000, 0x000000);
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
        this.dirLight.intensity = 2;
        this.dirLight.position.set(0, 200, -100);
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
