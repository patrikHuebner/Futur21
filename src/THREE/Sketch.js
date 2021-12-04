import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { radians } from '@/utils/utils.js';
const glsl = require('glslify');


export default class Sketch {

    constructor(args) {
        this.three = args.threeManager;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.init();
    }


    // INIT ---------------------------------------------------------------------------------------------

    init() {
        this.initLights();
        this.createShaderMaterial();
        // this.loadThinkerModel();
        this.addGround();
        this.loadFBX();
    }


    animate() {
        this.animateFBX();
        this.animateShader();
        // this.rotateScene();
    }






    // METHODS ---------------------------------------------------------------------------------------------


    createShaderMaterial() {
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
        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: glsl(require('./shader/vertex.glsl').default),
            fragmentShader: glsl(require('./shader/zebra-fragment.glsl').default),
        });
    }


    addGround() {
        // ground
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        this.three.scene.add(mesh);

        const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        this.three.scene.add(grid);
    }



    loadFBX() {
        let that = this;


        // model
        const loader = new FBXLoader();
        loader.load('models/Button_Pushing.fbx', function (object) {

            that.mixer = new THREE.AnimationMixer(object);

            const action = that.mixer.clipAction(object.animations[0]);
            action.setLoop(THREE.LoopOnce);
            action.clampWhenFinished = true;
            action.play();

            that.mixer.addEventListener('finished', () => {
                console.log('Finished')
                console.log(action)
                action.play();
            });

            object.traverse(function (child) {

                if (child.isMesh) {

                    child.castShadow = true;
                    child.receiveShadow = true;
                    // child.material = that.shaderMaterial;

                }

                let scale = 0.05;
                object.scale.set(scale, scale, scale);

            });

            that.three.scene.add(object);
        });

    }





    loadThinkerModel() {
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
        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: glsl(require('./shader/vertex.glsl').default),
            fragmentShader: glsl(require('./shader/zebra-fragment.glsl').default),
        });

        // Load the head
        const loader = new OBJLoader();
        let that = this;
        this.thinker = null;
        loader.load(
            'models/TheThinker-Decimated.obj',
            function (object) {
                // Center object
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = that.shaderMaterial;
                        child.geometry.center();
                    }
                });
                // object.material = that.shaderMaterial;
                object.rotation.y = radians(-55);

                // Scale
                let scaleTo = .4;
                object.scale.set(scaleTo, scaleTo, scaleTo);

                // Add to scene
                that.thinker = object;
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



    animateFBX() {
        const delta = this.clock.getDelta();
        if (this.mixer) {
            // console.log(this.mixer._actions[0])
            this.mixer.update(delta);
        }
    }




    animateShader() {
        if (this.shaderMaterial != undefined) {
            this.shaderMaterial.uniforms['time'].value = 0.01 * (Date.now() - this.three.start);
        }
    }


    rotateScene() {
        this.three.scene.rotation.y -= 0.001;
    }








    initLights() {
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
        hemiLight.position.set(0, 200, 0);
        this.three.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(0, 200, 100);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 180;
        dirLight.shadow.camera.bottom = - 100;
        dirLight.shadow.camera.left = - 120;
        dirLight.shadow.camera.right = 120;
        this.three.scene.add(dirLight);
    }


}
