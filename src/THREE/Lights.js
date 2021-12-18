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





    createLights() {
        // Ambient Light
        this.three.scene.add(new THREE.AmbientLight(0x222222));


        // Directional light
        let shadowDistance = 300;
        this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
        this.dirLight.position.set(0, 80, -50);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.camera.top = shadowDistance;
        this.dirLight.shadow.camera.bottom = - shadowDistance;
        this.dirLight.shadow.camera.left = - shadowDistance;
        this.dirLight.shadow.camera.right = shadowDistance;
        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;
        this.three.scene.add(this.dirLight);
        this.three.scene.add(this.dirLight.target);



        // // ShadowHelper
        // this.shadowHelper = new THREE.CameraHelper(this.dirLight.shadow.camera)
        // this.three.scene.add(this.shadowHelper)
    }







    update() {
        if (this.shadowHelper) {
            this.shadowHelper.update();
        }
        if (this.sketch.character) {
            let vector = this.sketch.character.position.clone();
            this.dirLight.position.x = vector.x;
            this.dirLight.position.z = vector.z-50;

            this.dirLight.target.position.x = vector.x;
            this.dirLight.target.position.z = vector.z+50;

            this.dirLight.updateMatrix();
            this.dirLight.updateMatrixWorld();
        }
    }
}