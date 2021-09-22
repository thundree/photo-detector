<template>
  <div>
    <Image-Selector />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ImageSelector from "../components/ImageSelector.vue";

export default Vue.extend({
  name: "Home",
  components: {
    ImageSelector
  }
});
</script>
