<template>
  <div id="WEBGL"></div>
</template>

<script>
import { useStore } from "vuex";
import { ref } from "@vue/reactivity";

import THREE_Manager from "@/managers/THREE_Manager.js";
import { onMounted } from "@vue/runtime-dom";
let threeManager = ref(null); // reference to the THREE.js manager that handles all WebGL operations
export { threeManager }; // export THREE.js manager-reference to expose it to other components

export default {
  name: "DesignSystem",
  setup() {
    const store = useStore();

    onMounted(() => {
      threeManager = new THREE_Manager({
        parentContainer: "WEBGL",
      });
    });
  },
};
</script>
