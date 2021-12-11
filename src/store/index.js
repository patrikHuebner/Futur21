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
      position: { x: 25, y: 10, z: 25, fov: 60 },
      rotation: { x: 0, y: 0, z: 0 },
      target: { x: -1.9988377007757225, y: 8.263792936014585, z: -1.2845939629740473 },

      // position: { x: 41.31450763329557, y: 15.014963509830297, z: 34.039028154147104, fov: 40 },
      // rotation: { x: -0.30505416758629605, y: 0.8666463345954784, z: 0.23553714393047773 },
      // target: { x: -1.9988377007757225, y: 8.263792936014585, z: -1.2845939629740473 },
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
