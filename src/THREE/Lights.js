import * as THREE from 'three';
import { useStore } from "vuex";


export default class Lights {

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
        this.createLights();
    }



    createLights() {
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



    update() {
        // if (this.sketch.character) {
        //     let vector = this.sketch.character.position.clone(); //Get camera position and put into variable
        //     //vector.applyMatrix4(this.sketch.character.matrixWorld); //Hold the camera location in matrix world
        //     this.dirLight.position.set(vector.x, vector.y, vector.z); //Set light position from that we get

        //     // this.dirLight.position.set(this.sketch.character.Position.x, 200, this.sketch.character.Position.z - 100);
        //     // this.dirLight.shadow.camera.top = this.sketch.character.Position.x + 180;
        //     // this.dirLight.shadow.camera.bottom = this.sketch.character.Position.x - 100;
        //     // this.dirLight.shadow.camera.left = this.sketch.character.Position.x - 120;
        //     // this.dirLight.shadow.camera.right = this.sketch.character.Position.x + 120;
        // }
    }
}