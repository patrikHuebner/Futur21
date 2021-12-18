import * as THREE from 'three';
import { useStore } from "vuex";


export default class Boxes {

    constructor(args) {
        // VueX
        this.store = useStore();

        // References
        this.three = args.threeManager;
        this.sketch = args.sketch;


        // Init
        this.init();
    }

    init() {
        // Collision Raycaster
        this.origin = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.collisionRaycaster = new THREE.Raycaster(this.origin, this.direction, 0, 20);
    }

    update() {
        this.checkCollision();
    }



    // METHODS ---------------------------------------------------------------------------------------------


    checkCollision() {
        let rotationMatrix;
        this.cameraDirection = this.three.camera.getWorldDirection(new THREE.Vector3(0, 0, 0)).clone();
        this.currentDirection;
        this.collision = false;

        // Depending on the move direction, modify the rotation of the ray
        // This way, we will always shoot the ray into the direction where we are walking
        if (this.sketch.character.input.keys.forward) {
            this.currentDirection = 'forward';
        }
        else if (this.sketch.character.input.keys.backward) {
            rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationY(180 * Math.PI / 180);
            this.currentDirection = 'backward'
        }
        else if (this.sketch.character.input.keys.left) {
            rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationY(90 * Math.PI / 180);
            this.currentDirection = 'left';
        }
        else if (this.sketch.character.input.keys.right) {
            rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationY((360 - 90) * Math.PI / 180);
            this.currentDirection = 'right';
        }
        else return;

        // Apply the rotation matrix
        if (rotationMatrix !== undefined) {
            this.cameraDirection.applyMatrix4(rotationMatrix);
        }

        // Always make the ray face forward
        this.cameraDirection.y = 0;

        // Set raycaster origin and direction
        this.collisionRaycaster.ray.origin.copy(this.sketch.character.position);
        this.collisionRaycaster.ray.origin.y = 18;
        this.collisionRaycaster.ray.direction.copy(this.cameraDirection);

        //  Check for intersections with ground objects
        let intersects = this.collisionRaycaster.intersectObjects(this.sketch.boxes.boxes, false);

        // If there are intersections, check if any are below a distance of 7
        // If so: Mark as collision
        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].distance < 25) {
                this.collision = true;
                let intersectedBox = intersects[i].object;
                // If the box has not been marked as one that we collided with
                if (!intersectedBox.userData.collision) {
                    // Mark the box and move it out of the way
                    intersectedBox.userData.collision = true;
                    this.sketch.boxes.moveSingleBox(intersectedBox);
                }
            }
        }
    }

}