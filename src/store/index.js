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
      position: { x: 7.31820570305854, y: 5.618309558085553, z: 14.191760761832112, fov: 40 },
      rotation: { x: -0.10773526492859463, y: 0.6012496689946079, z: 0.06110370203075244 },
      target: { x: -2.4419250736660736, y: 4.088398892294022, z: 0.0460962514344083 },
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
