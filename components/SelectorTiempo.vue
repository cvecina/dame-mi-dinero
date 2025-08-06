<template>
  <label class="flex m-2 p-3" for="range">
    <input
      type="range"
      :min="props.min"
      :max="props.max"
      v-model="valueOf"
      class="range range-sm"
      :step="props.step"
    />
    <span class="pl-4">
      {{ valueOf }}
    </span>
  </label>
  <!-- <div class="flex w-full justify-between px-2 text-xs">
    <span v-for="steps in stepsOfValue" :key="steps">|</span>
  </div> -->
</template>

<script setup>
import { defineProps } from "vue";
const props = defineProps({
  min: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
  step: {
    type: Number,
    required: true,
  },
});
const valueOf = ref(props.min);
</script>