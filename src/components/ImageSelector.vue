<template>
  <v-container>
    <v-card flat id="img-preview" color="pa-4">
      <v-row>
        <v-col cols="6">
          <v-file-input
            ref="imageFile"
            placeholder="Pick an avatar"
            prepend-icon="mdi-camera"
            accept="image/*"
            label="Sample Image"
            @change="loadImage($event)"
          />
        </v-col>
        <!--  -->
        <v-col cols="6">
          <v-radio-group v-model="aspectRatio" row>
            <v-radio
              v-for="(item, $index) in aspectRatioItems"
              :key="$index"
              :value="item.value"
            >
              <template v-slot:label>
                <v-icon>{{ item.text }}</v-icon>
              </template>
            </v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
      <!--  -->
      <cropper
        v-if="selectedImage"
        ref="cropperCover"
        class="cropper icon"
        :src="selectedImage"
        :check-orientation="true"
        :stencil-props="{
          aspectRatio,
          previewClass: 'cropper-preview'
        }"
        :canvas="{
          height: 420,
          width: 420
        }"
        @change="onImageChange"
      />
      <!--  -->
      <canvas
        v-if="selectedImage"
        ref="mappedImage"
        width="5"
        height="5"
        class="mapped-image"
      ></canvas>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Cropper } from "vue-advanced-cropper";
import { faceDetect, ageAndGenderDetect } from "@/mixins";

export default Vue.extend({
  name: "ImageSelector",
  components: { Cropper },
  data: () => ({
    aspectRatio: 0,
    aspectRatioItems: [
      { value: 0, text: "mdi-crop" },
      { value: 1, text: "mdi-crop-square" },
      { value: 2 / 3, text: "mdi-crop-portrait" },
      { value: 3 / 2, text: "mdi-crop-landscape" }
    ],
    selectedImage: "",
    selectedResult: ""
  }),
  methods: {
    onImageChange(payload: UnknownObj): void {
      const { canvas } = payload;
      const imageData = canvas?.toDataURL() || "";

      this.selectedResult = imageData;

      let image = document.createElement("img");
      image.src = this.selectedResult;

      const referenceCanvas = (this.$refs
        .mappedImage as unknown) as HTMLCanvasElement;

      const ctx = referenceCanvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      faceDetect(image, referenceCanvas);

      setTimeout(() => {
        image = document.createElement("img");
        image.src = referenceCanvas?.toDataURL();

        ageAndGenderDetect(image, referenceCanvas);
      }, 150);
    },
    revokeObject(image: string): void {
      URL.revokeObjectURL(image);
    },
    loadImage(file: File) {
      this.selectedImage = "";

      // Ensure that you have a file before attempting to read it
      if (file) {
        if (this.selectedImage) {
          this.revokeObject(this.selectedImage);
        }
        const reader = new FileReader();
        reader.onload = (e: UnknownObj) => {
          this.selectedImage = e.target.result;
        };
        // Start the reader job - read file as a data url (base64 format)
        reader.readAsDataURL(file as Blob);
      }
    }
  },
  destroyed() {
    // Revoke the object URL, to allow the garbage collector to destroy the uploaded before file
    if (this.selectedImage) {
      this.revokeObject(this.selectedImage);
    }
  }
});
</script>

<style lang="scss" scoped>
#img-preview {
  max-width: 640px;
}
</style>
