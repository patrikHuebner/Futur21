import * as THREE from 'three';
import { useStore } from "vuex";
import { gsap, Sine, Back } from 'gsap';
import { radians, random } from '@/utils/utils.js';
// const glsl = require('glslify');

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
            this.addInteractionBox();
            this.initBoxMovement();
        })
    }


    update() {
        // if (this.shaderMaterial != undefined) {
        //     this.shaderMaterial.uniforms['time'].value = 0.01 * (Date.now() - this.three.start);
        // }
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
        this.diceTextures = [];
        this.textureCount = 36;
        let that = this;
        let loadedTextures = 0;

        return new Promise(resolve => {
            // Load dice textures
            for (let i = 0; i < 6; i++) {
                this.textureLoader.load(
                    'textures/dice-' + i + '.png',
                    function (texture) {
                        // Increment counter for each successfully loaded texture
                        loadedTextures++;

                        that.diceTextures.push(texture)

                        // When all textures have been loaded, resolve...
                        if (loadedTextures == that.textureCount) {
                            resolve('All textures loaded');
                        }
                    }
                );
            }

            // Load text textures
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





    addInteractionBox() {
        // // ShaderMaterial
        // const uniforms = {
        //     time: { type: "f", value: 0 },
        //     scale: { type: "f", value: 1.5 },
        // };
        // this.shaderMaterial = new THREE.ShaderMaterial({
        //     uniforms: uniforms,
        //     vertexShader: glsl(require('./shader/vertex.glsl').default),
        //     fragmentShader: glsl(require('./shader/zebra-fragment.glsl').default),
        // });



        let materials = [];
        for (let i = 0; i < 6; i++) {
            let diceMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: this.diceTextures[i]
            });
            materials.push(diceMaterial);
        }
        this.diceMaterial = [materials[0], materials[1], materials[2], materials[3], materials[4], materials[5]];

        let boxSize = 1;

        let geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
        this.interactionBox = new THREE.Mesh(geometry, this.diceMaterial);
        this.interactionBox.position.x = 0;
        this.interactionBox.position.y = -10;
        this.interactionBox.castShadow = true;
        this.interactionBox.position.z = 0;

        this.three.scene.add(this.interactionBox);
    }



    interactionBoxAnimation() {
        // // Set new shader scale
        // this.shaderMaterial.uniforms.scale.value = random(0.2, 7);

        // Re-Scale box correctly
        this.interactionBox.scale.x = 1;
        this.interactionBox.scale.y = 1;
        this.interactionBox.scale.z = 1;


        // Re-orient box correctly
        this.interactionBox.rotation.x = 0;
        this.interactionBox.rotation.y = 0;
        this.interactionBox.rotation.z = 0;

        // Determine position of hand
        let handPosition = new THREE.Vector3(0, 0, 15);
        handPosition.applyQuaternion(this.sketch.character.Rotation);
        handPosition.add(this.sketch.character.position);

        // Move box into place ahead of time
        this.interactionBox.position.x = handPosition.x;
        this.interactionBox.position.y = -10;
        this.interactionBox.position.z = handPosition.z;





        // Show the box at correct height
        gsap.to(this.interactionBox.position, {
            y: 13.5,
            delay: 0,
            duration: 2,
            ease: Back.easeInOut,
        });

        // Rotate box #1
        gsap.to(this.interactionBox.rotation, {
            y: radians(random(-360, 360)),
            delay: 3.2,
            duration: 1,
        });
        // Rotate box #2
        gsap.to(this.interactionBox.rotation, {
            z: radians(random(-360, 360)),
            delay: 3.9,
            duration: 1,
        });



        // // Rotate box #3
        // gsap.to(this.interactionBox.rotation, {
        //     x: radians(random(-360, 360)),
        //     y: radians(random(-360, 360)),
        //     z: radians(random(-360, 360)),
        //     delay: 6,
        //     duration: 1,
        // });
        // Scale box
        gsap.to(this.interactionBox.scale, {
            x: 4,
            y: 4,
            z: 4,
            delay: 6.3,
            duration: 2,
        });



        // // Show the box at correct height
        // gsap.to(this.interactionBox.position, {
        //     y: 13,
        //     delay: 0,
        //     duration: 2,
        //     ease: Back.easeInOut,
        // });

        // // Rotate box #1
        // gsap.to(this.interactionBox.rotation, {
        //     y: radians(-180),
        //     delay: 2.7,
        //     duration: 1,
        // });
        // // Rotate box #2
        // gsap.to(this.interactionBox.rotation, {
        //     z: radians(-180),
        //     delay: 3.4,
        //     duration: 1,
        // });



        // // Rotate box #3
        // gsap.to(this.interactionBox.rotation, {
        //     x: radians(0),
        //     y: radians(0),
        //     z: radians(0),
        //     delay: 5.5,
        //     duration: 0,
        // });
        // // Scale box
        // gsap.to(this.interactionBox.scale, {
        //     x: 4,
        //     y: 4,
        //     z: 4,
        //     delay: 5.8,
        //     duration: 2,
        // });

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