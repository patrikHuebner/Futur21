import { createStore } from 'vuex'

export default createStore({
  state: {
    verbose: true,
    frameCount: 0,
    global: {
      antialiasing: true,
      retinaResolution: true,
      shadows: true,
      capFramerate: false,
      cappedFramerate: 30,
    },
    camera: {
      position: { x: 10.81789415545599, y: 3.955361282972517, z: 16.628889228549898, fov: 40 },
      rotation: { x: 0.008370608022496189, y: 0.6188615413328652, z: -0.004855933743931452 },
      target: { x: -1.470763736318063, y: 4.099791968951813, z: -0.625211345344112 },
      keepControlsAboveGround: true,
    },
    colors: {
      background: "#ffffff",
      primary: ['#333333', '#CCCCCC', '#F1C660', '#D02023', '#E54726', '#23E383', '#108AB2', '#4A57A2', '#94299E']
    }
  },
  mutations: {
    ANIMATION_INCREASE_FRAMECOUNT(state) {
      state.frameCount++;
    },
    CONSOLE_LOG(state, { log }) {
      if (state.verbose) {
        console.log(log);
      }
    },
    CONSOLE_ERROR(state, { log }) {
      console.error(log);
    },
    UPDATE_STATE(state, { parent, key, value }) {
      state[parent][key] = value;
    },
  },
  actions: {
    animation_increaseFrameCount({ commit }) {
      commit('ANIMATION_INCREASE_FRAMECOUNT');
    },
    console({ commit }, { log }) {
      commit('CONSOLE_LOG', { log });
    },
    error({ commit }, { log }) {
      commit('CONSOLE_ERROR', { log });
    },
    updateState({ commit }, { parent, key, value }) {
      commit('UPDATE_STATE', { parent, key, value });
    },
  },
  modules: {
  }
})
