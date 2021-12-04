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

      window.addEventListener("keyup", keyup.bind(this));
    });

    function keyup(e) {
      // C > Show camera position and rotation
      if (e.keyCode == 67) {
        let posString = "let position: { x: ";
        posString += threeManager.camera.position.x;
        posString += ", y: ";
        posString += threeManager.camera.position.y;
        posString += ", z: ";
        posString += threeManager.camera.position.z;
        posString += ", fov: ";
        posString += threeManager.camera.fov;
        posString += " };";
        console.log(posString);

        let rotString = "let rotation: { x: ";
        rotString += threeManager.camera.rotation.x;
        rotString += ", y: ";
        rotString += threeManager.camera.rotation.y;
        rotString += ", z: ";
        rotString += threeManager.camera.rotation.z;
        rotString += " };";
        console.log(rotString);


        let targetString = "let target: { x: ";
        targetString += threeManager.controls.target.x;
        targetString += ", y: ";
        targetString += threeManager.controls.target.y;
        targetString += ", z: ";
        targetString += threeManager.controls.target.z;
        targetString += " };";
        console.log(targetString);
      }
    }
  },
};
</script>
