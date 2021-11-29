import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { radians } from '@/utils/utils.js';
const glsl = require('glslify');


export default class Sketch {

    constructor(args) {
        this.three = args.threeManager;
        this.init();
    }


    // INIT ---------------------------------------------------------------------------------------------

    init() {
        this.initLights();
        this.addHeadGeometry();
        // this.addGeometry();
    }


    animate() {
        this.animateShader();
    }






    // METHODS ---------------------------------------------------------------------------------------------

    initLights() {
        // Directional Light 1
        this.directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight1.position.set(10, 10, 5);
        this.three.scene.add(this.directionalLight1);

        // Directional Light 2
        this.directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight2.position.set(-10, -10, -5);
        this.three.scene.add(this.directionalLight2);
    }



    addHeadGeometry() {
        // ShaderMaterial
        const uniforms = {
            time: { type: "f", value: 0 },
            mouse: { type: "vec2", value: new THREE.Vector2(100, 100) },
            speed: { type: "f", value: 0.1 },
            scale: { type: "f", value: 15.1 },
            redChannel: { type: "vec3", value: new THREE.Vector3(.5, .5, 1.) },
            greenChannel: { type: "vec3", value: new THREE.Vector3(.5, .5, 1.) },
            blueChannel: { type: "vec3", value: new THREE.Vector3(.3, .5, 1.) },
            fluidType: { type: "i", value: 1 },
            horizontalMovement: { type: "vec2", value: new THREE.Vector2(0.3, 3.) },
            verticalMovement: { type: "vec2", value: new THREE.Vector2(0.3, 3.) },
        };
        // const uniforms = {
        //     time: { type: 'f', value: 0 },
        // }
        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: glsl(require('./shader/vertex.glsl').default),
            fragmentShader: glsl(require('./shader/fragment.glsl').default),
        });

        // Load the head
        const loader = new OBJLoader();
        let that = this;
        this.head = null;
        loader.load(
            'models/Head.obj',
            function (object) {

                // Center object
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        if (child.name == 'eye_low_L_eyeball_mesh.003' || child.name == 'eye_low_L.001_eyeball_mesh.004') {
                            let scaleTo = 0;
                            child.scale.set(scaleTo, scaleTo, scaleTo);
                        }
                        child.material = that.shaderMaterial;
                        child.geometry.center();
                    }
                });
                object.material = that.shaderMaterial;
                object.rotation.y = radians(95);

                // Scale
                let scaleTo = 40;
                object.scale.set(scaleTo, scaleTo, scaleTo);

                // Add to scene
                that.head = object;
                that.three.scene.add(object);
            },
            function (xhr) {
                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error('An error happened while loading/parsing the OBJ file');
            }
        );

    }



    animateShader() {
        if (this.head != undefined) {
            this.shaderMaterial.uniforms['time'].value = 0.01 * (Date.now() - this.three.start);
        }
    }


}
