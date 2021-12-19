import { useStore } from "vuex";
import * as THREE from 'three';
import Character from './Character.js';


export default class Boxes {

    constructor(args) {
        // VueX
        this.store = useStore();

        // References
        this.three = args.threeManager;
        this.sketch = args.sketch;

        // // Init
        // this.init();
    }

    init() {
        // Init character
        this.character = new Character({
            threeManager: this.three,
            sketch: this.sketch,
            position: new THREE.Vector3(30, 0, 30),
            userControlled: false,
        });
    }


    update() {
        // this.character.input.keys.forward = true;
        if (this.character) {
            this.character.update();
        }
    }

}