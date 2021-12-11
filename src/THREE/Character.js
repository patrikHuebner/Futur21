import * as THREE from 'three';
import { Camera } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { useStore } from "vuex";







// CHARACTER ---------------------------------------------------------------------------------------------
export default class Character {

    constructor(args) {
        // VueX
        this.store = useStore();

        // Args
        this.three = args.threeManager;
        this.animations = {};
        this.decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this.acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this.velocity = new THREE.Vector3(0, 0, 0);

        // Init
        this.init();
    }



    init() {
        // Init Input
        this.input = new BasicCharacterControllerInput();

        // Init State Machine
        this.stateMachine = new CharacterFSM(this);

        // Load model and animations
        this.loadModels();
    }



    update() {
        const delta = this.three.clock.getDelta();

        // Check if we can proceed
        if (!this.target || this.stateMachine.currentState == null) {
            return;
        }

        // Update FSM
        this.stateMachine.Update(delta, this.input);

        // Calculate velocity
        const velocity = this.velocity;
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this.decceleration.x,
            velocity.y * this.decceleration.y,
            velocity.z * this.decceleration.z
        );
        frameDecceleration.multiplyScalar(delta);
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
            Math.abs(frameDecceleration.z), Math.abs(velocity.z));

        velocity.add(frameDecceleration);

        // Calculate values based on key input
        const controlObject = this.target;
        const Q = new THREE.Quaternion();
        const A = new THREE.Vector3();
        const R = controlObject.quaternion.clone();

        const acc = this.acceleration.clone();
        if (this.input.keys.shift) {
            acc.multiplyScalar(4.0);
        }

        if (this.stateMachine.currentState.Name == 'pushButton') {
            acc.multiplyScalar(0.0);
        }

        if (this.input.keys.forward) {
            velocity.z += acc.z * delta;
        }
        if (this.input.keys.backward) {
            velocity.z -= acc.z * delta;
        }
        if (this.input.keys.left) {
            A.set(0, 1, 0);
            Q.setFromAxisAngle(A, 4.0 * Math.PI * delta * this.acceleration.y);
            R.multiply(Q);
        }
        if (this.input.keys.right) {
            A.set(0, 1, 0);
            Q.setFromAxisAngle(A, 4.0 * -Math.PI * delta * this.acceleration.y);
            R.multiply(Q);
        }

        controlObject.quaternion.copy(R);

        // Finally, set position
        const oldPosition = new THREE.Vector3();
        oldPosition.copy(controlObject.position);

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(controlObject.quaternion);
        forward.normalize();

        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(controlObject.quaternion);
        sideways.normalize();

        sideways.multiplyScalar(velocity.x * delta);
        forward.multiplyScalar(velocity.z * delta);

        controlObject.position.add(forward);
        controlObject.position.add(sideways);

        oldPosition.copy(controlObject.position);

        // // Make camera follow our character around
        // if (
        //     this.input.keys.forward ||
        //     this.input.keys.backward ||
        //     this.input.keys.left ||
        //     this.input.keys.right ||
        //     this.input.keys.shift ||
        //     this.input.keys.space
        // ) {
        //     this.three.controls.target.set(controlObject.position.x + this.store.state.camera.target.x, controlObject.position.y + this.store.state.camera.target.y, controlObject.position.z + this.store.state.camera.target.z)
        //     this.three.camera.position.set(controlObject.position.x + this.store.state.camera.position.x, controlObject.position.y + this.store.state.camera.position.y, controlObject.position.z + this.store.state.camera.position.z)
        // }

        // Update the actual animation via the mixer
        if (this.mixer) {
            this.mixer.update(delta)
        }
    }


    loadModels() {
        // Load model
        const loader = new FBXLoader();
        loader.load('models/ybot.fbx', (fbx) => {
            fbx.scale.setScalar(0.1);
            fbx.traverse(object => {
                object.castShadow = true;
            });

            this.target = fbx;
            this.three.scene.add(this.target);

            this.mixer = new THREE.AnimationMixer(this.target);

            this.manager = new THREE.LoadingManager();
            this.manager.onLoad = () => {
                this.stateMachine.SetState('idle');
            };

            const OnLoad = (animName, anim) => {
                const clip = anim.animations[0];
                const action = this.mixer.clipAction(clip);

                this.animations[animName] = {
                    clip: clip,
                    action: action,
                };
            };

            // Load animations
            const loader = new FBXLoader(this.manager);
            loader.setPath('animations/');
            loader.load('Idle.fbx', (a) => { OnLoad('idle', a); });
            loader.load('Walking_Forward.fbx', (a) => { OnLoad('walkForward', a); });
            loader.load('Walking_Backward.fbx', (a) => { OnLoad('walkBackward', a); });
            loader.load('Running_Forward.fbx', (a) => { OnLoad('runForward', a); });
            loader.load('Running_Backward.fbx', (a) => { OnLoad('runBackward', a); });
            loader.load('Button_Pushing.fbx', (a) => { OnLoad('pushButton', a); });
        });
    }

}

















// FINITE STATE MACHINE ---------------------------------------------------------------------------------------------
class FiniteStateMachine {
    constructor() {
        this.states = {};
        this.currentState = null;
    }

    AddState(name, type) {
        this.states[name] = type;
    }

    SetState(name) {
        const prevState = this.currentState;

        if (prevState) {
            if (prevState.Name == name) {
                return;
            }
            prevState.Exit();
        }

        const state = new this.states[name](this);

        this.currentState = state;
        state.Enter(prevState);
    }

    Update(timeElapsed, input) {
        if (this.currentState) {
            this.currentState.Update(timeElapsed, input);
        }
    }
}



// CHARACTER FINITE STATE MACHINE ---------------------------------------------------------------------------------------------
class CharacterFSM extends FiniteStateMachine {
    constructor(proxy) {
        super();
        this.proxy = proxy;
        this.init();
    }

    init() {
        this.AddState('idle', IdleState);
        this.AddState('walkForward', WalkState);
        this.AddState('runForward', RunState);
        this.AddState('pushButton', PushButtonState);
    }
}



// STATES ---------------------------------------------------------------------------------------------

class State {
    constructor(parent) {
        this.parent = parent;
    }

    Enter() { }
    Exit() { }
    Update() { }
};


class IdleState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'idle';
    }

    Enter(prevState) {
        const idleAction = this.parent.proxy.animations['idle'].action;
        if (prevState) {
            // If there was a previous state: Cross fade with previous state
            const prevAction = this.parent.proxy.animations[prevState.Name].action;
            idleAction.time = 0.0;
            idleAction.enabled = true;
            idleAction.setEffectiveTimeScale(1.0);
            idleAction.setEffectiveWeight(1.0);
            idleAction.crossFadeFrom(prevAction, 0.5, true);
            idleAction.play();
        } else {
            // No previous state: Just play
            idleAction.play();
        }
    }

    Exit() {
    }

    Update(_, input) {
        if (input.keys.forward || input.keys.backward) {
            this.parent.SetState('walkForward');
        } else if (input.keys.space) {
            this.parent.SetState('pushButton');
        }
    }
}

class WalkState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'walkForward';
    }

    Enter(prevState) {
        const curAction = this.parent.proxy.animations['walkForward'].action;
        if (prevState) {
            const prevAction = this.parent.proxy.animations[prevState.Name].action;

            curAction.enabled = true;

            if (prevState.Name == 'runForward') {
                const ratio = curAction.getClip().duration / prevAction.getClip().duration;
                curAction.time = prevAction.time * ratio;
            } else {
                curAction.time = 0.0;
                curAction.setEffectiveTimeScale(1.0);
                curAction.setEffectiveWeight(1.0);
            }

            curAction.crossFadeFrom(prevAction, 0.5, true);
            curAction.play();
        } else {
            curAction.play();
        }
    }

    Exit() {
    }

    Update(timeElapsed, input) {
        if (input.keys.forward || input.keys.backward) {
            if (input.keys.shift) {
                this.parent.SetState('runForward');
            }
            return;
        }

        this.parent.SetState('idle');
    }
}

class RunState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'runForward';
    }

    Enter(prevState) {
        const curAction = this.parent.proxy.animations['runForward'].action;
        if (prevState) {
            const prevAction = this.parent.proxy.animations[prevState.Name].action;

            curAction.enabled = true;

            if (prevState.Name == 'walkForward') {
                const ratio = curAction.getClip().duration / prevAction.getClip().duration;
                curAction.time = prevAction.time * ratio;
            } else {
                curAction.time = 0.0;
                curAction.setEffectiveTimeScale(1.0);
                curAction.setEffectiveWeight(1.0);
            }

            curAction.crossFadeFrom(prevAction, 0.5, true);
            curAction.play();
        } else {
            curAction.play();
        }
    }

    Exit() {
    }

    Update(timeElapsed, input) {
        if (input.keys.forward || input.keys.backward) {
            if (!input.keys.shift) {
                this.parent.SetState('walkForward');
            }
            return;
        }

        this.parent.SetState('idle');
    }
}

class PushButtonState extends State {
    constructor(parent) {
        super(parent);

        this.FinishedCallback = () => {
            this.Finished();
        }
    }

    get Name() {
        return 'pushButton';
    }

    Enter(prevState) {
        const curAction = this.parent.proxy.animations['pushButton'].action;
        const mixer = curAction.getMixer();
        mixer.addEventListener('finished', this.FinishedCallback);

        if (prevState) {
            const prevAction = this.parent.proxy.animations[prevState.Name].action;

            curAction.reset();
            curAction.setLoop(THREE.LoopOnce, 1);
            curAction.clampWhenFinished = true;
            curAction.crossFadeFrom(prevAction, 0.2, true);
            curAction.play();
        } else {
            curAction.play();
        }
    }

    Finished() {
        this.Cleanup();
        this.parent.SetState('idle');
    }

    Cleanup() {
        const action = this.parent.proxy.animations['pushButton'].action;

        action.getMixer().removeEventListener('finished', this.CleanupCallback);
    }

    Exit() {
        this.Cleanup();
    }

    Update(_) {
    }
}


















// CHARACTER CONTROLLER INPUT ---------------------------------------------------------------------------------------------
class BasicCharacterControllerInput {
    constructor() {
        this.init();
    }

    init() {
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false,
        };
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }

    onKeyDown(event) {
        switch (event.keyCode) {
            case 87: // w
                this.keys.forward = true;
                break;
            case 65: // a
                this.keys.left = true;
                break;
            case 83: // s
                this.keys.backward = true;
                break;
            case 68: // d
                this.keys.right = true;
                break;
            case 32: // SPACE
                this.keys.space = true;
                break;
            case 16: // SHIFT
                this.keys.shift = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.keyCode) {
            case 87: // w
                this.keys.forward = false;
                break;
            case 65: // a
                this.keys.left = false;
                break;
            case 83: // s
                this.keys.backward = false;
                break;
            case 68: // d
                this.keys.right = false;
                break;
            case 32: // SPACE
                this.keys.space = false;
                break;
            case 16: // SHIFT
                this.keys.shift = false;
                break;
        }
    }
}