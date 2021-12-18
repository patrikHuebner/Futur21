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
        this.boxSize = 20;
        this.boxes = [];

        // Init
        this.init();
    }

    init() {
        this.loadTextures().then(() => {
            this.addMainBoxes();
            this.addSecondaryBoxes();
            this.initBoxMovement();
        })
    }




    // SELECT A RANDOM BOX AND MOVE IT TO A NEW DESTINATION ---------------------------------------------------------------------------------------------
    initBoxMovement() {
        setInterval(() => {
            let randomBox = this.boxes[Math.floor(Math.random() * this.boxes.length)];
            if (randomBox.userData.collision) return;

            this.moveSingleBox(randomBox, 'slow');
        }, 2000);
    }




    // TEXTURES: LOAD AND INITIALIZE ---------------------------------------------------------------------------------------------
    loadTextures() {
        this.textureLoader = new THREE.TextureLoader();
        this.textures = [];
        this.textureCount = 30;
        let that = this;
        let loadedTextures = 0;

        return new Promise(resolve => {
            for (let i = 0; i < this.textureCount; i++) {
                let currentTexture = this.textureLoader.load(
                    'textures/' + i + '.png',
                    function () {
                        // Add to texture arrray
                        that.textures.push(currentTexture);

                        // Initialize the given texture ahead of time to improve texture load on first visibility
                        that.three.renderer.initTexture(currentTexture);

                        // Increment counter for each successfully loaded texture
                        loadedTextures++;
                        
                        // When all textures have been loaded, resolve...
                        if (loadedTextures == that.textureCount) {
                            resolve('All textures loaded');
                        }
                    }
                );
            }
        });
    }





    // GENERATE A NEW POSITION VECTOR ---------------------------------------------------------------------------------------------
    getNewBoxPosition() {
        let newPos;
        let distanceToCharacter;

        do {
            // Generate a general random position
            newPos = new THREE.Vector3(
                Math.floor(Math.random() * 20 - 10) * 20,
                Math.floor(Math.random() * 20) * 7 + 10,
                Math.floor(Math.random() * 20 - 10) * 20
            );

            // Move new position into vicinity of main character
            newPos.x += this.sketch.character.Position.x;
            newPos.y += this.sketch.character.Position.y;
            newPos.z += this.sketch.character.Position.z;

            // Make sure the new position does not collide with our character
            distanceToCharacter = newPos.distanceTo(this.sketch.character.position);
        } while (distanceToCharacter < 40);

        return newPos;
    }





    // BOXES: MAIN ---------------------------------------------------------------------------------------------
    addMainBoxes() {
        // Crate BoxBufferGeometry
        const boxGeometry = new THREE.BoxBufferGeometry(this.boxSize, this.boxSize, this.boxSize).toNonIndexed();
        // prepare geometry to use 2 materials
        boxGeometry.clearGroups();
        boxGeometry.addGroup(0, Infinity, 0);
        boxGeometry.addGroup(0, Infinity, 1);
        boxGeometry.addGroup(0, Infinity, 2);

        for (let i = 0; i < 30; i++) {
            // Material
            let texture = this.textures[i];
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
                emissive: 0x6e6e6e,
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
            let boxPos = this.getNewBoxPosition();
            box.position.x = boxPos.x;
            box.position.y = boxPos.y;
            box.position.z = boxPos.z;
            box.userData.rotation = 1;
            // box.frustumCulled = false;

            // Add box to array and scene
            this.three.scene.add(box);
            this.boxes.push(box);
        }
    }




    // BOXES: SECONDARY ---------------------------------------------------------------------------------------------
    addSecondaryBoxes() {
        // Crate BoxBufferGeometry
        const boxGeometry = new THREE.BoxBufferGeometry(this.boxSize, this.boxSize, this.boxSize).toNonIndexed();

        for (let i = 0; i < 60; i++) {
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

            let boxPos = this.getNewBoxPosition();
            box.position.x = boxPos.x;
            box.position.y = boxPos.y;
            box.position.z = boxPos.z;
            box.userData.rotation = 1;

            // Add box to array and scene
            this.three.scene.add(box);
            this.boxes.push(box);
        }
    }





    // BOXES: MOVE A SINGLE BOX TO A NEW POSITION ---------------------------------------------------------------------------------------------
    moveSingleBox(box, speed) {
        let newPos = this.getNewBoxPosition();

        let speedFactor = 2;
        if (speed == 'slow') {
            speedFactor = 6;
        }

        gsap.to(box.scale, {
            y: random(1, 3),
            duration: Math.random() * speedFactor + 1,
            ease: Sine.easeInOut,
        });

        gsap.to(box.position, {
            x: newPos.x,
            y: newPos.y,
            z: newPos.z,
            duration: Math.random() * speedFactor + 1,
            ease: Sine.easeInOut,
            onComplete: () => {
                box.userData.collision = false;
            }
        });

        gsap.to(box.rotation, {
            z: radians(box.userData.rotation * 360),
            duration: Math.random() * speedFactor + 2,
            ease: Sine.easeInOut,
            onComplete: () => {
                box.userData.rotation++;
            }
        });

    }





    // BOXES: UPDATE ALL POSITIONS ---------------------------------------------------------------------------------------------
    updateBoxPositions() {
        for (let index in this.boxes) {
            let child = this.boxes[index];

            let newPos = this.getNewBoxPosition();

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
                z: radians(child.userData.rotation * 360),
                duration: Math.random() * 4 + 1,
                ease: Sine.easeInOut,
                onComplete: () => {
                    child.userData.rotation++;
                }
            });
        }
    }



}