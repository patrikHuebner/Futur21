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
      position: { x: 5, y: 1, z: 20, fov: 40 },
      keepControlsAboveGround: false,
    },
    colors: {
      background: "#ffffff",
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
