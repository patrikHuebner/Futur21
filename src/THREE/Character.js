import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { useStore } from "vuex";




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
        this.AddState('walk', WalkState);
        this.AddState('run', RunState);
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
            this.parent.SetState('walk');
        } else if (input.keys.space) {
            this.parent.SetState('pushButton');
        }
    }
}

class WalkState extends State {

}

class RunState extends State {

}

class PushButtonState extends State {

}


// CHARACTER ---------------------------------------------------------------------------------------------
export default class Character {

    constructor(args) {
        // VueX
        this.store = useStore();

        // Args
        this.three = args.threeManager;
        this.animations = {};

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
            loader.load('Walking.fbx', (a) => { OnLoad('walk', a); });
            loader.load('Running.fbx', (a) => { OnLoad('run', a); });
            loader.load('Button_Pushing.fbx', (a) => { OnLoad('pushButton', a); });
        });
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