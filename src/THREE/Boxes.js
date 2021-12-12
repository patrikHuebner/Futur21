import * as THREE from 'three';
import { useStore } from "vuex";
import { gsap, Sine, Back } from 'gsap';
import { radians, random } from '@/utils/utils.js';


export default class Boxes {

    constructor(args) {
        // VueX
        this.store = useStore();

        // References
        this.three = args.threeManager;
        this.sketch = args.sketch;

        // Parameters
        this.textureLoader = new THREE.TextureLoader();
        this.boxSize = 20;
        this.boxes = [];
        this.loopIteration = 1;

        // Init
        this.init();
    }

    init() {
        this.addBoxes();
    }




    // BOXES: INIT ---------------------------------------------------------------------------------------------
    addBoxes() {
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




    // BOXES: UPDATE ---------------------------------------------------------------------------------------------
    updateBoxPositions() {
        for (let index in this.boxes) {
            let child = this.boxes[index];

            let newPos = new THREE.Vector3(
                Math.floor(Math.random() * 20 - 10) * 20,
                Math.floor(Math.random() * 20) * 7 + 10,
                Math.floor(Math.random() * 20 - 10) * 20
            );

            newPos.x += this.sketch.character.Position.x;
            newPos.y += this.sketch.character.Position.y;
            newPos.z += this.sketch.character.Position.z;

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

        this.loopIteration++;
    }



}