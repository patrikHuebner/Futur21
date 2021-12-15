import * as THREE from 'three';
import { useStore } from "vuex";
import { Sky } from 'three/examples/jsm/objects/Sky.js';

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
        this.createSky();
    }



    createLights() {
        this.three.scene.add(new THREE.AmbientLight(0x222222));

        this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
        this.dirLight.position.set(80, 80, 80);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.camera.top = 180;
        this.dirLight.shadow.camera.bottom = - 100;
        this.dirLight.shadow.camera.left = - 120;
        this.dirLight.shadow.camera.right = 120;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.three.scene.add(this.dirLight);





        // const ambientLight = new THREE.AmbientLight(0x000000);
        // this.three.scene.add(ambientLight);

        // const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
        // hemiLight.position.set(0, 200, 0);
        // this.three.scene.add(hemiLight);

        // this.dirLight = new THREE.DirectionalLight(0xffffff);
        // this.dirLight.intensity = 3;
        // this.dirLight.position.set(0, 200, -100);
        // this.dirLight.castShadow = true;
        // this.dirLight.shadow.camera.top = 180;
        // this.dirLight.shadow.camera.bottom = - 100;
        // this.dirLight.shadow.camera.left = - 120;
        // this.dirLight.shadow.camera.right = 120;
        // this.dirLight.shadow.mapSize.width = 512;
        // this.dirLight.shadow.mapSize.height = 512;
        // this.three.scene.add(this.dirLight);
    }


    createSky() {
        this.sky = new Sky();
        this.sky.scale.setScalar(450000);
        this.three.scene.add(this.sky);

        const effectController = {
            turbidity: 10,
            rayleigh: 0.5,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: 1,
            azimuth: 180,
            exposure: this.three.renderer.toneMappingExposure
        };

        var uniforms = this.sky.material.uniforms;

        uniforms["turbidity"].value = effectController.turbidity;
        uniforms["rayleigh"].value = effectController.rayleigh;
        uniforms["mieCoefficient"].value = effectController.mieCoefficient;
        uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;
        uniforms["sunPosition"].value.set(400000, 400000, 400000);
    }




    update() {
        if (this.sketch.character) {
            // this.dirLight.position.copy(this.three.camera.position);
            // this.dirLight.shadow.camera.top = this.three.camera.position.z + 180;
            // this.dirLight.shadow.camera.bottom = this.three.camera.position.z - 100;
            // this.dirLight.shadow.camera.left = this.three.camera.position.z - 120;
            // this.dirLight.shadow.camera.right = this.three.camera.position.z + 120;
        }

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